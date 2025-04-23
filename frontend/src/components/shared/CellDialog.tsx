import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface CellDialogProps {
  content: string
  title: string
  type: 'code' | 'interview_transcript' | 'feedback' | 'comments'
  isOpen: boolean
  onClose: () => void
  onUpdate?: (newContent: string) => void
  editable?: boolean
  isLoading?: boolean
}

export function CellDialog({ 
  content, 
  title, 
  type, 
  isOpen, 
  onClose,
  onUpdate,
  editable = false,
  isLoading = false
}: CellDialogProps) {
  const [editedContent, setEditedContent] = useState(content || '')

  useEffect(() => {
    setEditedContent(content || '')
  }, [content])

  const handleSave = () => {
    onUpdate?.(editedContent)
  }

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
          ) : editable ? (
            <div className="space-y-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[200px] font-mono"
                placeholder="Enter your comments here..."
                disabled={isLoading}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              {content || "empty"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}