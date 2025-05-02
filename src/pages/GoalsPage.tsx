
import { useState } from "react";
import { PlusCircle, Filter } from "lucide-react";
import { useGoalStore } from "../store/goalStore";
import { GoalList } from "../components/Dashboard/GoalList";
import { GoalFilters } from "../components/Dashboard/GoalFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddGoalModal } from "../components/Dashboard/AddGoalModal";
import { GoalCategory, GoalStatus } from "../types";

const GoalsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const filterCategory = useGoalStore(state => state.filterCategory);
  const filterStatus = useGoalStore(state => state.filterStatus);
  const setFilterCategory = useGoalStore(state => state.setFilterCategory);
  const setFilterStatus = useGoalStore(state => state.setFilterStatus);
  const goals = useGoalStore(state => state.goals);

  // Filter goals based on category and status
  const filteredGoals = goals.filter(goal => {
    const categoryMatch = filterCategory === 'All' || goal.category === filterCategory;
    const statusMatch = filterStatus === 'All' || goal.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Goals</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Goal
        </Button>
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
