import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBlackwords } from '../blackwords-provider'
import { useCreateBlackwordMutation } from '@/features/blackwords/api/blackwords'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { BlackwordCreateData } from '@/features/blackwords/data/schemas'

export function BlackwordsCreateDrawer() {
  const { isCreateDialogOpen, setIsCreateDialogOpen } = useBlackwords()
  const { mutateAsync, isPending } = useCreateBlackwordMutation()

  const [formData, setFormData] = useState<BlackwordCreateData>({
    blackwords_name: '',
    blackwords_slug: '',
    blackwords_collection: [],
    blackwords_readme: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await mutateAsync(formData)
      toast.success('敏感词创建成功')
      setIsCreateDialogOpen(false)
      // 重置表单
      setFormData({
        blackwords_name: '',
        blackwords_slug: '',
        blackwords_collection: [],
        blackwords_readme: ''
      })
    } catch (error) {
      toast.error('创建敏感词失败: ' + (error as Error).message)
    }
  }

  const handleChange = (field: keyof BlackwordCreateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    setIsCreateDialogOpen(false)
    // 重置表单
    setFormData({
      blackwords_name: '',
      blackwords_slug: '',
      blackwords_collection: [],
      blackwords_readme: ''
    })
  }

  return (
    <Drawer open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DrawerContent>
        <div className="max-w-3xl w-full mx-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle>创建新敏感词</DrawerTitle>
            <DrawerDescription>
              填写敏感词信息以创建新的敏感词集合
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
                {isPending ? '创建中...' : '创建'}
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
