[sidebar-data.ts](../src/components/layout/data/sidebar-data.ts) 用于修改侧边栏菜单数据，包括添加、删除和修改菜单项。
[main.tsx](../src/components/layout/main.tsx) 用于修改主布局的样式和行为，包括固定和流式布局。
[websites-columns.tsx](../src/features/websites/components/websites-columns.tsx) 用于修改网站列表的样式和行为，包括添加、删除和修改网站项。比如，添加网站项时，可以添加一个网站图标，并设置网站图标的样式。
[toolbar.tsx](../src/components/data-table/toolbar.tsx) 用于修改工具栏的样式和行为，包括添加、删除和修改工具栏项。比如，添加工具栏项时，可以添加一个工具栏图标，并设置工具栏图标的样式。
[websites-provider.tsx](../src/features/websites/components/websites-provider.tsx) 动作和状态在这里，用于修改网站列表的样式和行为，包括添加、删除和修改网站项。比如，添加网站项时，可以添加一个网站图标，并设置网站图标的样式。

// const [pagination, setPagination] = useState({
//   pageIndex: (pager?.page ?? 1) - 1,
//   pageSize: pager?.size ?? 10,
// })

// 当分页信息变化时，更新表格状态
// useEffect(() => {
//   setPagination({
//     pageIndex: (pager?.page ?? 1) - 1,
//     pageSize: pager?.size ?? 10,
//   })
// }, [pager?.page, pager?.size])

// useEffect(() => {
//   setPagination({
//     pageIndex: (searchParams?.page ?? 1) - 1,
//     pageSize: searchParams?.size ?? 10,
//   })
// }, [searchParams?.page, searchParams?.size])


// 分页状态
const [pagination, setPagination] = useState({
pageIndex: (searchParams?.page ?? 1) - 1,
pageSize: searchParams?.size ?? 10,
})

rowCount: pager?.total ?? 0,
pageCount: pager?.pages ?? -1,





      // setSearchParams({
      //   entrypoint_keyword: searchParams.entrypoint_keyword || undefined,
      //   entrypoint_enabled: searchParams.entrypoint_enabled,
      //   page: newPagination.pageIndex + 1,
      //   size: newPagination.pageSize,
      // })