
import { useState, useEffect } from "react";
import { PlusCircle, Filter } from "lucide-react";
import { useGoalStore } from "../store/goalStore";
import { GoalList } from "../components/Dashboard/GoalList";
import { GoalFilters } from "../components/Dashboard/GoalFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddGoalModal } from "../components/Dashboard/AddGoalModal";
import { GoalCategory, GoalStatus } from "../types";
import { getUsers } from "../services/api/userService";
import { supabase } from "@/integrations/supabase/client";
import { Stats } from "../components/Dashboard/Stats";

// Get the proper types from GoalFilters and AddGoalModal components
interface GoalFiltersProps {
  filterCategory: GoalCategory | 'All';
  filterStatus: GoalStatus | 'All';
  onCategoryChange: (category: GoalCategory | 'All') => void;
  onStatusChange: (status: GoalStatus | 'All') => void;
}

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GoalsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const filterCategory = useGoalStore(state => state.filterCategory);
  const filterStatus = useGoalStore(state => state.filterStatus);
  const setFilterCategory = useGoalStore(state => state.setFilterCategory);
  const setFilterStatus = useGoalStore(state => state.setFilterStatus);
  const goals = useGoalStore(state => state.goals);
  const currentUser = useGoalStore(state => state.currentUser);
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);

  // Filter goals based on category and status
  const filteredGoals = goals.filter(goal => {
    const categoryMatch = filterCategory === 'All' || goal.category === filterCategory;
    const statusMatch = filterStatus === 'All' || goal.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  // Fetch accurate goal completion count when component mounts
  useEffect(() => {
    const fetchCompletedGoalsCount = async () => {
      if (!currentUser) return;
      
      try {
        const users = await getUsers(true);
        const currentUserData = users.find(user => user.id === currentUser.id);
        if (currentUserData) {
          setCompletedGoalsCount(currentUserData.completedGoals);
        }
      } catch (error) {
        console.error("Error fetching completed goals count:", error);
      }
    };
    
    fetchCompletedGoalsCount();
    
    // Set up real-time subscription for completed goals
    const goalsChannel = supabase
      .channel('goals_completion_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: currentUser ? `user_id=eq.${currentUser.id}` : undefined
        },
        () => {
          fetchCompletedGoalsCount();
        }
      )
      .subscribe();
      
    const activitiesChannel = supabase
      .channel('activities_completion_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: currentUser ? `user_id=eq.${currentUser.id}` : undefined
        },
        () => {
          fetchCompletedGoalsCount();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Goals</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Goal
        </Button>
      </div>

      {/* Display stats at the top including completed goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Completed Goals</p>
              <p className="text-2xl font-bold">{completedGoalsCount}</p>
            </div>
            <div className="rounded-full p-2 text-green-500 bg-muted/30">
              <PlusCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GoalFilters 
            filterCategory={filterCategory as GoalCategory | 'All'}
            filterStatus={filterStatus as GoalStatus | 'All'}
            onCategoryChange={setFilterCategory}
            onStatusChange={setFilterStatus}
          />
        </CardContent>
      </Card>

      <GoalList goals={filteredGoals} />
      
      <AddGoalModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />
    </div>
  );
};

export default GoalsPage;
