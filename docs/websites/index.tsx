import { useWebsitesQuery } from '@/features/websites/api/websites';
import { WebsitesDataTable } from './components/websites-data-table';
import { websitesColumns } from './components/websites-columns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { TopNav } from '@/components/layout/top-nav';
import { ThemeSwitch } from '@/components/theme-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ConfigDrawer } from '@/components/config-drawer';
import { useState } from 'react';
import { WebsiteForm } from './components/website-form';

export function Websites() {
  // 获取网站列表数据的查询Hook
  // 返回网站数据数组、加载状态、错误状态和重新查询函数
  const { data: websites = [], isLoading, isError, refetch } = useWebsitesQuery();
  
  // 控制网站表单的打开/关闭状态
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // 存储当前正在编辑的网站信息，新增时为null
  const [editingWebsite, setEditingWebsite] = useState<any>(null);

  // 如果获取数据出错，显示错误信息
  if (isError) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">无法获取网站列表数据</p>
        </div>
      </Main>
    );
  }

  /**
   * 处理添加新网站的操作
   * 将编辑网站设置为null（表示新增），并打开表单
   */
  const handleAddWebsite = () => {
    setEditingWebsite(null);  // 清空编辑的网站信息，表示添加模式
    setIsFormOpen(true);     // 打开表单对话框
  };

  /**
   * 处理编辑网站的操作
   * @param website - 要编辑的网站对象
   */
  const handleEditWebsite = (website: any) => {
    setEditingWebsite(website);  // 设置当前编辑的网站
    setIsFormOpen(true);        // 打开表单对话框
  };

  /**
   * 表单提交成功后的回调函数
   * 重新获取网站列表数据以更新视图
   */
  const handleFormSuccess = () => {
    refetch();  // 重新执行查询以获取最新的网站列表
  };


  /**
   * 扩展网站数据表格的列定义，为操作列添加实际的功能实现
   * 
   * 该部分代码通过遍历原始列定义，找到ID为'actions'的列，
   * 然后为其添加具体的单元格渲染逻辑，实现编辑和复制ID功能
   * 
   * @returns {Array} 扩展后的列定义数组，包含完整的操作功能
   */
  const columnsWithActions = websitesColumns.map((col) => {
    // 检查当前列是否为操作列
    if (col.id === 'actions') {
      // 为操作列添加具体的单元格渲染内容
      return {
        // 保留原始列的所有属性
        ...col,
        // 重写cell属性，定义单元格的渲染内容
        cell: ({ row }: any) => {
          // 获取当前行的原始数据（网站对象）
          const website = row.original;

          return (
            // 使用flex布局，水平排列操作按钮
            <div className="flex space-x-2">
              {/* 编辑按钮 - 点击触发编辑网站功能 */}
              <Button
                variant="ghost"        // 按钮样式：透明背景
                size="sm"              // 按钮尺寸：小号
                onClick={() => handleEditWebsite(website)}  // 点击事件：调用编辑网站处理函数
              >
                Edit
              </Button>
              
              {/* 复制ID按钮 - 点击将网站ID复制到剪贴板 */}
              <Button
                variant="ghost"        // 按钮样式：透明背景
                size="sm"              // 按钮尺寸：小号
                onClick={() => {
                  // 调用浏览器剪贴板API，将网站ID复制到剪贴板
                  navigator.clipboard.writeText(website.website_id);
                }}
              >
                Copy ID
              </Button>
            </div>
          );
        }
      };
    }
    // 如果不是操作列，则返回原始列定义
    return col;
  });

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">网站</h1>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddWebsite}>
              <Plus className="mr-2 h-4 w-4" /> 添加新网站
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>网站管理</CardTitle>
            <CardDescription>
              管理所有网站以及相关设置项
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-lg">加载网站数据中...</p>
              </div>
            ) : (
              <WebsitesDataTable columns={columnsWithActions} data={websites} />
            )}
          </CardContent>
        </Card>
        
        <WebsiteForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          website={editingWebsite}
          onSuccess={handleFormSuccess}
        />
      </Main>
    </>
  );
}

const topNav = [
  {
    title: 'Overview',
    href: 'websites/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'List',
    href: 'websites/list',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: 'websites/analytics',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'websites/settings',
    isActive: false,
    disabled: false,
  },
];