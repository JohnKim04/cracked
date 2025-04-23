export interface MockInterview {
  id: string;
  user_id: string;
  problem: string;
  code: string;
  interview_transcript: string;
  feedback: string;
  date: string;
  comments: string;
}

// Declare module to extend @tanstack/react-table's types
import '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends unknown, TValue> {
    width?: number;
  }
}