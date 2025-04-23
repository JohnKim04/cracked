# Adding Multi-Level Popup Expansion (Row and Cell)

## Overview
Implement two levels of popup expansion:
1. Row-level expansion: Shows all content in a full-detail view
2. Cell-level expansion: Individual cell content in a focused popup

## Technical Approach

### 1. Create Base Dialog Components
First, create the shadcn/ui dialog components:
```tsx
// components/ui/dialog.tsx - Base dialog component
// components/ui/sheet.tsx - For mobile-friendly dialogs
```

### 2. Create Specialized Dialog Components
```tsx
// components/shared/RowDialog.tsx - For full row expansion
// components/shared/CellDialog.tsx - For individual cell expansion
```

### 3. Modify DataTable Component
Add click handlers for:
- Row click (expand all)
- Cell click (expand single cell)
- Prevent cell clicks from triggering row expansion

### 4. Implementation Details

#### Row-Level Expansion
```tsx
// In DataTable.tsx
const [expandedRow, setExpandedRow] = useState<MockInterview | null>(null);

// Row click handler
const handleRowClick = (e: React.MouseEvent, row: MockInterview) => {
  if (e.target === e.currentTarget || e.target.closest('td')?.dataset.expandWithRow) {
    setExpandedRow(row);
  }
};
```

#### Cell-Level Expansion
```tsx
// In Columns.tsx
const [expandedCell, setExpandedCell] = useState<{
  content: string;
  type: 'code' | 'thought' | 'feedback';
  title: string;
} | null>(null);

// Cell click handler
const handleCellClick = (e: React.MouseEvent, content: string, type: string) => {
  e.stopPropagation(); // Prevent row expansion
  setExpandedCell({ content, type, title: type.charAt(0).toUpperCase() + type.slice(1) });
};
```

### 5. UI Components

#### Row Dialog Layout
```tsx
<Dialog>
  <DialogTitle>{row.problem}</DialogTitle>
  <DialogContent>
    <div className="space-y-4">
      <CodeSection code={row.code} />
      <ThoughtSection thought={row.thought_process} />
      <FeedbackSection feedback={row.feedback} />
      <DateSection date={row.date} />
    </div>
  </DialogContent>
</Dialog>
```

#### Cell Dialog Layout
```tsx
<Dialog>
  <DialogTitle>{title}</DialogTitle>
  <DialogContent>
    {type === 'code' ? (
      <CodeSection code={content} />
    ) : (
      <div className="whitespace-pre-wrap">{content}</div>
    )}
  </DialogContent>
</Dialog>
```

### 6. Styling Updates
- Add hover effects on rows and cells
- Visual indicators for expandable content
- Max heights for truncated content
- Responsive design considerations

### 7. Implementation Steps
1. Install shadcn/ui dialog component
2. Create dialog components
3. Modify DataTable for row expansion
4. Update Columns for cell expansion
5. Add click handlers and state management
6. Style and test interactions

## Testing Considerations
- Test both row and cell expansion
- Verify click propagation
- Check mobile responsiveness
- Ensure keyboard navigation
- Test with varying content lengths