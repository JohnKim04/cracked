import supabase from '../lib/supabaseClient';

// Fetch mock interviews for a given user
export async function getUserMockInterviews(userId: string) {
  const { data, error } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
