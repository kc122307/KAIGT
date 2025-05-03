
import { Goal, GoalCategory, GoalStatus } from '../../types';
import { generateId } from '../utils';
import { addActivity } from './activityService';
import { getCurrentUser } from './userService';
import { addNotification } from './notificationService';

// In-memory storage (simulates a database)
let goals: Goal[] = [
  {
    id: '1',
    title: 'Complete React Project',
    description: 'Finish building the React application with all features',
    category: 'Work',
    status: 'In-Progress',
    progress: 75,
    deadline: new Date('2025-06-30'),
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-01'),
    userId: '1',
    isPublic: true,
  },
  {
    id: '2',
    title: 'Run 5K',
    description: 'Train and complete a 5K run',
    category: 'Health',
    status: 'Pending',
    progress: 0,
    deadline: new Date('2025-07-15'),
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-01'),
    userId: '1',
    isPublic: false,
  },
  {
    id: '3',
    title: 'Learn Spanish',
    description: 'Complete beginner level Spanish course',
    category: 'Education',
    status: 'In-Progress',
    progress: 30,
    deadline: new Date('2025-09-01'),
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-01'),
    userId: '1',
    collaborators: [],
    isPublic: true,
  },
  {
    id: '4',
    title: 'Save $5000',
    description: 'Build emergency fund',
    category: 'Finance',
    status: 'In-Progress',
    progress: 40,
    deadline: new Date('2025-12-31'),
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-01'),
    userId: '1',
    isPublic: false,
  },
  {
    id: '5',
    title: 'Read 12 Books',
    description: 'Read one book per month for a year',
    category: 'Personal',
    status: 'Completed',
    progress: 100,
    deadline: new Date('2025-04-30'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-04-15'),
    userId: '1',
    isPublic: true,
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all goals
export const getGoals = async (): Promise<Goal[]> => {
  await delay(300); // Simulate API call
  return [...goals];
};

// Get goals for specific user
export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  await delay(300);
  return goals.filter(goal => goal.userId === userId);
};

// Get a specific goal
export const getGoalById = async (goalId: string): Promise<Goal | undefined> => {
  await delay(200);
  return goals.find(goal => goal.id === goalId);
};

// Create a new goal
export const createGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Goal> => {
  await delay(400);
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const newGoal: Goal = {
    id: generateId(),
    ...goalData,
    userId: user.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  goals = [...goals, newGoal];
  
  // Add activity record
  await addActivity({
    userId: user.id,
    goalId: newGoal.id,
    actionType: 'created',
    details: `Created goal "${newGoal.title}"`
  });
  
  return newGoal;
};

// Update an existing goal
export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<Goal> => {
  await delay(400);
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const goalIndex = goals.findIndex(goal => goal.id === goalId);
  if (goalIndex === -1) {
    throw new Error("Goal not found");
  }
  
  const updatedGoal = { 
    ...goals[goalIndex], 
    ...updates, 
    updatedAt: new Date() 
  };
  
  goals = [
    ...goals.slice(0, goalIndex),
    updatedGoal,
    ...goals.slice(goalIndex + 1)
  ];
  
  // Add activity record
  await addActivity({
    userId: user.id,
    goalId,
    actionType: 'updated',
    details: `Updated goal "${updatedGoal.title}"`
  });
  
  return updatedGoal;
};

// Update goal status
export const updateGoalStatus = async (goalId: string, status: GoalStatus): Promise<Goal> => {
  await delay(300);
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const goalIndex = goals.findIndex(goal => goal.id === goalId);
  if (goalIndex === -1) {
    throw new Error("Goal not found");
  }
  
  const updatedGoal = { 
    ...goals[goalIndex], 
    status,
    progress: status === 'Completed' ? 100 : goals[goalIndex].progress,
    updatedAt: new Date() 
  };
  
  goals = [
    ...goals.slice(0, goalIndex),
    updatedGoal,
    ...goals.slice(goalIndex + 1)
  ];
  
  const actionType = status === 'Completed' ? 'completed' : 'updated';
  const details = status === 'Completed' 
    ? `Completed goal "${updatedGoal.title}"`
    : `Updated status of "${updatedGoal.title}" to ${status}`;
  
  // Add activity record
  await addActivity({
    userId: user.id,
    goalId,
    actionType,
    details
  });
  
  // Add notification if goal is completed
  if (status === 'Completed') {
    await addNotification({
      userId: user.id,
      title: 'Achievement Unlocked',
      message: `Congratulations! You completed "${updatedGoal.title}"`,
      type: 'achievement',
      goalId
    });
  }
  
  return updatedGoal;
};

// Update goal progress
export const updateGoalProgress = async (goalId: string, progress: number): Promise<Goal> => {
  await delay(300);
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const goalIndex = goals.findIndex(goal => goal.id === goalId);
  if (goalIndex === -1) {
    throw new Error("Goal not found");
  }
  
  // Calculate new status based on progress
  let newStatus = goals[goalIndex].status;
  if (progress === 100) {
    newStatus = 'Completed';
  } else if (progress > 0 && goals[goalIndex].status === 'Pending') {
    newStatus = 'In-Progress';
  }
  
  const updatedGoal = { 
    ...goals[goalIndex], 
    progress,
    status: newStatus,
    updatedAt: new Date() 
  };
  
  goals = [
    ...goals.slice(0, goalIndex),
    updatedGoal,
    ...goals.slice(goalIndex + 1)
  ];
  
  // Add activity record
  await addActivity({
    userId: user.id,
    goalId,
    actionType: 'updated',
    details: `Updated progress for "${updatedGoal.title}" to ${progress}%`
  });
  
  return updatedGoal;
};

// Delete a goal
export const deleteGoal = async (goalId: string): Promise<void> => {
  await delay(300);
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const goalToDelete = goals.find(goal => goal.id === goalId);
  if (!goalToDelete) {
    throw new Error("Goal not found");
  }
  
  goals = goals.filter(goal => goal.id !== goalId);
  
  // Add activity record
  await addActivity({
    userId: user.id,
    goalId,
    actionType: 'deleted',
    details: `Deleted goal "${goalToDelete.title}"`
  });
};

// Get goals by filter
export const getFilteredGoals = async (
  userId: string,
  category?: GoalCategory | 'All',
  status?: GoalStatus | 'All'
): Promise<Goal[]> => {
  await delay(300);
  
  return goals.filter(goal => {
    if (goal.userId !== userId) return false;
    if (category && category !== 'All' && goal.category !== category) return false;
    if (status && status !== 'All' && goal.status !== status) return false;
    return true;
  });
};
