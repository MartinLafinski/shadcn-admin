# Prejobs 管理前端重构

## 背景

后台已更新 prejobs API。前端需以 spider-sessions/websites/entrypoints 为标杆全面重构。

## 子任务概览

| # | 子任务 | 涉及文件数 | 依赖 |
|---|---|---|---|
| 1 | Schema 重构 | 1 | — |
| 2 | API 层 + Route | 2 | 子任务1 |
| 3 | 表格层（Table + Columns + TableRow） | 3 | 子任务2 |
| 4 | Provider + Dialogs + RowActions + Search | 4 | 子任务2 |
| 5 | Drawers（Create / Update / Config） | 3 | 子任务1 |
| 6 | Info Dialog 重构 | 1 | 子任务2 |

---

## 子任务 1：Schema 重构

**文件：** `data/schemas.ts`

- 使用 `createEntityToggleWithDisabledSchema('prejob')` 替代 `createEntityToggleSchema`
- `PrejobSchema` 别名删除
- `PrejobData` → `PrejobItemData` 统一
- `PrejobConfigSchema` → `PatchPrejobSchema`
- 批量 schema 重命名对齐
- `PrejobsSchema`/`PrejobsData`/`emptyPrejobsData` 删除
- `PrejobCreateSchema`：移除 `prejob_enabled`/`prejob_config`/`prejob_readme`
- `PrejobUpdateSchema`：同上

---

## 子任务 2：API 层 + Route

**文件：** `api/prejobs.ts`、`routes/.../index.tsx`

- 所有类型引用更新
- `fetchPrejobs` 返回类型内联化
- `usePrejobsQuery` 透参
- Route Zod search params 更新

---

## 子任务 3：表格层

**文件：** 新建 `prejobs-table-row.tsx`、重写 `prejobs-columns.tsx`、重写 `prejobs-table.tsx`

### Columns（重构为 spider-sessions 风格，精简到 ~24 列）

- `select` → `EntitySelectHeader`+`EntitySelectCell`
- `prejob_id` → `EntityIdCell`
- `prejob_name` → `PrejobMiniItemCell`（已有公共组件，加 onClick→configInfo）
- 关联网站 → `WebsiteMiniItemCell`（通过 entrypoint.website）
- 关联入口点 → `EntrypointMiniItemCell`（通过 entrypoint）
- `prejob_count` → `EntityItemCountCell`
- `prejob_status_mini` → `EntityInheritStatusCell`
- 爬虫任务分布 → `EntitySpiderTaskBarHeader`+`EntitySpiderTaskBarCell`
- 状态列 → `EntityEnabledStatusCell`/`EntityLockedCell`/`EntityPausedCell`/`EntityLimitedCell`
- `prejob_level` → Badge
- `created_at`/`updated_at` → `DatetimeCell`
- `prejob_status` → `EntitySelfStatusCell`
- `prejob_enabled` → Switch + `filterFn`
- `actions` → RowActions

### TableRow（新建）

斑马纹 + `after:` 固定列边框

### Table

`getPinningStyles` 复用、`PrejobsTableRow` 替换内联行、header meta 支持、过滤项补全

---

## 子任务 4：Provider + Dialogs + RowActions + Search

- Provider 搜索参数更新
- Dialogs 类型引用更新、Info Dialog 改为 `{prejobId}` 模式
- RowActions → `Row<PrejobItemData>`、共享 handleToggle/renderToggleSubMenu/useCallback
- Search 已有 FilterDropdown（good），参数对齐

---

## 子任务 5：Drawers

- Create/Update 移除 `prejob_enabled`/`prejob_config`/`prejob_readme`
- Config 改用 `ConfigSheet` 模式

---

## 子任务 6：Info Dialog 重构

自 fetch 数据、渐变 Header、JsonView+MDEditor.Markdown、StatCard
