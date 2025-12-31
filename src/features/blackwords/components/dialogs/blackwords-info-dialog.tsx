import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBlackwords } from '../blackwords-provider'
import { useBlackwordQuery } from '@/features/blackwords/api/blackwords'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function BlackwordsInfoDialog() {
  const { blackwordToEdit, setIsEditDialogOpen } = useBlackwords()
  const { data: blackwordData } = useBlackwordQuery(blackwordToEdit || 0)

  if (!blackwordData) {
    return null
  }

  return (
    <Dialog open={!!blackwordToEdit} onOpenChange={(open) => !open && setIsEditDialogOpen(false)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>敏感词详情</DialogTitle>
          <DialogDescription>
            敏感词集合的详细信息
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
              <p>{blackwordData.blackwords_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">名称</h3>
              <p>{blackwordData.blackwords_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">标识符</h3>
              <p>{blackwordData.blackwords_slug}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">状态</h3>
              <Badge variant={blackwordData.blackwords_enabled ? "default" : "secondary"}>
                {blackwordData.blackwords_enabled ? '启用' : '禁用'}
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">敏感词集合</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {blackwordData.blackwords_collection && blackwordData.blackwords_collection.length > 0 ? (
                blackwordData.blackwords_collection.map((word, index) => (
                  <Badge key={index} variant="outline" className="mr-1 mb-1">
                    {word}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">无敏感词</p>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">说明文档</h3>
            <p className="mt-1 whitespace-pre-wrap">{blackwordData.blackwords_readme || '无说明'}</p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">创建时间</h3>
              <p>{blackwordData.created_at}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">更新时间</h3>
              <p>{blackwordData.updated_at}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => setIsEditDialogOpen(false)}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}