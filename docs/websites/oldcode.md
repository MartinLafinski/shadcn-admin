// /**
//  * 处理添加新网站的操作
//  * 将编辑网站设置为null（表示新增），并打开表单
//  */
// const handleAddWebsite = () => {
//   setEditingWebsite(null);  // 清空编辑的网站信息，表示添加模式
//   setIsFormOpen(true);     // 打开表单对话框
// };

// /**
//  * 处理编辑网站的操作
//  * @param website - 要编辑的网站对象
//  */
// const handleEditWebsite = (website: any) => {
//   setEditingWebsite(website);  // 设置当前编辑的网站
//   setIsFormOpen(true);        // 打开表单对话框
// };

// /**
//  * 表单提交成功后的回调函数
//  * 重新获取网站列表数据以更新视图
//  */
// const handleFormSuccess = () => {
//   refetch();  // 重新执行查询以获取最新的网站列表
// };

/**
* 扩展网站数据表格的列定义，为操作列添加实际的功能实现
*
* 该部分代码通过遍历原始列定义，找到ID为'actions'的列，
* 然后为其添加具体的单元格渲染逻辑，实现编辑和复制ID功能
*
* @returns {Array} 扩展后的列定义数组，包含完整的操作功能
  */
  // const columnsWithActions = websitesColumns.map((col) => {
  //   // 检查当前列是否为操作列
  //   if (col.id === 'actions') {
  //     // 为操作列添加具体的单元格渲染内容
  //     return {
  //       // 保留原始列的所有属性
  //       ...col,
  //       // 重写cell属性，定义单元格的渲染内容
  //       cell: ({ row }: any) => {
  //         // 获取当前行的原始数据（网站对象）
  //         const website = row.original;
  //
  //         return (
  //           // 使用flex布局，水平排列操作按钮
  //           <div className="flex space-x-2">
  //             {/* 编辑按钮 - 点击触发编辑网站功能 */}
  //             <Button
  //               variant="ghost"        // 按钮样式：透明背景
  //               size="sm"              // 按钮尺寸：小号
  //               onClick={() => handleEditWebsite(website)}  // 点击事件：调用编辑网站处理函数
  //             >
  //               Edit
  //             </Button>
  //
  //             {/* 复制ID按钮 - 点击将网站ID复制到剪贴板 */}
  //             <Button
  //               variant="ghost"        // 按钮样式：透明背景
  //               size="sm"              // 按钮尺寸：小号
  //               onClick={() => {
  //                 // 调用浏览器剪贴板API，将网站ID复制到剪贴板
  //                 navigator.clipboard.writeText(website.website_id);
  //               }}
  //             >
  //               Copy ID
  //             </Button>
  //           </div>
  //         );
  //       }
  //     };
  //   }
  //   // 如果不是操作列，则返回原始列定义
  //   return col;
  // });

  {/*<Main>*/}
  {/*  <div className="mb-2 flex items-center justify-between space-y-2">*/}
  {/*    <h1 className="text-2xl font-bold tracking-tight">网站</h1>*/}
  {/*    <div className="flex items-center space-x-2">*/}
  {/*      <Button onClick={handleAddWebsite}>*/}
  {/*        <Plus className="mr-2 h-4 w-4" /> 添加新网站*/}
  {/*      </Button>*/}
  {/*    </div>*/}
  {/*  </div>*/}
  {/*  */}
  {/*  <Card>*/}
  {/*    <CardHeader>*/}
  {/*      <CardTitle>网站管理</CardTitle>*/}
  {/*      <CardDescription>*/}
  {/*        管理所有网站以及相关设置项*/}
  {/*      </CardDescription>*/}
  {/*    </CardHeader>*/}
  {/*    <CardContent>*/}
  {/*      {isLoading ? (*/}
  {/*        <div className="flex items-center justify-center h-64">*/}
  {/*          <p className="text-lg">加载网站数据中...</p>*/}
  {/*        </div>*/}
  {/*      ) : (*/}
  {/*        <WebsitesDataTable columns={columnsWithActions} data={websites} />*/}
  {/*      )}*/}
  {/*    </CardContent>*/}
  {/*  </Card>*/}


      {/*  */}
      {/*  <WebsiteForm*/}
      {/*    open={isFormOpen}*/}
      {/*    onOpenChange={setIsFormOpen}*/}
      {/*    website={editingWebsite}*/}
      {/*    onSuccess={handleFormSuccess}*/}
      {/*  />*/}
      {/*</Main>*/}

// const topNav = [
//   {
//     title: 'Overview',
//     href: 'websites/overview',
//     isActive: true,
//     disabled: false,
//   },
//   {
//     title: 'List',
//     href: 'websites/list',
//     isActive: false,
//     disabled: false,
//   },
//   {
//     title: 'Analytics',
//     href: 'websites/analytics',
//     isActive: false,
//     disabled: true,
//   },
//   {
//     title: 'Settings',
//     href: 'websites/settings',
//     isActive: false,
//     disabled: false,
//   },
// ];


// 控制网站表单的打开/关闭状态
const [isFormOpen, setIsFormOpen] = useState(false);

// 存储当前正在编辑的网站信息，新增时为null
const [editingWebsite, setEditingWebsite] = useState<any>(null);

      {/*<div className="flex items-center py-4">*/}
      {/*  <Input*/}
      {/*    placeholder="Filter websites..."*/}
      {/*    value={(table.getColumn("website_name")?.getFilterValue() as string) ?? ""}*/}
      {/*    onChange={(event) =>*/}
      {/*      table.getColumn("website_name")?.setFilterValue(event.target.value)*/}
      {/*    }*/}
      {/*    className="max-w-sm"*/}
      {/*  />*/}
      {/*</div>*/}


interface DataTableProps<TValue> {
// columns: ColumnDef<WebsiteData, TValue>[];
data: WebsiteData[];
}

      {/*<div className="flex items-center justify-end space-x-2 py-4">*/}
      {/*  <div className="flex-1 text-sm text-muted-foreground">*/}
      {/*    {table.getFilteredSelectedRowModel().rows.length} /{" "}*/}
      {/*    {table.getFilteredRowModel().rows.length} 个网站已选择*/}
      {/*  </div>*/}
      {/*  <div className="space-x-2">*/}
      {/*    <Button*/}
      {/*      variant="outline"*/}
      {/*      size="sm"*/}
      {/*      onClick={() => table.previousPage()}*/}
      {/*      disabled={!table.getCanPreviousPage()}*/}
      {/*    >*/}
      {/*      前一页*/}
      {/*    </Button>*/}
      {/*    <Button*/}
      {/*      variant="outline"*/}
      {/*      size="sm"*/}
      {/*      onClick={() => table.nextPage()}*/}
      {/*      disabled={!table.getCanNextPage()}*/}
      {/*    >*/}
      {/*      后一页*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*</div>*/}

// 定义网站相关的类型
// export interface Website {
//   website_id: string;
//   created_at: string;
//   updated_at: string;
//   updated_by: string;
//   website_enabled: boolean;
//   website_name: string;
//   website_slug: string;
//   website_url?: string;
//   website_config: Record<string, any>;
//   website_readme: string;
// }

// export interface CreateWebsiteData {
//   website_name: string;
//   website_slug: string;
//   website_url?: string;
//   website_config?: Record<string, any>;
//   website_readme?: string;
// }

// export interface UpdateWebsiteData {
//   website_name: string;
//   website_slug: string;
//   website_url?: string;
//   website_config?: Record<string, any>;
//   website_readme?: string;
// }