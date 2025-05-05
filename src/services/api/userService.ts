import { supabase } from '@/integrations/supabase/client';
import { User } from '../../types';

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    // First, get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    // Then, get the completed goals count for each user
    const usersWithData = await Promise.all(profiles.map(async (profile) => {
      // Count completed goals for this user
      const { count: completedGoalsCount, error: goalsError } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'Completed');
        
      if (goalsError) {
        console.error('Error counting completed goals:', goalsError);
        return {
          id: profile.id,
          name: profile.name,
          email: '',
          avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
          streakCount: profile.streak_count || 0,
          completedGoals: profile.completed_goals || 0,
        };
      }
      
      // If the count is different from what's stored in the profile,
      // update the profile with the correct count
      const actualCompletedGoals = completedGoalsCount || 0;
      if (actualCompletedGoals !== profile.completed_goals) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ completed_goals: actualCompletedGoals })
          .eq('id', profile.id);
          
        if (updateError) {
          console.error('Error updating completed_goals count:', updateError);
        }
      }
      
      return {
        id: profile.id,
        name: profile.name,
        email: '',
        avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
        streakCount: profile.streak_count || 0,
        completedGoals: actualCompletedGoals,
      };
    }));

    console.log('Users with accurate completion data:', usersWithData);
    return usersWithData;
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw error;
  }
};

// Get a specific user
export const getUserById = async (userId: string): Promise<User | undefined> => {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No rows returned
        return undefined;
      }
      console.error('Error fetching user profile:', profileError);
      throw profileError;
    }
    
    // Get actual completed goals count
    const { count: completedGoalsCount, error: goalsError } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Completed');
      
    if (goalsError) {
      console.error('Error counting completed goals for user:', goalsError);
      throw goalsError;
    }
    
    const actualCompletedGoals = completedGoalsCount || 0;
    
    // Update profile if the count is different
    if (actualCompletedGoals !== profile.completed_goals) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ completed_goals: actualCompletedGoals })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating completed_goals count:', updateError);
      }
    }

    return {
      id: profile.id,
      name: profile.name,
      email: '',
      avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
      streakCount: profile.streak_count || 0,
      completedGoals: actualCompletedGoals,
    };
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
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
  // Count current completed goals for accurate count
  const { count, error: countError } = await supabase
    .from('goals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'Completed');
    
  if (countError) {
    console.error('Error counting completed goals:', countError);
    throw countError;
  }
  
  const completedGoalsCount = count || 0;
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ completed_goals: completedGoalsCount })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating completed goals count:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: '', 
    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
    streakCount: data.streak_count,
    completedGoals: data.completed_goals,
  };
};
