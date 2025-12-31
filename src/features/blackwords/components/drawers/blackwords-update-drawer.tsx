import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBlackwords } from '../blackwords-provider'
import { useBlackwordQuery, useUpdateBlackwordMutation } from '@/features/blackwords/api/blackwords'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { BlackwordUpdateData } from '@/features/blackwords/data/schemas'

export function BlackwordsUpdateDrawer() {
  const { isEditDialogOpen, setIsEditDialogOpen, blackwordToEdit } = useBlackwords()
  const { mutateAsync, isPending } = useUpdateBlackwordMutation()
  
  const { data: blackwordData, isLoading } = useBlackwordQuery(blackwordToEdit || 0)
  
  const [formData, setFormData] = useState<BlackwordUpdateData>({
    blackwords_name: '',
    blackwords_slug: '',
    blackwords_collection: [],
    blackwords_readme: ''
  })

  // 当编辑对话框打开且有blackwordToEdit时，加载数据
  useEffect(() => {
    if (blackwordToEdit && blackwordData) {
      setFormData({
        blackwords_name: blackwordData.blackwords_name,
        blackwords_slug: blackwordData.blackwords_slug,
        blackwords_collection: blackwordData.blackwords_collection,
        blackwords_readme: blackwordData.blackwords_readme
      })
    } else if (!blackwordToEdit) {
      // 重置表单
      setFormData({
        blackwords_name: '',
        blackwords_slug: '',
        blackwords_collection: [],
        blackwords_readme: ''
      })
    }
  }, [blackwordToEdit, blackwordData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!blackwordToEdit) {
      toast.error('未指定要编辑的敏感词')
      return
    }
    
    try {
      await mutateAsync({
        blackwordsId: blackwordToEdit,
        data: formData
      })
      toast.success('敏感词更新成功')
      setIsEditDialogOpen(false)
    } catch (error) {
      toast.error('更新敏感词失败: ' + (error as Error).message)
    }
  }

  const handleChange = (field: keyof BlackwordUpdateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    setIsEditDialogOpen(false)
  }

  if (isLoading) {
    return (
      <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DrawerContent>
          <div className="max-w-3xl w-full mx-auto p-4">
            <DrawerHeader className="text-left">
              <DrawerTitle>编辑敏感词</DrawerTitle>
              <DrawerDescription>
                加载中...
              </DrawerDescription>
            </DrawerHeader>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DrawerContent>
        <div className="max-w-3xl w-full mx-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle>编辑敏感词</DrawerTitle>
            <DrawerDescription>
              修改敏感词信息
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="space-y-4 px-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blackwords_name">敏感词名称 *</Label>
                <Input
                  id="blackwords_name"
                  value={formData.blackwords_name}
                  onChange={(e) => handleChange('blackwords_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blackwords_slug">敏感词标识符 *</Label>
                <Input
                  id="blackwords_slug"
                  value={formData.blackwords_slug}
                  onChange={(e) => handleChange('blackwords_slug', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blackwords_collection">敏感词集合 (每行一个)</Label>
                <Textarea
                  id="blackwords_collection"
                  value={formData.blackwords_collection.join('\n')}
                  onChange={(e) => handleChange('blackwords_collection', e.target.value.split('\n').filter(item => item.trim() !== ''))}
                  placeholder="每行输入一个敏感词"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blackwords_readme">说明文档</Label>
                <Textarea
                  id="blackwords_readme"
                  value={formData.blackwords_readme}
                  onChange={(e) => handleChange('blackwords_readme', e.target.value)}
                  placeholder="输入敏感词集合的说明"
                />
              </div>
            </div>
            <DrawerFooter className="flex flex-row gap-2 pt-4">
              <Button variant="outline" type="button" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '更新中...' : '更新'}
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
