
import { supabase } from '@/integrations/supabase/client';
import { User } from '../../types';

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
  
  return {
    id: profile.id,
    name: profile.name,
    email: user.email || '',
    avatar: profile.avatar || '',
    completedGoals: profile.completed_goals || 0,
    streakCount: profile.streak_count || 0,
    lastActive: profile.updated_at ? new Date(profile.updated_at) : null
  };
};

// Register a new user
export const register = async (name: string, email: string, password: string): Promise<User> => {
  const { data: { user }, error: registerError } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        name: name,
      }
    }
  });
  
  if (registerError) {
    console.error('Error registering user:', registerError);
    throw registerError;
  }
  
  if (!user) {
    throw new Error("User registration failed");
  }
  
  // Create a user profile in the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      name: name,
    })
    .select()
    .single();
    
  if (profileError) {
    console.error('Error creating user profile:', profileError);
    throw profileError;
  }
  
  return {
    id: profile.id,
    name: profile.name,
    email: email,
    avatar: profile.avatar || '',
    completedGoals: profile.completed_goals || 0,
    streakCount: profile.streak_count || 0,
    lastActive: profile.updated_at ? new Date(profile.updated_at) : null
  };
};

// Login an existing user
export const login = async (email: string, password: string): Promise<User> => {
  const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  
  if (loginError) {
    console.error('Error logging in user:', loginError);
    throw loginError;
  }
  
  if (!user) {
    throw new Error("User login failed");
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw profileError;
  }
  
  return {
    id: profile.id,
    name: profile.name,
    email: email,
    avatar: profile.avatar || '',
    completedGoals: profile.completed_goals || 0,
    streakCount: profile.streak_count || 0,
    lastActive: profile.updated_at ? new Date(profile.updated_at) : null
  };
};

// Logout user
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error logging out user:', error);
    throw error;
  }
};

// Get all users with accurate goal counts
export const getUsers = async (forceRefresh = false): Promise<User[]> => {
  // Fetch users from profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }

  // Always calculate fresh counts for accurate data
  const usersWithStats = await Promise.all(profiles.map(async (profile) => {
    try {
      // Get completed goals count
      const { data: completedGoals, error: goalsError } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', profile.id)
        .eq('status', 'Completed');
        
      if (goalsError) {
        console.error(`Error fetching goals for user ${profile.id}:`, goalsError);
      }
      
      // Get all activity to calculate streak
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('timestamp')
        .eq('user_id', profile.id)
        .order('timestamp', { ascending: false });
        
      if (activitiesError) {
        console.error(`Error fetching activities for user ${profile.id}:`, activitiesError);
      }
      
      // Calculate current streak based on daily activities
      let streak = 0;
      if (activities && activities.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Group activities by date
        const activityDates = new Set();
        activities.forEach(activity => {
          const activityDate = new Date(activity.timestamp);
          activityDate.setHours(0, 0, 0, 0);
          activityDates.add(activityDate.getTime());
        });
        
        // Convert to sorted array of dates
        const sortedDates = Array.from(activityDates).sort((a, b) => b - a);
        
        // Calculate streak
        let currentDate = today.getTime();
        for (const dateTime of sortedDates) {
          if (dateTime === currentDate || dateTime === currentDate - 86400000) { // Today or yesterday
            streak++;
            currentDate = dateTime - 86400000; // Move to previous day
          } else {
            break; // Gap in streak
          }
        }
      }
      
      const completedGoalsCount = completedGoals?.length || 0;
      
      return {
        id: profile.id,
        name: profile.name,
        email: '', // Default empty email
        avatar: profile.avatar || '',
        completedGoals: completedGoalsCount,
        streakCount: streak,
        lastActive: profile.updated_at ? new Date(profile.updated_at) : null
      };
    } catch (error) {
      console.error(`Error fetching data for user ${profile.id}:`, error);
      // Return user with default values if we can't get their stats
      return {
        id: profile.id,
        name: profile.name,
        email: '',
        avatar: profile.avatar || '',
        completedGoals: 0,
        streakCount: 0,
        lastActive: profile.updated_at ? new Date(profile.updated_at) : null
      };
    }
  }));
  
  return usersWithStats;
};
