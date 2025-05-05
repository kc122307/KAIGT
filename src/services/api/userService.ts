
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

// Get all users
export const getUsers = async (forceRefresh = false): Promise<User[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Fetch users from profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }

  // If we need fresh counts, we need to calculate them for each user
  if (forceRefresh) {
    // For each profile, fetch their completed goal count and calculate streak
    const usersWithStats = await Promise.all(profiles.map(async (profile) => {
      try {
        // Get completed goals
        const { data: completedGoals, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', profile.id)
          .eq('status', 'Completed');
          
        if (goalsError) throw goalsError;
        
        // Get all activity to calculate streak
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', profile.id)
          .order('timestamp', { ascending: false });
          
        if (activitiesError) throw activitiesError;
        
        // Calculate current streak based on daily activities
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        // Check if there's any activity
        if (activities && activities.length > 0) {
          // Get the date of the most recent activity
          const mostRecentActivity = new Date(activities[0].timestamp);
          mostRecentActivity.setHours(0, 0, 0, 0); // Normalize to start of day
          
          // Compare with today's date
          const isActiveToday = mostRecentActivity.getTime() === currentDate.getTime();
          
          if (isActiveToday) {
            streak = 1; // Always start with 1 for today's activity
            
            // Check consecutive days before today
            let prevDate = new Date(currentDate);
            prevDate.setDate(prevDate.getDate() - 1); // Start checking from yesterday
            
            for (let i = 1; i < activities.length; i++) {
              const activityDate = new Date(activities[i].timestamp);
              activityDate.setHours(0, 0, 0, 0); // Normalize to start of day
              
              // If this activity is from the previous consecutive day
              if (activityDate.getTime() === prevDate.getTime()) {
                streak++;
                // Move to the day before
                prevDate.setDate(prevDate.getDate() - 1);
              } else if (activityDate.getTime() < prevDate.getTime()) {
                // If we skipped a day, stop counting
                break;
              }
            }
          } else {
            // If there's no activity today, but there was yesterday, count the streak without today
            const yesterday = new Date(currentDate);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            
            if (mostRecentActivity.getTime() === yesterday.getTime()) {
              streak = 1; // Start with 1 for yesterday
              
              let prevDate = new Date(yesterday);
              prevDate.setDate(prevDate.getDate() - 1); // Start from the day before yesterday
              
              for (let i = 1; i < activities.length; i++) {
                const activityDate = new Date(activities[i].timestamp);
                activityDate.setHours(0, 0, 0, 0);
                
                if (activityDate.getTime() === prevDate.getTime()) {
                  streak++;
                  prevDate.setDate(prevDate.getDate() - 1);
                } else if (activityDate.getTime() < prevDate.getTime()) {
                  break;
                }
              }
            }
          }
        }
        
        // Log the streak calculation for debugging
        console.log(`User ${profile.name} has streak: ${streak}`);
        
        return {
          id: profile.id,
          name: profile.name,
          email: '', // Default empty email as it's optional in our User type
          avatar: profile.avatar || '',
          completedGoals: completedGoals?.length || 0,
          streakCount: streak,
          lastActive: profile.updated_at ? new Date(profile.updated_at) : null
        };
      } catch (error) {
        console.error(`Error fetching data for user ${profile.id}:`, error);
        // Return user with default values if we can't get their stats
        return {
          id: profile.id,
          name: profile.name,
          email: '', // Default empty email
          avatar: profile.avatar || '',
          completedGoals: 0,
          streakCount: 0,
          lastActive: profile.updated_at ? new Date(profile.updated_at) : null
        };
      }
    }));
    
    return usersWithStats;
  }

  // Convert profiles to User type
  return profiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: '', // Default empty email as it's optional in our User type
    avatar: profile.avatar || '',
    completedGoals: profile.completed_goals || 0,
    streakCount: profile.streak_count || 0,
    lastActive: profile.updated_at ? new Date(profile.updated_at) : null
  }));
};
