import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { MockInterview } from '../../types'

interface RowDialogProps {
  interview: MockInterview | null
  isOpen: boolean
  onClose: () => void
}

export function RowDialog({ interview, isOpen, onClose }: RowDialogProps) {
  if (!interview) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{interview.problem}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Code</h3>
            <div className="font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto">
              {interview.code}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Thought Process</h3>
            <div className="text-sm whitespace-pre-wrap">
              {interview.thought_process}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Feedback</h3>
            <div className="text-sm whitespace-pre-wrap">
              {interview.feedback}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Created At</h3>
            <div className="text-sm">
              {new Date(interview.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}