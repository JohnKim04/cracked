"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { MockInterview } from "../types"
import { CellDialog } from "./shared/CellDialog"
import { RowDialog } from "./shared/RowDialog"

export const columns: ColumnDef<MockInterview>[] = [
  {
    accessorKey: "date_time",
    enableResizing: false,
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date/Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date_time") as string)
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
    minSize: 135,
    maxSize: 300,
    enableResizing: true,
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Problem
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "code",
    minSize: 100,
    maxSize: 400,
    enableResizing: true,
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)
      const code = row.getValue("code") as string

      return (
        <>
          <div
            className="font-mono text-xs bg-muted p-2 rounded-md overflow-hidden max-h-[200px] cursor-pointer hover:bg-muted/70"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
            }}
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
    minSize: 160,
    maxSize: 400,
    enableResizing: true,
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Interview Transcript
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)
      const thought = row.getValue("interview_transcript") as string

      return (
        <>
          <div
            className="w-full truncate cursor-pointer hover:bg-muted/70 rounded-md p-2"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
            }}
            title="Click to expand"
          >
            {thought}
          </div>
          <CellDialog
            content={thought}
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
    minSize: 90,
    maxSize: 300,
    enableResizing: true,
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Feedback
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)
      const feedback = row.getValue("feedback") as string

      return (
        <>
          <div
            className="w-full truncate cursor-pointer hover:bg-muted/70 rounded-md p-2"
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
    id: "actions",
    size: 100,
    enableResizing: true,
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