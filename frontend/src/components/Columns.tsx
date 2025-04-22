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
    accessorKey: "problem",
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
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at") as string)
      return <div>{date.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "thought_process",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Thought Process
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)
      const thought = row.getValue("thought_process") as string
      
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
            title="Thought Process"
            type="thought"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </>
      )
    },
  },
  {
    accessorKey: "feedback",
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