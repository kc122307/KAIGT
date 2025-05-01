
import { useState } from 'react';
import { Goal } from '../../types';
import { GoalCard } from './GoalCard';
import { GoalDetailModal } from './GoalDetailModal';
import { useGoalStore } from '../../store/goalStore';

interface GoalListProps {
  goals: Goal[];
}

export const GoalList = ({ goals }: GoalListProps) => {
  const { selectedGoalId, setSelectedGoalId } = useGoalStore();
  
  const handleGoalClick = (goalId: string) => {
    setSelectedGoalId(goalId);
  };
  
  return (
    <div>
      {goals.length === 0 ? (
        <div className="bg-muted/40 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No goals match your current filters.</p>
          <p className="mt-2">Try adjusting your filters or create a new goal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => handleGoalClick(goal.id)}
            />
          ))}
        </div>
      )}
      
      {selectedGoalId && (
        <GoalDetailModal
          goalId={selectedGoalId}
          onClose={() => setSelectedGoalId(null)}
        />
      )}
    </div>
  );
};
