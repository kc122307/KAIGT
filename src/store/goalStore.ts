
import { create } from 'zustand';
import { Goal, GoalStatus, User, Activity, Notification, GoalCategory } from '../types';
import { 
  getGoals, 
  getUserGoals,
  createGoal, 
  updateGoal, 
  updateGoalStatus, 
  updateGoalProgress, 
  deleteGoal,
  getFilteredGoals
} from '../services/api/goalService';
import {
  getCurrentUser,
  getUsers,
  login as apiLogin,
  logout as apiLogout
} from '../services/api/userService';
import {
  getActivities,
  getRecentActivities
} from '../services/api/activityService';
import {
  getUserNotifications,
  markNotificationAsRead as apiMarkNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/api/notificationService';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalStatus: (id: string, status: GoalStatus) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  setFilterCategory: (category: GoalCategory | 'All') => void;
  setFilterStatus: (status: GoalStatus | 'All') => void;
  setSelectedGoalId: (id: string | null) => void;
  
  // Data loading
  fetchUserData: () => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  // Initial state
  currentUser: getCurrentUser(),
  users: [],
  isAuthenticated: !!getCurrentUser(),
  isDarkMode: false,
  
  goals: [],
  activities: [],
  notifications: [],
  
  isLoading: false,
  selectedGoalId: null,
  filterCategory: 'All',
  filterStatus: 'All',
  
  // Fetch user data on initialization
  fetchUserData: async () => {
    set({ isLoading: true });
    
    try {
      const currentUser = getCurrentUser();
      
      if (currentUser) {
        const [users, goals, activities, notifications] = await Promise.all([
          getUsers(),
          getUserGoals(currentUser.id),
          getActivities(),
          getUserNotifications(currentUser.id)
        ]);
        
        set({
          users,
          goals,
          activities,
          notifications,
          isAuthenticated: true
        });
      } else {
        const users = await getUsers();
        
        set({
          users,
          goals: [],
          activities: [],
          notifications: [],
          isAuthenticated: false
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  // User actions
  login: async (email, password) => {
    set({ isLoading: true });
    
    try {
      const user = await apiLogin(email, password);
      
      // Fetch user data after login
      const [goals, activities, notifications] = await Promise.all([
        getUserGoals(user.id),
        getRecentActivities(user.id),
        getUserNotifications(user.id)
      ]);
      
      set({
        currentUser: user,
        goals,
        activities,
        notifications,
        isAuthenticated: true,
        isLoading: false
      });
      
    } catch (error) {
      set({ isLoading: false });
      console.error("Login failed:", error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await apiLogout();
      
      set({
        currentUser: null,
        goals: [],
        activities: [],
        notifications: [],
        isAuthenticated: false
      });
      
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },
  
  toggleDarkMode: () => {
    set(state => {
      const newDarkMode = !state.isDarkMode;
      document.documentElement.classList.toggle('dark', newDarkMode);
      return { isDarkMode: newDarkMode };
    });
  },
  
  // Goal management
  addGoal: async (goalData) => {
    set({ isLoading: true });
    
    try {
      const newGoal = await createGoal(goalData);
      
      set(state => ({
        goals: [...state.goals, newGoal],
        isLoading: false
      }));
      
      // Refresh activities after adding a goal
      const currentUser = get().currentUser;
      if (currentUser) {
        const activities = await getActivities();
        set({ activities });
      }
      
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to add goal:", error);
      throw error;
    }
  },
  
  updateGoal: async (id, goalData) => {
    set({ isLoading: true });
    
    try {
      await updateGoal(id, goalData);
      
      // Refresh data after updating
      const currentUser = get().currentUser;
      if (currentUser) {
        const [goals, activities] = await Promise.all([
          getUserGoals(currentUser.id),
          getActivities()
        ]);
        
        set({
          goals,
          activities,
          isLoading: false
        });
      }
      
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to update goal:", error);
      throw error;
    }
  },
  
  deleteGoal: async (id) => {
    set({ isLoading: true });
    
    try {
      await deleteGoal(id);
      
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== id),
        selectedGoalId: state.selectedGoalId === id ? null : state.selectedGoalId,
        isLoading: false
      }));
      
      // Refresh activities after deleting a goal
      const currentUser = get().currentUser;
      if (currentUser) {
        const activities = await getActivities();
        set({ activities });
      }
      
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to delete goal:", error);
      throw error;
    }
  },
  
  updateGoalStatus: async (id, status) => {
    set({ isLoading: true });
    
    try {
      await updateGoalStatus(id, status);
      
      // Refresh data after updating status
      const currentUser = get().currentUser;
      if (currentUser) {
        const [goals, activities, notifications] = await Promise.all([
          getUserGoals(currentUser.id),
          getActivities(),
          getUserNotifications(currentUser.id)
        ]);
        
        set({
          goals,
          activities,
          notifications,
          isLoading: false
        });
      }
      
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to update goal status:", error);
      throw error;
    }
  },
  
  updateGoalProgress: async (id, progress) => {
    set({ isLoading: true });
    
    try {
      await updateGoalProgress(id, progress);
      
      // Refresh data after updating progress
      const currentUser = get().currentUser;
      if (currentUser) {
        const [goals, activities] = await Promise.all([
          getUserGoals(currentUser.id),
          getActivities()
        ]);
        
        set({
          goals,
          activities,
          isLoading: false
        });
      }
      
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to update goal progress:", error);
      throw error;
    }
  },
  
  // Notification management
  markNotificationAsRead: async (id) => {
    try {
      await apiMarkNotificationAsRead(id);
      
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      }));
      
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  },
  
  clearAllNotifications: async () => {
    const { currentUser } = get();
    
    if (!currentUser) return;
    
    try {
      await markAllNotificationsAsRead(currentUser.id);
      
      set(state => ({
        notifications: state.notifications.map(notification => ({ ...notification, isRead: true }))
      }));
      
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      throw error;
    }
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

// Initialize data on import
useGoalStore.getState().fetchUserData();
