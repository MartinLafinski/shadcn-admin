# Job Groups 管理前端重构

## 背景

后台已更新 jobgroups API，前端需要以 spider-sessions/websites/entrypoints 为标杆全面重构。

## 子任务概览

| # | 子任务 | 涉及文件数 | 依赖 |
|---|---|---|---|
| 1 | Schema 重构 | 1 | — |
| 2 | API 层 + Route | 2 | 子任务1 |
| 3 | 表格层（Table + Columns + TableRow） | 3 | 子任务2 |
| 4 | Provider + Dialogs + RowActions | 3 | 子任务2 |
| 5 | Drawers 改造（Create / Update / Config） | 3 | 子任务1 |
| 6 | Info Dialog 重构 | 1 | 子任务2 |

---

## 子任务 1：Schema 重构

**文件：** `src/features/jobgroups/data/schemas.ts`

### 改动

- `JobGroupItemSchema` 新增 `jobgroup_expired: z.boolean().default(false)`、`has_expired` 已有
- `JobGroupSchema` 别名删除
- `JobGroupData` → `JobGroupItemData` 统一
- `JobGroupConfigSchema` → `PatchJobGroupSchema`
- 批量 schema：`JobGroupBatchSwitchSchema` → `BatchSwitchJobGroupsSchema`，其余批量同理对齐
- `JobGroupsSchema` / `JobGroupsData` / `emptyJobGroupsData` 删除
- `JobGroupCreateSchema`：移除 `jobgroup_enabled`
- `JobGroupUpdateSchema`：移除 `jobgroup_enabled`、`jobgroup_config`、`jobgroup_readme`

---

## 子任务 2：API 层 + Route

**文件：** `src/features/jobgroups/api/jobgroups.ts`、`src/routes/_authenticated/jobgroups/index.tsx`

### API

- 所有 `JobGroupData` → `JobGroupItemData`
- 所有 `JobGroupsData` → 内联 `{ jobGroups: JobGroupItemData[]; pagination: PaginationInfoData }`
- 所有 `JobGroupConfigData` → `PatchJobGroupData`
- 批量 schema 名对齐
- `fetchJobGroups` 添加 `expired` 参数
- `useJobGroupsQuery` 透传 `expired`

### Route

- Zod search schema 添加 `expired: z.boolean().optional()`

---

## 子任务 3：表格层

**文件：** `jobgroups-table.tsx`、`jobgroups-columns.tsx`、`jobgroups-table-row.tsx`（新建）

### Columns（以 spider-sessions-columns 为模板）

- `select` → `EntitySelectHeader` + `EntitySelectCell`
- `jobgroup_id` → `EntityIdCell`
- `jobgroup_name` → **新建 `JobGroupMiniItemCell`**（点击 → `setOpen('configInfo')`）
- `jobgroup_status_mini` → `EntityInheritStatusCell`
- `jobgroup_spider_task_pie` → `EntitySpiderTasksPieCell`
- `爬虫任务分布` → `EntitySpiderTaskBarHeader` + `EntitySpiderTaskBarCell`
- `jobgroup_enabled_status` → `EntityEnabledStatusCell`
- `jobgroup_locked` → `EntityLockedCell`
- `jobgroup_paused` → `EntityPausedCell`
- `jobgroup_limited` → `EntityLimitedCell`
- `jobgroup_expired` → `EntityExpiredCell`
- `created_at` / `updated_at` → `DatetimeCell`
- `jobgroup_status` → `EntitySelfStatusCell`
- `jobgroup_enabled` → `JobGroupEnabledSwitch` + `filterFn`
- `actions` → `JobGroupsRowActions`

### TableRow（新建）

斑马纹 + `after:` 固定列边框 + `PinningStyles`

### Table

`getPinningStyles` 替换内联 `gps`、`JobGroupsTableRow` 替换内联行、header meta 支持、5 项过滤

---

## 子任务 4：Provider + Dialogs + RowActions

### Provider

- 添加 `'viewWebsite'`（如果 jobgroup 有 website 关联？先不加）等类型
- 搜索参数添加 `expired`

### Dialogs

- Info Dialog 改为 `{ jobgroupId }` props
- Config 改为 `ConfigSheet` 模式（待子任务 5）

### RowActions

- Props → `Row<JobGroupItemData>`
- 使用共享 `handleToggle` + `renderToggleSubMenu` + `useCallback`

---

## 子任务 5：Drawers 改造

- **Create**：移除 `jobgroup_enabled`、`jobgroup_config`、`jobgroup_readme`
- **Update**：同上
- **Config**：改用 `ConfigSheet` + `ConfigJsonField` + `ConfigReadmeField` + `useConfigConflict`

---

## 子任务 6：Info Dialog 重构

以 `spider-sessions-info-dialog` 为模板：
- 自 fetch 数据（`useJobGroupQuery`）
- 渐变 Header + Loading/Error 态
- `StatCard`/`CategoryCard` 展示统计
- 爬虫任务分布进度条
- Readme → `MDEditor.Markdown`
- Config → `JsonView`
