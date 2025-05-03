
import { Activity } from '../../types';
import { generateId } from '../utils';

// In-memory storage (simulates a database)
let activities: Activity[] = [
  {
    id: '1',
    userId: '1',
    goalId: '1',
    actionType: 'created',
    timestamp: new Date('2025-05-01T10:30:00'),
    details: 'Created goal "Complete React Project"',
  },
  {
    id: '2',
    userId: '1',
    goalId: '5',
    actionType: 'completed',
    timestamp: new Date('2025-04-15T14:20:00'),
    details: 'Completed goal "Read 12 Books"',
  },
  {
    id: '3',
    userId: '1',
    goalId: '3',
    actionType: 'updated',
    timestamp: new Date('2025-05-01T16:45:00'),
    details: 'Updated progress for "Learn Spanish" to 30%',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all activities
export const getActivities = async (): Promise<Activity[]> => {
  await delay(300); // Simulate API call
  return [...activities];
};

// Get activities for a specific user
export const getUserActivities = async (userId: string): Promise<Activity[]> => {
  await delay(300);
  return activities.filter(activity => activity.userId === userId);
};

// Get activities for a specific goal
export const getGoalActivities = async (goalId: string): Promise<Activity[]> => {
  await delay(300);
  return activities.filter(activity => activity.goalId === goalId);
};

// Get recent activities with optional limit
export const getRecentActivities = async (userId: string, limit?: number): Promise<Activity[]> => {
  await delay(300);
  
  const userActivities = activities.filter(activity => activity.userId === userId);
  const sortedActivities = userActivities.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  return limit ? sortedActivities.slice(0, limit) : sortedActivities;
};

// Add a new activity
export const addActivity = async (activityData: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> => {
  await delay(300);
  
  const newActivity: Activity = {
    id: generateId(),
    ...activityData,
    timestamp: new Date()
  };
  
  activities = [...activities, newActivity];
  
  return newActivity;
};
