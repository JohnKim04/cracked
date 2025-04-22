import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

interface CellDialogProps {
  content: string
  title: string
  type: 'code' | 'thought' | 'feedback'
  isOpen: boolean
  onClose: () => void
}

export function CellDialog({ content, title, type, isOpen, onClose }: CellDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {type === 'code' ? (
            <div className="font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto">
              {content}
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}