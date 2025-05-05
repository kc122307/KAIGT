
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

  console.log('Raw profiles data from DB:', data);

  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: '', // Email not stored in profiles for privacy
    avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
    streakCount: profile.streak_count || 0,
    completedGoals: profile.completed_goals || 0,
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
  console.log('Attempting login with:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Login error:', error);
    throw error;
  }
  
  if (!data.user) {
    throw new Error('Login failed: No user data returned');
  }
  
  // Wait a moment to ensure the profile is available
  // Sometimes there's a slight delay between auth success and profile availability
  await new Promise(resolve => setTimeout(resolve, 500));
  
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
  console.log('Registering user:', email);
  
  // First check if this user already exists but just needs to verify email
  try {
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (existingUser && existingUser.user) {
      // User exists but probably needs email verification
      // Let's try to resend the verification email
      await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      throw new Error('User already exists. Please verify your email to continue.');
    }
  } catch (err) {
    // If login failed due to invalid credentials, proceed with registration
    // Otherwise rethrow the "user exists" error
    if (!(err instanceof Error) || !err.message.includes('Invalid login credentials')) {
      throw err;
    }
  }
  
  // Proceed with registration
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${window.location.origin}/login`
    }
  });
  
  if (error) {
    console.error('Registration error:', error);
    throw error;
  }
  
  if (!data.user) {
    throw new Error('Registration failed: No user data returned');
  }
  
  console.log('User registered successfully, checking for profile creation...');
  
  // Wait longer for the profile to be created by database trigger
  // The handle_new_user function needs time to run
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check if the profile was created
  try {
    const profile = await getUserById(data.user.id);
    if (!profile) {
      console.error('Profile not created after registration. Creating manually...');
      
      // Create the profile manually if the trigger didn't work
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            name: name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
            streak_count: 0,
            completed_goals: 0
          }
        ])
        .select()
        .single();
      
      if (profileError) {
        console.error('Error creating profile manually:', profileError);
        throw new Error('Failed to create user profile');
      }
      
      return {
        id: profileData.id,
        name: profileData.name,
        email: data.user.email || '',
        avatar: profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.id}`,
        streakCount: profileData.streak_count,
        completedGoals: profileData.completed_goals,
      };
    }
    
    return {
      ...profile,
      email: data.user.email || '',
    };
  } catch (error) {
    console.error('Error checking/creating profile:', error);
    throw new Error('User profile not found after registration');
  }
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
