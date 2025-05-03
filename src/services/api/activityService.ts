
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '../../types';

// Get all activities
export const getActivities = async (): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('timestamp', { ascending: false });
    
  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return data.map(activity => ({
    ...activity,
    timestamp: new Date(activity.timestamp),
  }));
};

// Get activities for a specific user
export const getUserActivities = async (userId: string): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
    
  if (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }

  return data.map(activity => ({
    ...activity,
    timestamp: new Date(activity.timestamp),
  }));
};

// Get activities for a specific goal
export const getGoalActivities = async (goalId: string): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('goal_id', goalId)
    .order('timestamp', { ascending: false });
    
  if (error) {
    console.error('Error fetching goal activities:', error);
    throw error;
  }

  return data.map(activity => ({
    ...activity,
    timestamp: new Date(activity.timestamp),
  }));
};

// Get recent activities with optional limit
export const getRecentActivities = async (userId: string, limit?: number): Promise<Activity[]> => {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
    
  if (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }

  return data.map(activity => ({
    ...activity,
    timestamp: new Date(activity.timestamp),
  }));
};

// Add a new activity
export const addActivity = async (activityData: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> => {
  const { data, error } = await supabase
    .from('activities')
    .insert(activityData)
    .select()
    .single();
    
  if (error) {
    console.error('Error adding activity:', error);
    throw error;
  }

  return {
    ...data,
    timestamp: new Date(data.timestamp),
  };
};
