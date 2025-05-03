
import { useEffect, useState } from 'react';
import { useGoalStore } from '../../store/goalStore';
import { GoalCategory, GoalStatus } from '../../types';
import { GoalList } from './GoalList';
import { GoalFilters } from './GoalFilters';
import { ActivityLog } from '../ActivityLog/ActivityLog';
import { Leaderboard } from '../Leaderboard/Leaderboard';
import { Notifications } from '../Notifications/Notifications';
import { Stats } from './Stats';
import { PlusIcon } from 'lucide-react';
import { AddGoalModal } from './AddGoalModal';
import { getFilteredGoals } from '../../services/api/goalService';

export const Dashboard = () => {
  const { filterCategory, filterStatus, setFilterCategory, setFilterStatus, goals, currentUser } = useGoalStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredGoals, setFilteredGoals] = useState(goals);
  const [isLoading, setIsLoading] = useState(false);
  
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
          if (goal.userId !== currentUser?.id) return false;
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
