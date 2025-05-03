
import { Goal } from '../../types';
import { GoalCard } from './GoalCard';
import { GoalDetailModal } from './GoalDetailModal';
import { useGoalStore } from '../../store/goalStore';
import { Skeleton } from '@/components/ui/skeleton';

interface GoalListProps {
  goals: Goal[];
  isLoading?: boolean;
}

export const GoalList = ({ goals, isLoading = false }: GoalListProps) => {
  const { selectedGoalId, setSelectedGoalId } = useGoalStore();
  
  const handleGoalClick = (goalId: string) => {
    setSelectedGoalId(goalId);
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
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
