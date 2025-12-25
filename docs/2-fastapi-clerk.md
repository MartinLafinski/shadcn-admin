### 思路总览
要让 FastAPI 同步“知道”当前访问是否合法，本质是：让前端把 Clerk 颁发的令牌带到后端，后端用 Clerk 的公钥（JWKS）或官方 SDK 验证该令牌是否合法，然后把通过验证的用户信息注入到路由的依赖中。最常见、最稳妥的做法：

- 前端从 Clerk 拿一个适配后端的 JWT（推荐使用 `JWT Templates`，例如模板名 `backend`）。
- 每个请求把令牌放到 `Authorization: Bearer <token>`。
- FastAPI 端通过 Clerk 的 JWKS 验证该 JWT（校验签名、`iss`、`aud`、`exp` 等）。
- 把验证后的声明信息（如 `sub` = `user_id`、`sid` = `session_id`、自定义角色/权限）注入到依赖中，路由据此判定访问合法性。

下面给出从前端到后端的完整示例与注意点。

---

### 前端（Clerk）如何获得可供后端验证的令牌
- 在 React/TanStack Router 应用里，使用 Clerk 的 `useAuth()`：

```ts
import { useAuth } from '@clerk/clerk-react'

const { getToken } = useAuth()
const token = await getToken({ template: 'backend' }) // 与后端约定使用该模板
// 之后把 token 放到请求头
await fetch('/api/protected', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

- 在 Clerk Dashboard 中创建一个 `JWT Template`（名称如 `backend`），并设置：
    - `Issuer (iss)`: 通常为 `https://<your-clerk-subdomain>.clerk.accounts.dev` 或自定义域下的 Clerk 域。
    - `Audience (aud)`: 设一个你后端会校验的字符串（如 `your-api`）。
    - `Claims`: 你可以加入角色、组织、权限等自定义声明（如 `roles`, `org_id`），便于后端基于这些声明做授权。

> 也可以直接使用 Clerk 的 `session token`（`getToken()` 默认返回），但推荐用专门的 JWT 模板来稳定控制 `aud/claims`，便于后端严格校验。

---

### 后端（FastAPI）验证 Clerk JWT 的两种方式

#### 方式 A：直接用 JWKS + JWT 库验证（通用、无 SDK 依赖）
- 依赖：`PyJWT`（或 `python-jose`），建议再加 `cachetools` 做 JWKS 缓存。

```bash
pip install PyJWT cryptography cachetools
```

- 配置环境变量（举例）：
```
CLERK_JWKS_URL=https://<your-clerk-subdomain>.clerk.accounts.dev/.well-known/jwks.json
CLERK_ISSUER=https://<your-clerk-subdomain>.clerk.accounts.dev
CLERK_AUDIENCE=your-api  # 与 JWT Template 中的 aud 保持一致
```

- 编写 FastAPI 依赖：

```python
# auth.py
import os
from functools import lru_cache
from typing import Any, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import PyJWKClient, InvalidTokenError

security = HTTPBearer(auto_error=True)

@lru_cache()
def get_jwks_client() -> PyJWKClient:
    jwks_url = os.environ["CLERK_JWKS_URL"]
    return PyJWKClient(jwks_url)

ISSUER = os.environ["CLERK_ISSUER"]
AUDIENCE = os.environ.get("CLERK_AUDIENCE")

ALGORITHMS = ["RS256"]  # Clerk 颁发的 JWT 通常是 RS256

async def current_user_claims(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    token = credentials.credentials
    jwks_client = get_jwks_client()
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token).key
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=ALGORITHMS,
            issuer=ISSUER,
            audience=AUDIENCE,
            options={
                "require": ["exp", "iat", "iss", "sub"],
                "verify_aud": AUDIENCE is not None,
            },
        )
        return payload  # e.g. {'sub': 'user_123', 'sid': 'sess_456', 'org_id': '...','roles': ['admin']}
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )
```

- 在路由中使用：

```python
# main.py
from fastapi import FastAPI, Depends
from auth import current_user_claims

app = FastAPI()

@app.get("/api/protected")
def protected_route(claims = Depends(current_user_claims)):
    user_id = claims["sub"]  # Clerk 用户 ID
    # 也可以拿自定义 claims 做授权判断
    return {"ok": True, "user_id": user_id, "claims": claims}
```

- 授权（Authorization）示例：

```python
from fastapi import HTTPException, status

def require_roles(*roles):
    def _dep(claims = Depends(current_user_claims)):
        user_roles = set(claims.get("roles", []))
        if not user_roles.intersection(roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")
        return claims
    return _dep

@app.get("/api/admin-only")
def admin_only(_ = Depends(require_roles("admin"))):
    return {"ok": True}
```

优点：无 SDK 耦合，简单可控；缺点：需要自己管理 JWKS 缓存（上例用 `lru_cache` 已足够应对大多数情况）。

#### 方式 B：使用 Clerk 官方 Python SDK（如已提供）
Clerk 生态主要以前端/Node 较多，如果你使用的是官方 Python SDK（包名可能为 `clerk-sdk` 或后续更新），通常会提供：
- 用 `CLERK_SECRET_KEY` 初始化服务端客户端；
- 验证会话或交换 `session token`；
- 查询用户、组织、权限等信息。

思路同样是：从 `Authorization` 里取出 token → 调用 SDK 的 verify/validate 方法 → 拿到用户/会话信息。具体请按 SDK 文档的依赖注入模式封装一个 FastAPI 依赖（与上面的 `current_user_claims` 一样暴露 `user_id/claims`）。如果你的项目暂无该 SDK，优先采用“方式 A”。

---

### 关于 Cookie 模式与中间层网关
- 如果你用 Clerk 的前端 Cookie（`__session`）而不是显式的 `Authorization`，后端需要能读取该 Cookie 并与 Clerk 的会话验证接口交互。这需要同域或可信代理设置（含 CORS、`SameSite`、`Secure`）。在前后端分离、跨域的常见场景下，推荐“前端显式带 `Authorization: Bearer` 的 JWT”。
- 如果你有 API 网关（如 Nginx/Envoy/Cloudflare Workers），也可在边缘完成 JWT 验签，把用户信息注入到上游（如加 `X-User-Id` 头），FastAPI 只信任来自网关的内部请求。

---

### 常见坑位与对策
- `iss/aud` 不匹配：确保后端校验与 JWT Template 完全一致。
- JWKS 缓存：Clerk 会轮换密钥（`kid`），使用 `PyJWKClient` 会按 `kid` 自动拿对应公钥；建议进程级缓存避免每次拉取。
- 时钟偏差：如果你的容器/主机时钟不准，`exp/iat` 校验会失败。可通过 NTP 保证时间或在 `options` 中设置少量 `leeway`（不建议过大）。
- 多环境配置：开发用 `*.clerk.accounts.dev`，生产用自定义域，分别设置 `CLERK_ISSUER/JWKS_URL`。
- 权限设计：把角色/权限打进 JWT（或用 `org_roles`），后端即可零额外请求完成授权判断；若需最新信息，再用 `CLERK_SECRET_KEY` 调 Clerk Admin API 查询补充。

---

### 一句话总结
- 让前端用 Clerk 的 `getToken({ template: 'backend' })` 取 JWT，并通过 `Authorization: Bearer` 带给后端。
- FastAPI 用 JWKS 验签并校验 `iss/aud/exp`，在依赖中返回 `claims`，路由据此判断合法性与权限。
- 需要更强能力（查询用户、组织等）时，再结合 Clerk 服务端（Admin）API 或 SDK。