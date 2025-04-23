"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { MockInterview } from "../types"
import { CellDialog } from "./shared/CellDialog"
import { RowDialog } from "./shared/RowDialog"
import { updateMockInterviewComments } from "../services/mockInterviewService"

export const columns: ColumnDef<MockInterview>[] = [
  {
    accessorKey: "date",
    meta: { width: 120 },
    header: ({ column }) => {
      return (
        <Button 
          variant="ghost" 
          className="text-foreground hover:text-foreground w-full"
          onClick={(e) => {
            e.stopPropagation();
            column.toggleSorting();
          }}
        >
          <span className="flex items-center justify-center">
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") as string)
      return (
        <div className="flex flex-col">
          <div className="font-medium">{date.toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "problem",
    meta: { width: 140 },
    header: ({ column }) => {
      return (
        <Button 
          variant="ghost" 
          className="text-foreground hover:text-foreground w-full"
          onClick={(e) => {
            e.stopPropagation();
            column.toggleSorting();
          }}
        >
          <span className="flex items-center justify-center">
            Problem
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        </Button>
      )
    },
    cell: ({ row }) => {
      const problem = row.getValue("problem") as string
      return (
        <div className="min-h-[1rem] max-h-[6rem] overflow-hidden" title={problem}>
          {problem}
        </div>
      )
    }
  },
  {
    accessorKey: "code",
    meta: { width: 160 },
    header: () => <div className="text-center font-medium text-muted-foreground">Code</div>,
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)
      const code = row.getValue("code") as string

      return (
        <>
          <div
            className="font-mono text-xs bg-muted p-2 rounded-md min-h-[1rem] max-h-[6rem] overflow-hidden cursor-pointer hover:bg-muted/70"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
            }}
            title="Click to expand"
          >
            {code}
          </div>
          <CellDialog
            content={code}
            title="Code"
            type="code"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </>
      )
    },
  },
  {
    accessorKey: "interview_transcript",
    header: () => <div className="text-center font-medium text-muted-foreground">Interview Transcript</div>,
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)
      const transcript = row.getValue("interview_transcript") as string

      return (
        <>
          <div
            className="min-h-[1rem] max-h-[6rem] overflow-hidden cursor-pointer hover:bg-muted/70 rounded-md p-2"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
            }}
            title="Click to expand"
          >
            {transcript}
          </div>
          <CellDialog
            content={transcript}
            title="Interview Transcript"
            type="interview_transcript"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </>
      )
    },
  },
  {
    accessorKey: "feedback",
    header: () => <div className="text-center font-medium text-muted-foreground">Feedback</div>,
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)
      const feedback = row.getValue("feedback") as string

      return (
        <>
          <div
            className="min-h-[1rem] max-h-[6rem] overflow-hidden cursor-pointer hover:bg-muted/70 rounded-md p-2"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
            }}
            title="Click to expand"
          >
            {feedback}
          </div>
          <CellDialog
            content={feedback}
            title="Feedback"
            type="feedback"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </>
      )
    },
  },
  {
    accessorKey: "comments",
    header: () => <div className="text-center font-medium text-muted-foreground">Comments</div>,
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)
      const [isLoading, setIsLoading] = useState(false)
      const comments = row.getValue("comments") as string

      const handleUpdate = async (newContent: string) => {
        try {
          setIsLoading(true)
          await updateMockInterviewComments(row.original.id, newContent)
          row.original.comments = newContent
        } catch (error) {
          console.error('Failed to update comments:', error)
        } finally {
          setIsLoading(false)
          setIsOpen(false)
        }
      }

      return (
        <>
          <div
            className="min-h-[1rem] max-h-[6rem] overflow-hidden cursor-pointer hover:bg-muted/70 rounded-md p-2"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
            }}
            title="Click to expand"
          >
            {comments?.trim() || "No comments"}
          </div>
          <CellDialog
            content={comments}
            title="Comments"
            type="comments"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onUpdate={handleUpdate}
            editable={true}
            isLoading={isLoading}
          />
        </>
      )
    },
  },
  {
    id: "actions",
    meta: { width: 65 },
    cell: ({ row }) => {
      const [isDetailsOpen, setIsDetailsOpen] = useState(false)

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>Export Solution</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <RowDialog
            interview={row.original}
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
          />
        </>
      )
    },
  },
]