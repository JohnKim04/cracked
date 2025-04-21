export interface User {
  id: string;
  email: string;
  aud: string;
  role?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: Record<string, any>;
  identities?: Array<{
    id: string;
    user_id: string;
    identity_data: Record<string, any>;
    provider: string;
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface MockInterview {
  id: string;
  user_id: string;
  problem: string;
  code: string;
  thought_process: string;
  feedback: string;
  created_at: string;
  updated_at: string;
}