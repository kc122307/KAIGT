
import { supabase } from '@/integrations/supabase/client';
import { User } from '../../types';

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: '', // Email not stored in profiles for privacy
    avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
    streakCount: profile.streak_count,
    completedGoals: profile.completed_goals,
  }));
};

// Get a specific user
export const getUserById = async (userId: string): Promise<User | undefined> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return undefined;
    }
    console.error('Error fetching user:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: '', // Email not stored in profiles for privacy
    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
    streakCount: data.streak_count,
    completedGoals: data.completed_goals,
  };
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  try {
    const user = await getUserById(session.user.id);
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Login a user
export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Login error:', error);
    throw error;
  }
  
  if (!data.user) {
    throw new Error('Login failed');
  }
  
  const profile = await getUserById(data.user.id);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  return {
    ...profile,
    email: data.user.email || '',
  };
};

// Register a new user
export const register = async (name: string, email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      }
    }
  });
  
  if (error) {
    console.error('Registration error:', error);
    throw error;
  }
  
  if (!data.user) {
    throw new Error('Registration failed');
  }
  
  // The profile will be created automatically via trigger
  // Wait a moment for the trigger to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const profile = await getUserById(data.user.id);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  return {
    ...profile,
    email: data.user.email || '',
  };
};

// Logout current user
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Update user streak count
export const updateUserStreakCount = async (userId: string, streakCount: number): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ streak_count: streakCount })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating user streak count:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: '', // Email not stored in profiles for privacy
    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
    streakCount: data.streak_count,
    completedGoals: data.completed_goals,
  };
};

// Increment completed goals count
export const incrementCompletedGoals = async (userId: string): Promise<User> => {
  // First get current count
  const { data: profile } = await supabase
    .from('profiles')
    .select('completed_goals')
    .eq('id', userId)
    .single();
    
  const newCount = (profile?.completed_goals || 0) + 1;
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ completed_goals: newCount })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error incrementing completed goals:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: '', // Email not stored in profiles for privacy
    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
    streakCount: data.streak_count,
    completedGoals: data.completed_goals,
  };
};
