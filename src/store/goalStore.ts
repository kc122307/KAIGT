
import { create } from 'zustand';
import { Goal, GoalStatus, User, Activity, Notification, GoalCategory } from '../types';

// Mock data for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    streakCount: 7,
    completedGoals: 12,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    streakCount: 5,
    completedGoals: 8,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    streakCount: 10,
    completedGoals: 15,
  },
];

const mockGoals: Goal[] = [
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
    collaborators: [mockUsers[1]],
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

const mockActivities: Activity[] = [
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

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Goal Deadline Approaching',
    message: 'Your goal "Complete React Project" is due in 7 days',
    isRead: false,
    timestamp: new Date('2025-05-23T08:00:00'),
    type: 'deadline',
    goalId: '1',
  },
  {
    id: '2',
    userId: '1',
    title: 'Achievement Unlocked',
    message: 'Congratulations! You completed "Read 12 Books"',
    isRead: true,
    timestamp: new Date('2025-04-15T14:30:00'),
    type: 'achievement',
    goalId: '5',
  },
];

interface GoalState {
  // User state
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isDarkMode: boolean;
  
  // Data state
  goals: Goal[];
  activities: Activity[];
  notifications: Notification[];
  
  // UI state
  isLoading: boolean;
  selectedGoalId: string | null;
  filterCategory: GoalCategory | 'All';
  filterStatus: GoalStatus | 'All';
  
  // Actions
  login: (email: string, password: string) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateGoalStatus: (id: string, status: GoalStatus) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  setFilterCategory: (category: GoalCategory | 'All') => void;
  setFilterStatus: (status: GoalStatus | 'All') => void;
  setSelectedGoalId: (id: string | null) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  // Initial state
  currentUser: mockUsers[0],
  users: mockUsers,
  isAuthenticated: true, // For demo purposes, start authenticated
  isDarkMode: false,
  
  goals: mockGoals,
  activities: mockActivities,
  notifications: mockNotifications,
  
  isLoading: false,
  selectedGoalId: null,
  filterCategory: 'All',
  filterStatus: 'All',
  
  // User actions
  login: (email, password) => {
    set({ isLoading: true });
    // Simulate login API call
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      set({
        currentUser: user || null,
        isAuthenticated: !!user,
        isLoading: false
      });
    }, 1000);
  },
  
  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false
    });
  },
  
  toggleDarkMode: () => {
    set(state => {
      const newDarkMode = !state.isDarkMode;
      document.documentElement.classList.toggle('dark', newDarkMode);
      return { isDarkMode: newDarkMode };
    });
  },
  
  // Goal management
  addGoal: (goalData) => {
    set(state => {
      if (!state.currentUser) return state;
      
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...goalData,
        userId: state.currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        userId: state.currentUser.id,
        goalId: newGoal.id,
        actionType: 'created',
        timestamp: new Date(),
        details: `Created goal "${newGoal.title}"`
      };
      
      return {
        goals: [...state.goals, newGoal],
        activities: [...state.activities, newActivity]
      };
    });
  },
  
  updateGoal: (id, goalData) => {
    set(state => {
      if (!state.currentUser) return state;
      
      const updatedGoals = state.goals.map(goal => 
        goal.id === id ? { ...goal, ...goalData, updatedAt: new Date() } : goal
      );
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        userId: state.currentUser.id,
        goalId: id,
        actionType: 'updated',
        timestamp: new Date(),
        details: `Updated goal "${state.goals.find(g => g.id === id)?.title}"`
      };
      
      return {
        goals: updatedGoals,
        activities: [...state.activities, newActivity]
      };
    });
  },
  
  deleteGoal: (id) => {
    set(state => {
      if (!state.currentUser) return state;
      
      const goalToDelete = state.goals.find(g => g.id === id);
      if (!goalToDelete) return state;
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        userId: state.currentUser.id,
        goalId: id,
        actionType: 'deleted',
        timestamp: new Date(),
        details: `Deleted goal "${goalToDelete.title}"`
      };
      
      return {
        goals: state.goals.filter(goal => goal.id !== id),
        activities: [...state.activities, newActivity],
        selectedGoalId: state.selectedGoalId === id ? null : state.selectedGoalId
      };
    });
  },
  
  updateGoalStatus: (id, status) => {
    set(state => {
      if (!state.currentUser) return state;
      
      const updatedGoals = state.goals.map(goal =>
        goal.id === id 
          ? { 
              ...goal, 
              status, 
              progress: status === 'Completed' ? 100 : goal.progress,
              updatedAt: new Date() 
            } 
          : goal
      );
      
      const goalTitle = state.goals.find(g => g.id === id)?.title;
      
      const actionType = status === 'Completed' ? 'completed' : 'updated';
      const details = status === 'Completed' 
        ? `Completed goal "${goalTitle}"` 
        : `Updated status of "${goalTitle}" to ${status}`;
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        userId: state.currentUser.id,
        goalId: id,
        actionType,
        timestamp: new Date(),
        details
      };
      
      // If goal is completed, also add a notification
      let newNotifications = [...state.notifications];
      if (status === 'Completed') {
        newNotifications.push({
          id: Date.now().toString(),
          userId: state.currentUser.id,
          title: 'Achievement Unlocked',
          message: `Congratulations! You completed "${goalTitle}"`,
          isRead: false,
          timestamp: new Date(),
          type: 'achievement',
          goalId: id
        });
      }
      
      return {
        goals: updatedGoals,
        activities: [...state.activities, newActivity],
        notifications: newNotifications
      };
    });
  },
  
  updateGoalProgress: (id, progress) => {
    set(state => {
      if (!state.currentUser) return state;
      
      const updatedGoals = state.goals.map(goal =>
        goal.id === id 
          ? { 
              ...goal, 
              progress,
              status: progress === 100 ? 'Completed' : progress > 0 ? 'In-Progress' : goal.status,
              updatedAt: new Date() 
            } 
          : goal
      );
      
      const goalTitle = state.goals.find(g => g.id === id)?.title;
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        userId: state.currentUser.id,
        goalId: id,
        actionType: 'updated',
        timestamp: new Date(),
        details: `Updated progress for "${goalTitle}" to ${progress}%`
      };
      
      return {
        goals: updatedGoals,
        activities: [...state.activities, newActivity]
      };
    });
  },
  
  // Notification management
  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    }));
  },
  
  clearAllNotifications: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({ ...notification, isRead: true }))
    }));
  },
  
  // Filter management
  setFilterCategory: (category) => {
    set({ filterCategory: category });
  },
  
  setFilterStatus: (status) => {
    set({ filterStatus: status });
  },
  
  setSelectedGoalId: (id) => {
    set({ selectedGoalId: id });
  }
}));
