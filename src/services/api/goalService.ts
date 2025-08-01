import { supabase } from '@/integrations/supabase/client';
import { Goal, GoalCategory, GoalStatus } from '../../types';
import { addActivity } from './activityService';
import { addNotification } from './notificationService';

// Get all goals
export const getGoals = async (): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*');
    
  if (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }

  return data.map(goal => ({
    ...goal,
    deadline: new Date(goal.deadline),
    created_at: new Date(goal.created_at),
    updated_at: new Date(goal.updated_at),
    category: goal.category as GoalCategory,
    status: goal.status as GoalStatus
  }));
};

// Get goals for specific user
export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching user goals:', error);
    throw error;
  }

  return data.map(goal => ({
    ...goal,
    deadline: new Date(goal.deadline),
    created_at: new Date(goal.created_at),
    updated_at: new Date(goal.updated_at),
    category: goal.category as GoalCategory,
    status: goal.status as GoalStatus
  }));
};

// Get a specific goal
export const getGoalById = async (goalId: string): Promise<Goal | undefined> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return undefined;
    }
    console.error('Error fetching goal:', error);
    throw error;
  }

  return {
    ...data,
    deadline: new Date(data.deadline),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    category: data.category as GoalCategory,
    status: data.status as GoalStatus
  };
};

// Create a new goal
export const createGoal = async (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Goal> => {
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('goals')
    .insert({
      ...goalData,
      user_id: session.user.id,
      deadline: goalData.deadline.toISOString(),
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating goal:', error);
    throw error;
  }

  const newGoal = {
    ...data,
    deadline: new Date(data.deadline),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    category: data.category as GoalCategory,
    status: data.status as GoalStatus
  };
  
  // Add activity record
  await addActivity({
    user_id: session.user.id,
    goal_id: newGoal.id,
    action_type: 'created',
    details: `Created goal "${newGoal.title}"`
  });
  
  return newGoal;
};

// Update an existing goal
export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<Goal> => {
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  // Format date fields and prepare updates for Supabase
  const formattedUpdates: Record<string, any> = { ...updates };
  if (updates.deadline && updates.deadline instanceof Date) {
    formattedUpdates.deadline = updates.deadline.toISOString();
  }
  if (updates.created_at && updates.created_at instanceof Date) {
    delete formattedUpdates.created_at; // Don't update created_at
  }
  if (updates.updated_at && updates.updated_at instanceof Date) {
    delete formattedUpdates.updated_at; // Let DB handle this
  }
  
  const { data, error } = await supabase
    .from('goals')
    .update(formattedUpdates)
    .eq('id', goalId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating goal:', error);
    throw error;
  }

  const updatedGoal = {
    ...data,
    deadline: new Date(data.deadline),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    category: data.category as GoalCategory,
    status: data.status as GoalStatus
  };
  
  // Add activity record
  await addActivity({
    user_id: session.user.id,
    goal_id: goalId,
    action_type: 'updated',
    details: `Updated goal "${updatedGoal.title}"`
  });
  
  return updatedGoal;
};

// Update goal status
export const updateGoalStatus = async (goalId: string, status: GoalStatus): Promise<Goal> => {
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  // First, get current goal to determine progress changes
  const { data: currentGoal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single();
    
  if (!currentGoal) {
    throw new Error("Goal not found");
  }
    
  // Apply progress rules based on status transitions
  let newProgress = currentGoal.progress;
  
  if (currentGoal.status === 'Completed' && status === 'Pending') {
    // Completed to Pending: set progress to 0%
    newProgress = 0;
  } else if (status === 'Completed' && (currentGoal.status === 'Pending' || currentGoal.status === 'In-Progress')) {
    // Pending/In-Progress to Completed: set progress to 100%
    newProgress = 100;
  } else if (currentGoal.status === 'Completed' && status === 'In-Progress') {
    // Completed to In-Progress: keep current progress unchanged
    newProgress = currentGoal.progress;
  }
  
  // Update the goal status and progress
  const { data, error } = await supabase
    .from('goals')
    .update({ 
      status, 
      progress: newProgress,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating goal status:', error);
    throw error;
  }

  const updatedGoal = {
    ...data,
    deadline: new Date(data.deadline),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    category: data.category as GoalCategory,
    status: data.status as GoalStatus
  };
  
  const actionType = status === 'Completed' ? 'completed' : 'updated';
  const details = status === 'Completed' 
    ? `Completed goal "${updatedGoal.title}"`
    : `Updated status of "${updatedGoal.title}" to ${status}`;
  
  // Add activity record
  await addActivity({
    user_id: session.user.id,
    goal_id: goalId,
    action_type: actionType,
    details
  });
  
  // Add notification if goal is completed
  if (status === 'Completed') {
    await addNotification({
      user_id: session.user.id,
      title: 'Achievement Unlocked',
      message: `Congratulations! You completed "${updatedGoal.title}"`,
      type: 'achievement',
      goal_id: goalId
    });
    
    // TODO: Update user completed goals count in profile
  }
  
  return updatedGoal;
};

// Update goal progress
export const updateGoalProgress = async (goalId: string, progress: number): Promise<Goal> => {
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  // First, get the current goal to determine if status needs to change
  const { data: currentGoal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single();
    
  // Calculate new status based on progress
  let newStatus = currentGoal.status;
  if (progress === 100) {
    newStatus = 'Completed';
  } else if (progress > 0 && currentGoal.status === 'Pending') {
    newStatus = 'In-Progress';
  }
  
  const { data, error } = await supabase
    .from('goals')
    .update({ 
      progress, 
      status: newStatus,
      updated_at: new Date().toISOString() 
    })
    .eq('id', goalId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating goal progress:', error);
    throw error;
  }

  const updatedGoal = {
    ...data,
    deadline: new Date(data.deadline),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    category: data.category as GoalCategory,
    status: data.status as GoalStatus
  };
  
  // Add activity record
  await addActivity({
    user_id: session.user.id,
    goal_id: goalId,
    action_type: 'updated',
    details: `Updated progress for "${updatedGoal.title}" to ${progress}%`
  });
  
  return updatedGoal;
};

// Delete a goal
export const deleteGoal = async (goalId: string): Promise<void> => {
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  // Get goal title before deletion
  const { data: goalToDelete } = await supabase
    .from('goals')
    .select('title')
    .eq('id', goalId)
    .single();
  
  if (!goalToDelete) {
    throw new Error("Goal not found");
  }
  
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);
    
  if (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
  
  // Add activity record
  await addActivity({
    user_id: session.user.id,
    goal_id: goalId,
    action_type: 'deleted',
    details: `Deleted goal "${goalToDelete.title}"`
  });
};

// Get goals by filter
export const getFilteredGoals = async (
  userId: string,
  category?: GoalCategory | 'All',
  status?: GoalStatus | 'All'
): Promise<Goal[]> => {
  let query = supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId);
  
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  
  if (status && status !== 'All') {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
    
  if (error) {
    console.error('Error fetching filtered goals:', error);
    throw error;
  }

  return data.map(goal => ({
    ...goal,
    deadline: new Date(goal.deadline),
    created_at: new Date(goal.created_at),
    updated_at: new Date(goal.updated_at),
    category: goal.category as GoalCategory,
    status: goal.status as GoalStatus
  }));
};
