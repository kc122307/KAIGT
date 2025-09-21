
import { Goal } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

export const GoalCard = ({ goal, onClick }: GoalCardProps) => {
  const statusColors = {
    'Completed': 'bg-gradient-to-r from-green-500 to-emerald-500',
    'In-Progress': 'bg-gradient-to-r from-blue-500 to-cyan-500', 
    'Pending': 'bg-gradient-to-r from-yellow-500 to-amber-500'
  };

  const categoryIcons = {
    'Personal': '👤',
    'Work': '💼',
    'Health': '🏃‍♂️',
    'Education': '📚',
    'Finance': '💰',
    'Social': '👪'
  };
  
  const daysRemaining = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0 && goal.status !== 'Completed';
  
  return (
    <Card 
      onClick={onClick}
      className="goal-card cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all duration-300 transform overflow-hidden border-0 shadow-lg"
    >
      <div className={cn("w-full h-2", statusColors[goal.status])} />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-center">
            <span className="text-xl animate-bounce">{categoryIcons[goal.category]}</span>
            <p className="text-sm text-muted-foreground">{goal.category}</p>
          </div>
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full transition-all duration-200",
            goal.status === 'Completed' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
            goal.status === 'In-Progress' ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          )}>
            {goal.status}
          </div>
        </div>
        <CardTitle className="text-lg">{goal.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-3 transition-all duration-500">
            <div className="progress-gradient h-full rounded-full" style={{ width: `${goal.progress}%` }} />
          </Progress>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{format(goal.deadline, 'MMM d, yyyy')}</span>
          </div>
          
          {isOverdue ? (
            <span className="text-destructive font-medium animate-pulse">Overdue</span>
          ) : (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{daysRemaining} days left</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
