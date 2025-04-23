import supabase from '../lib/supabaseClient';
import { MockInterview } from '../types';
import { ApiError } from '../types/errors';

export async function getUserMockInterviews(userId: string): Promise<MockInterview[]> {
  try {
    const { data, error } = await supabase
      .from('mock_interviews')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new ApiError(
        error.message,
        error.code ? parseInt(error.code, 10) : undefined,
        error
      );
    }

    if (!data) {
      return [];
    }

    return data as MockInterview[];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch mock interviews', undefined, error);
  }
}

export async function createMockInterview(interview: Omit<MockInterview, 'id' | 'date' | 'updated_at'>): Promise<MockInterview> {
  try {
    const { data, error } = await supabase
      .from('mock_interviews')
      .insert([interview])
      .select()
      .single();

    if (error) {
      throw new ApiError(
        error.message,
        error.code ? parseInt(error.code, 10) : undefined,
        error
      );
    }

    if (!data) {
      throw new ApiError('Failed to create mock interview');
    }

    return data as MockInterview;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to create mock interview', undefined, error);
  }
}

export async function updateMockInterviewComments(interviewId: string, comments: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('mock_interviews')
      .update({ comments })
      .eq('id', interviewId);

    if (error) {
      throw new ApiError(
        error.message,
        error.code ? parseInt(error.code, 10) : undefined,
        error
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update comments', undefined, error);
  }
}
