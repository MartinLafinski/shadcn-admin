# Spider Packages 界面重构任务拆解

## 背景

后台已重写 spider-packages 的 API 和 schema，打开时的 OpenAPI spec 与当前前端差异很大。核心变化：

- `parameter_templates` 从所有 schema 中移除
- 新增完整的 Release 管理体系（增删改查）
- Schema 命名变更、列表返回格式平铺化

## 子任务概览

| # | 子任务 | 涉及文件数 | 依赖 |
|---|---|---|---|
| 1 | Schema 重构 | 1 | — |
| 2 | API 层（含 Release API） | 1 | 子任务1 |
| 3 | 表格层（Table + Columns + TableRow） | 3 | 子任务2 |
| 4 | Provider + Dialogs + RowActions | 3 | 子任务2、子任务3 |
| 5 | Drawers 改造（Create / Update / Config） | 3 | 子任务1 |
| 6 | Releases Dialog + 行级操作 | 1 | 子任务2、子任务4 |

### 依赖图

```
子任务1 (Schema)
  ├──→ 子任务2 (API)
  │     ├──→ 子任务3 (Table)
  │     │     └──→ 子任务4 (Provider/Dialogs/RowActions)
  │     └──→ 子任务6 (Releases Dialog)
  ├──→ 子任务5 (Drawers)
  └── (子任务4、5、6 之间可并行)
```

---

## 子任务 1：Schema 重构

**文件：** `src/features/spider-packages/data/schemas.ts`

### 改动

| 操作 | 内容 |
|---|---|
| 新增 | `SpiderPackageReleaseSchema`（release_id / release_version / release_url / is_prerelease / is_draft / released_at / release_readme / timestamps） |
| 新增 | `CreateSpiderPackageReleaseSchema` |
| 新增 | `UpdateSpiderPackageReleaseSchema` |
| 重写 | `SpiderPackageItemSchema` → `ViewFullSpiderPackageSchema`：新增 `releases`（array）、`latest_release`（nullable），移除 `parameter_templates` |
| 新增 | `ViewSpiderPackageSchema`（无 releases/latest_release） |
| 重写 | `CreateSpiderPackageSchema`：移除 `parameter_templates`、`spider_package_config`、`spider_package_readme` |
| 重写 | `UpdateSpiderPackageSchema`：移除 `parameter_templates`、`spider_package_config`、`spider_package_readme` |
| 重写 | `PatchSpiderPackageSchema`：移除 `parameter_templates`（保留 config/readme） |
| 重命名 | `SpiderPackageBatchSwitchSchema` / `SpiderPackageBatchExportSchema` → `BatchSwitchSpiderPackagesSchema` / `BatchExportSpiderPackagesSchema` |
| 移除 | `SpiderPackagesSchema` / `SpiderPackagesData` / `emptySpiderPackagesData` |
| 移除 | `SpiderPackageSchema` / `SpiderPackageData`（别名） |
| 保留 | `ParameterTemplateSchema` / `ParameterTemplateData`（作为独立类型留在 schemas 中，dicreted 等可能引用到） |
| 保留 | `SpiderPackageSwitchSchema` / `SpiderPackageSwitchData` |

---

## 子任务 2：API 层

**文件：** `src/features/spider-packages/api/spider-packages.ts`

### 改动

| 操作 | 内容 |
|---|---|
| 更新 | 所有类型引用：`SpiderPackageData` → `SpiderPackageItemData`；批量 schema 名对齐 |
| 更新 | `fetchSpiderPackages` 返回类型从 `SpiderPackagesData` → `{ spiderPackages: SpiderPackageItemData[]; pagination: PaginationInfoData }` |
| 新增 | `fetchReleases(spiderPackageId, token): SpiderPackageReleaseData[]` — GET `/spider/packages/{id}/releases/` |
| 新增 | `fetchLatestRelease(spiderPackageId, token): SpiderPackageReleaseData` — GET `/spider/packages/{id}/releases/latest/` |
| 新增 | `createRelease(spiderPackageId, data, token)` — POST `/spider/packages/{id}/releases/` |
| 新增 | `updateRelease(spiderPackageId, releaseId, data, token)` — PUT `/spider/packages/{id}/releases/{releaseId}/` |
| 新增 | `deleteRelease(spiderPackageId, releaseId, token)` — DELETE `/spider/packages/{id}/releases/{releaseId}/` |
| 新增 | `useReleasesQuery(spiderPackageId)` |
| 新增 | `useLatestReleaseQuery(spiderPackageId)` |
| 新增 | `useCreateReleaseMutation()` |
| 新增 | `useUpdateReleaseMutation()` |
| 新增 | `useDeleteReleaseMutation()` |
| 更新 | 所有现有 hooks 的类型引用（`SpiderPackageConfigData` → `PatchSpiderPackageData` 等） |

---

## 子任务 3：表格层

**文件：**
- `src/features/spider-packages/components/spider-packages-table-row.tsx`（新建）
- `src/features/spider-packages/components/spider-packages-columns.tsx`
- `src/features/spider-packages/components/spider-packages-table.tsx`

### spider-packages-table-row.tsx（新建）

完全遵循 `spider-sessions-table-row.tsx` 模式：
- 斑马纹（even `bg-background` / odd `bg-muted/50`）
- 选中行高亮（`!bg-zinc-200 dark:!bg-slate-800`）
- 固定列背景随行奇偶动态适配
- 固定列边框用 `after:` 样式
- Props：`row: Row<SpiderPackageItemData>`, `rowIdx`, `isSelected`, `getPinningStyles`

### spider-packages-columns.tsx

| 列 | 改动 |
|---|---|
| `select` | 内联 `Checkbox` → `EntitySelectHeader` + `EntitySelectCell` |
| `spider_package_id` | 内联 `<span>` → `EntityIdCell` |
| `spider_package_name` | 已有 `SpiderPackageMiniItemCell`，添加 `onClick` → `setOpen('configInfo')` |
| `spider_package_slug` | 保留（内联 `<code>`） |
| `spider_package_version` | **移除** |
| `spider_package_url` | **移除** |
| `releases_count` | **新增**：`EntityItemCountCell` 显示 `releases.length`，点击 → `setOpen('releases')` |
| `latest_release_version` | **新增**：Badge 显示 `latest_release?.release_version`，无 release 时灰色 `-` |
| `created_at` | 保留（`DatetimeCell`） |
| `updated_at` | 保留（`DatetimeCell`） |
| `spider_package_enabled` | 加 `filterFn` |
| `actions` | `row.original` → `row`（对齐 Row 类型重构） |
| 导入新增 | `EntitySelectHeader`, `EntitySelectCell`, `EntityIdCell`, `EntityItemCountCell`；`useSpiderPackagesActions` |

### spider-packages-table.tsx

| 改动 |
|---|
| `getPinningStyles` 替换内联 `gps` 函数（复用 `@/lib/ui-helper`） |
| 表格体行渲染委派给 `SpiderPackagesTableRow` |
| Header 添加 `metaClassName` 提取和应用 |
| Header pinned 边框改 `after:` 样式 |
| Pinning 函数改为普通函数（非 `useCallback`） |
| `SpiderPackagesData` 类型引用更新 |

---

## 子任务 4：Provider + Dialogs + RowActions

**文件：**
- `src/features/spider-packages/components/spider-packages-provider.tsx`
- `src/features/spider-packages/components/spider-packages-dialogs.tsx`
- `src/features/spider-packages/components/actions/spider-packages-row-actions.tsx`

### spider-packages-provider.tsx

| 改动 |
|---|
| `SpiderPackagesDialogType` 添加 `'releases'` |
| 类型引用 `SpiderPackageItemData` 保持（无变化） |

### spider-packages-dialogs.tsx

| 改动 |
|---|
| 新增 `SpiderPackagesReleasesDialog` lazy import |
| 新增渲染块：`open === 'releases' && <SpiderPackagesReleasesDialog ...>` |
| 其他 dialog 类型引用更新 |

### spider-packages-row-actions.tsx

| 改动 |
|---|
| Props 类型从 `{ row: SpiderPackageItemData }` → `{ row: Row<SpiderPackageItemData> }` |
| 数据访问从 `row.xxx` → `row.original.xxx` |
| 使用 `handleToggle` + `renderToggleSubMenu`（与 spider-sessions 对齐） |
| `useCallback` 包裹回调 |

---

## 子任务 5：Drawers 改造

**文件：**
- `src/features/spider-packages/components/drawers/spider-packages-create-drawer.tsx`
- `src/features/spider-packages/components/drawers/spider-packages-update-drawer.tsx`
- `src/features/spider-packages/components/drawers/spider-packages-config-drawer.tsx`

### create-drawer

| 改动 |
|---|
| 移除参数模板 section（`useFieldArray`、`append`/`remove`、所有 `parameter_templates.*` FormField，约 80 行） |
| 移除 `spider_package_config` FormField（JsonEditor + 全屏按钮） |
| 移除 `spider_package_readme` FormField（MDEditor） |
| 移除相关 imports（`Plus`/`Trash2`、`JsonEditor`/`CodeMirror`/`MDEditor` 等） |
| 表单只剩 4 个基础字段：name、slug、version、url |
| 清理 `defaultValues` 中移除的字段 |

### update-drawer

| 改动 |
|---|
| 同上 |

### config-drawer

| 改动 |
|---|
| 移除参数模板 section（`useFieldArray`、`append`/`remove`、所有 `parameter_templates.*` FormField，约 80 行） |
| 移除 `Plus`/`Trash2`/`Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`/`Switch` imports |
| 只保留 `ConfigReadmeField` + `ConfigJsonField` |

---

## 子任务 6：Releases Dialog

**文件：** `src/features/spider-packages/components/dialogs/spider-packages-releases-dialog.tsx`（新建）

### 功能

- Dialog 弹窗展示某爬虫包的所有发布版本
- 顶部 "新增发布" 按钮
- 表格列：version / url / prerelease（Badge）/ draft（Badge）/ 日期 / 操作
- 行级操作：编辑按钮、删除按钮

### 子 Dialog：新增/编辑发布

- Form 字段：
  - `release_version`（Input，必填）
  - `release_url`（Input，必填）
  - `release_readme`（Textarea，可选）
  - `is_prerelease`（Switch）
  - `is_draft`（Switch）
  - `released_at`（DatetimeInput，可选）
- 编辑模式：预填 `currentRelease` 数据
- 删除：ConfirmDialog

### 数据来源

- 列表：`useReleasesQuery(spiderPackageId)`
- 创建：`useCreateReleaseMutation`
- 更新：`useUpdateReleaseMutation`
- 删除：`useDeleteReleaseMutation`
