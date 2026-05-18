# 网站管理界面性能分析与优化方案

## 1. 现象描述
在网站管理界面进行各种 UI 操作（如点击搜索、切换分页、打开编辑对话框等）时，用户能明显感觉到界面响应迟钝，存在明显的掉帧和卡顿现象。

## 2. 核心问题分析

### 2.1 Context 引起的连锁重渲染
`WebsitesProvider` 负责管理页面的全局状态（搜索参数、当前行、对话框状态）。目前的实现中，`WebsitesProvider` 在每次渲染时都会构造一个新的 `value` 对象：
```tsx
// 位于 src/features/websites/components/websites-provider.tsx
return (
    <WebsitesContext value={{ open, setOpen, currentRow, setCurrentRow, searchParams, setSearchParams }}>
        {children}
    </WebsitesContext>
)
```
这导致任何一个状态（如 `open` 或 `currentRow`）发生变化时，所有调用了 `useWebsites()` 的子组件都会强制重新渲染。由于 `WebsitesTable` 及其内部的每一行 `WebsitesRowActions` 都消费了该 Context，点击任何一行的操作按钮都会触发整个表格数千个单元格的重绘。

### 2.2 渲染负载过重
*   **列数极多**：表格定义了约 40 列，默认每页 50 行，渲染单元格总数接近 2000 个。
*   **组件复杂**：大量单元格使用了 `Link`、`Badge`、`Tooltip`、`Button`、`SmartDatetime` 等复杂组件，每个组件都有自己的生命周期和渲染逻辑。
*   **缺乏记忆化**：`WebsitesTable` 的行组件和 `websitesColumns` 的 cell 渲染函数均未进行 `React.memo` 或 `useMemo` 优化。

### 2.3 冗余的状态同步逻辑
URL 状态与本地状态的同步存在于三个层级：
1.  `WebsitesProvider` 的 `useEffect`
2.  `WebsitesContent` (index.tsx) 的 `useEffect`
3.  `WebsitesTable` 对分页状态的独立同步

这种“多头管理”导致在参数变化时会触发多次渲染路径，增加了 JS 引擎的负担。

### 2.4 计算逻辑重复执行
`getPinningStyles`（用于处理列固定样式）在 `WebsitesTable` 的渲染循环中被频繁调用，且没有进行缓存处理。

## 3. 已实施的优化措施

### 3.1 Context 提供者重构 (已完成)
*   **深度拆分 Context**：将 `WebsitesContext` 拆分为 `WebsitesSearchContext`、`WebsitesDialogContext` 和 `WebsitesActionsContext`。
*   **消除无效重绘**：点击行操作（更新 Dialog 状态）不再会导致整个表格（订阅 Search 状态）被动重渲染。
*   **记忆化处理**：使用 `useMemo` 对状态对象和操作方法（Actions）进行记忆化，并确保 Actions 引用在状态变化时保持稳定。

### 3.2 渲染性能优化 (已完成)
*   **行组件记忆化**：提取了 `WebsiteTableRow` 独立组件，并使用 `React.memo` 包裹。
*   **单元格精准重绘**：将复杂 cell 渲染逻辑提取为独立的 `React.memo` 组件，并让需要交互的单元格（如 InfoCell）直接订阅细粒度的 Actions Context。
*   **重型组件按需挂载**：在 `WebsitesDialogs` 中，仅在特定对话框打开时才挂载对应的组件（如 `{open === 'update' && <WebsiteUpdateDrawer />}`），避免了关闭状态下的实例化开销。
*   **代码分割 (Lazy Loading)**：使用 `React.lazy` 异步加载包含 Markdown、JSON 和代码编辑器的重型组件，显著降低主包体积和运行内存。
*   **布局组件保护**：对页面骨架组件（Header, Main, PrimaryActions）应用 `React.memo`。

### 3.3 逻辑精简与双向联动 (已完成)
*   **URL 作为单一事实来源**：确立 URL 参数为搜索和分页的唯一驱动，组件状态仅作为 URL 的实时响应。
*   **简化 Search 同步逻辑**：将 `Search` 组件中散乱的多个同步 Effect 合并，通过受控方式实现稳定的双向联动，既保证了 URL 的联动性，又消除了冗余渲染帧。
*   **降低初始渲染压力**：默认每页数据量从 50 调整为 20。

## 4. 后续建议
*   **虚拟化渲染**：如果未来每页数据量继续增大，建议引入虚拟滚动。
*   **延迟加载**：对于表格中极少查看的列，可以考虑默认隐藏或延迟渲染。
