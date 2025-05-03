import { useEffect, useState } from 'react';
import { useGoalStore } from '../../store/goalStore';
import { GoalCategory, GoalStatus, Goal } from '../../types';
import { GoalList } from './GoalList';
import { GoalFilters } from './GoalFilters';
import { ActivityLog } from '../ActivityLog/ActivityLog';
import { Leaderboard } from '../Leaderboard/Leaderboard';
import { Notifications } from '../Notifications/Notifications';
import { Stats } from './Stats';
import { PlusIcon } from 'lucide-react';
import { AddGoalModal } from './AddGoalModal';
import { getFilteredGoals } from '../../services/api/goalService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const Dashboard = () => {
  const { 
    filterCategory, 
    filterStatus, 
    setFilterCategory, 
    setFilterStatus, 
    goals, 
    currentUser,
    fetchUserData 
  } = useGoalStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredGoals, setFilteredGoals] = useState(goals);
  const [isLoading, setIsLoading] = useState(false);
  
  // Subscribe to real-time updates when component mounts
  useEffect(() => {
    if (!currentUser) return;
    
    // Set up real-time subscriptions for goals, activities, and notifications
    const goalsChannel = supabase
      .channel('public:goals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Goals change received:', payload);
          // Refresh all data to keep everything in sync
          fetchUserData();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Goal Created",
              description: "A new goal has been added to your dashboard.",
            });
          }
        }
      )
      .subscribe();
      
    const activitiesChannel = supabase
      .channel('public:activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Activity change received:', payload);
          fetchUserData();
        }
      )
      .subscribe();
      
    const notificationsChannel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Notification change received:', payload);
          fetchUserData();
          
          toast({
            title: "New Notification",
            description: "You have a new notification.",
          });
        }
      )
      .subscribe();
    
    // Clean up subscriptions when component unmounts
    return () => {
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [currentUser, fetchUserData]);
  
  // Fetch filtered goals when filters change
  useEffect(() => {
    const fetchFilteredGoals = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        const filtered = await getFilteredGoals(
          currentUser.id,
          filterCategory,
          filterStatus
        );
        setFilteredGoals(filtered);
      } catch (error) {
        console.error('Error fetching filtered goals:', error);
        // Fallback to client-side filtering if API fails
        const filtered = goals.filter(goal => {
          if (goal.user_id !== currentUser?.id) return false;
          if (filterCategory !== 'All' && goal.category !== filterCategory) return false;
          if (filterStatus !== 'All' && goal.status !== filterStatus) return false;
          return true;
        });
        setFilteredGoals(filtered);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFilteredGoals();
  }, [goals, currentUser, filterCategory, filterStatus]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="lg:w-3/4 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Goals</h1>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2"
            >
              <PlusIcon size={16} />
              <span>Add Goal</span>
            </button>
          </div>
          
          <Stats />
          
          <GoalFilters 
            filterCategory={filterCategory}
            filterStatus={filterStatus}
            onCategoryChange={setFilterCategory}
            onStatusChange={setFilterStatus}
          />
          
          <GoalList goals={filteredGoals} isLoading={isLoading} />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ActivityLog limit={5} showViewMore={true} />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-1/4 space-y-6">
          <Notifications />
          <Leaderboard />
        </div>
      </div>
      
      {showAddModal && (
        <AddGoalModal 
          open={showAddModal} 
          onOpenChange={setShowAddModal}
        />
      )}
    </div>
  );
};
