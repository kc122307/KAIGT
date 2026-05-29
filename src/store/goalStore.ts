
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
  getFilteredGoals,
  checkInGoal
} from '../services/api/goalService';
import {
  getCurrentUser,
  getUsers,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister
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
import { supabase } from '@/integrations/supabase/client';
import { getUserTeams, getTeamGoals, updateTeamGoal, deleteTeamGoal, checkInTeamGoal } from '../services/api/teamService';

const mapTeamCategoryToGoalCategory = (category: string): GoalCategory => {
  switch (category) {
    case 'Health & Fitness':
      return 'Health';
    case 'Career & Education':
      return 'Education';
    case 'Personal Development':
      return 'Personal';
    case 'Finance':
      return 'Finance';
    case 'Relationships':
    case 'Social':
      return 'Social';
    case 'Hobbies & Creativity':
    case 'Work':
      return 'Work';
    default:
      return 'Personal';
  }
};

const mapTeamStatusToGoalStatus = (status: string): GoalStatus => {
  switch (status) {
    case 'Completed':
      return 'Completed';
    case 'In Progress':
      return 'In-Progress';
    default:
      return 'Pending';
  }
};

const mapGoalStatusToTeamStatus = (status: GoalStatus): 'In Progress' | 'Completed' | 'Cancelled' => {
  switch (status) {
    case 'Completed':
      return 'Completed';
    case 'In-Progress':
      return 'In Progress';
    default:
      return 'Cancelled';
  }
};

const mapGoalCategoryToTeamCategory = (category: GoalCategory): string => {
  switch (category) {
    case 'Health':
      return 'Health & Fitness';
    case 'Education':
      return 'Career & Education';
    case 'Personal':
      return 'Personal Development';
    case 'Finance':
      return 'Finance';
    case 'Social':
      return 'Relationships';
    case 'Work':
      return 'Work';
    default:
      return 'Other';
  }
};

export const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysDifference = (start: Date, end: Date) => {
  const d1 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const d2 = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateHybridProgress = (goal: {
  created_at: Date | string;
  deadline: Date | string;
  completed_days?: number;
}) => {
  const created = new Date(goal.created_at);
  const deadline = new Date(goal.deadline);
  const today = new Date();
  
  const totalDuration = Math.max(1, getDaysDifference(created, deadline));
  const daysPassed = Math.min(totalDuration, Math.max(0, getDaysDifference(created, today)));
  
  const timeProgress = (daysPassed / totalDuration) * 100;
  const completedDays = goal.completed_days || 0;
  const checkInProgress = Math.min(100, (completedDays / totalDuration) * 100);
  
  const overallProgress = Math.min(100, Math.max(0, Math.round((timeProgress * 0.5) + (checkInProgress * 0.5))));
  return {
    timeProgress,
    checkInProgress,
    overallProgress,
    totalDuration,
    daysPassed
  };
};

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
  register: (name: string, email: string, password: string) => Promise<void>;
  toggleDarkMode: () => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalStatus: (id: string, status: GoalStatus) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  checkInGoalAction: (id: string) => Promise<void>;
  
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
  currentUser: null,
  users: [],
  isAuthenticated: false,
  isDarkMode: false,
  
  goals: [],
  activities: [],
  notifications: [],
  
  isLoading: false,
  selectedGoalId: null,
  filterCategory: 'All',
  filterStatus: 'All',
  
  // Fetch user data
  fetchUserData: async () => {
    set({ isLoading: true });
    
    try {
      // Check if the user is authenticated
      const user = await getCurrentUser();
      
      if (user) {
        // User is authenticated, fetch all data
        const [users, personalGoals, activities, notifications, userTeams] = await Promise.all([
          getUsers(),
          getUserGoals(user.id),
          getRecentActivities(user.id, 20),
          getUserNotifications(user.id),
          getUserTeams()
        ]);
        
        // Map personal goals with hybrid progress
        const mappedPersonalGoals = personalGoals.map(goal => {
          const computed = calculateHybridProgress({
            created_at: goal.created_at,
            deadline: goal.deadline,
            completed_days: goal.completed_days
          });
          const finalStatus = computed.overallProgress >= 100 ? 'Completed' : goal.status;
          return {
            ...goal,
            progress: computed.overallProgress,
            status: finalStatus
          };
        });

        // Fetch goals of teams the user belongs to
        let teamGoalsCombined: Goal[] = [];
        try {
          if (userTeams && userTeams.length > 0) {
            const teamGoalsList = await Promise.all(
              userTeams.map(async (team) => {
                const tg = await getTeamGoals(team.id);
                return tg.map(goal => {
                  const computed = calculateHybridProgress({
                    created_at: goal.created_at,
                    deadline: goal.deadline,
                    completed_days: goal.completed_days
                  });
                  const mappedStatus = mapTeamStatusToGoalStatus(goal.status);
                  const finalStatus = computed.overallProgress >= 100 ? 'Completed' : mappedStatus;
                  return {
                    id: goal.id,
                    title: goal.title,
                    description: goal.description,
                    category: mapTeamCategoryToGoalCategory(goal.category),
                    status: finalStatus,
                    progress: computed.overallProgress,
                    deadline: new Date(goal.deadline),
                    created_at: new Date(goal.created_at),
                    updated_at: new Date(goal.updated_at),
                    user_id: goal.created_by,
                    is_public: goal.is_public,
                    is_team_goal: true,
                    team_name: team.name,
                    team_id: team.id,
                    completed_days: goal.completed_days || 0,
                    streak: goal.streak || 0,
                    last_checked_in: goal.last_checked_in
                  } as Goal;
                });
              })
            );
            teamGoalsCombined = teamGoalsList.flat();
          }
        } catch (teamError) {
          console.error("Error fetching team goals for store:", teamError);
        }
        
        set({
          currentUser: user,
          users,
          goals: [...mappedPersonalGoals, ...teamGoalsCombined],
          activities,
          notifications,
          isAuthenticated: true
        });
      } else {
        // No authenticated user, just fetch users (for leaderboard etc.)
        const users = await getUsers();
        
        set({
          currentUser: null,
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
  
  // Authentication actions
  login: async (email, password) => {
    set({ isLoading: true });
    
    try {
      const user = await apiLogin(email, password);
      set({
        currentUser: user,
        isAuthenticated: true
      });
      await get().fetchUserData();
    } catch (error) {
      set({ isLoading: false });
      console.error("Login failed:", error);
      throw error;
    }
  },
  
  register: async (name, email, password) => {
    set({ isLoading: true });
    
    try {
      const user = await apiRegister(name, email, password);
      
      set({
        currentUser: user,
        goals: [],
        activities: [],
        notifications: [],
        isAuthenticated: true,
        isLoading: false
      });
      
    } catch (error) {
      set({ isLoading: false });
      console.error("Registration failed:", error);
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
      
      // Clear any stored paths and redirect to login
      sessionStorage.removeItem('lastVisitedPath');
      
      // Force redirect to login page
      window.location.href = '/login';
      
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
        const activities = await getRecentActivities(currentUser.id, 20);
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
      const targetGoal = get().goals.find(g => g.id === id);
      if (targetGoal?.is_team_goal) {
        await updateTeamGoal(id, {
          title: goalData.title,
          description: goalData.description,
          category: goalData.category ? mapGoalCategoryToTeamCategory(goalData.category) : undefined,
          deadline: goalData.deadline ? new Date(goalData.deadline).toISOString().split('T')[0] : undefined,
          status: goalData.status ? mapGoalStatusToTeamStatus(goalData.status) : undefined
        });
      } else {
        await updateGoal(id, goalData);
      }
      
      await get().fetchUserData();
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to update goal:", error);
      throw error;
    }
  },
  
  deleteGoal: async (id) => {
    set({ isLoading: true });
    
    try {
      const targetGoal = get().goals.find(g => g.id === id);
      if (targetGoal?.is_team_goal) {
        await deleteTeamGoal(id);
      } else {
        await deleteGoal(id);
      }
      
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== id),
        selectedGoalId: state.selectedGoalId === id ? null : state.selectedGoalId,
        isLoading: false
      }));
      
      // Refresh activities after deleting a goal
      const currentUser = get().currentUser;
      if (currentUser) {
        const activities = await getRecentActivities(currentUser.id, 20);
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
      const targetGoal = get().goals.find(g => g.id === id);
      if (targetGoal?.is_team_goal) {
        await updateTeamGoal(id, { status: mapGoalStatusToTeamStatus(status) });
      } else {
        await updateGoalStatus(id, status);
      }
      
      await get().fetchUserData();
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to update goal status:", error);
      throw error;
    }
  },
  
  updateGoalProgress: async (id, progress) => {
    set({ isLoading: true });
    
    try {
      const targetGoal = get().goals.find(g => g.id === id);
      if (targetGoal?.is_team_goal) {
        await updateTeamGoal(id, { progress });
      } else {
        await updateGoalProgress(id, progress);
      }
      
      await get().fetchUserData();
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to update goal progress:", error);
      throw error;
    }
  },

  checkInGoalAction: async (id) => {
    set({ isLoading: true });
    try {
      const targetGoal = get().goals.find(g => g.id === id);
      if (!targetGoal) {
        throw new Error("Goal not found");
      }

      const todayStr = getLocalDateString(new Date());
      const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));

      const lastCheckedIn = targetGoal.last_checked_in || null;
      let newStreak = targetGoal.streak || 0;
      let newCompletedDays = targetGoal.completed_days || 0;

      if (lastCheckedIn === todayStr) {
        // Already checked in today
        set({ isLoading: false });
        return;
      } else if (lastCheckedIn === yesterdayStr) {
        newStreak += 1;
        newCompletedDays += 1;
      } else {
        newStreak = 1;
        newCompletedDays += 1;
      }

      // Calculate progress and status using the new completed_days
      const computed = calculateHybridProgress({
        created_at: targetGoal.created_at,
        deadline: targetGoal.deadline,
        completed_days: newCompletedDays
      });

      const newProgress = computed.overallProgress;
      const newStatus: GoalStatus = newProgress >= 100 ? 'Completed' : 'In-Progress';

      if (targetGoal.is_team_goal) {
        await checkInTeamGoal(id, {
          completed_days: newCompletedDays,
          streak: newStreak,
          last_checked_in: todayStr,
          progress: newProgress,
          status: mapGoalStatusToTeamStatus(newStatus)
        });
      } else {
        await checkInGoal(id, {
          completed_days: newCompletedDays,
          streak: newStreak,
          last_checked_in: todayStr,
          progress: newProgress,
          status: newStatus
        });
      }

      await get().fetchUserData();
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to check in goal:", error);
      throw error;
    }
  },
  
  // Notification management
  markNotificationAsRead: async (id) => {
    try {
      await apiMarkNotificationAsRead(id);
      
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
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
        notifications: state.notifications.map(notification => ({ ...notification, is_read: true }))
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

// Setup real-time listeners
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    useGoalStore.getState().fetchUserData();
  } else if (event === 'SIGNED_OUT') {
    useGoalStore.setState({
      currentUser: null,
      goals: [],
      activities: [],
      notifications: [],
      isAuthenticated: false
    });
  }
});

// Initialize data on import
useGoalStore.getState().fetchUserData();
