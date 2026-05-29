import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGoalStore, calculateHybridProgress, getLocalDateString } from "../../store/goalStore";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Trash, Edit, Check, X, Users, Share2, Sparkles } from "lucide-react";
import { format } from 'date-fns';
import { EditGoalForm } from "./EditGoalForm";
import { GoalStatus } from "../../types";
import { cn } from "@/lib/utils";

interface GoalDetailModalProps {
  goalId: string;
  onClose: () => void;
}

export const GoalDetailModal = ({ goalId, onClose }: GoalDetailModalProps) => {
  const { goals, updateGoalStatus, deleteGoal, checkInGoalAction } = useGoalStore();
  const goal = goals.find(g => g.id === goalId);
  const [isEditing, setIsEditing] = useState(false);
  
  if (!goal) {
    onClose();
    return null;
  }
  
  const todayStr = getLocalDateString(new Date());
  const isCheckedInToday = goal.last_checked_in === todayStr;

  const { timeProgress, checkInProgress, overallProgress, totalDuration, daysPassed } = calculateHybridProgress({
    created_at: goal.created_at,
    deadline: goal.deadline,
    completed_days: goal.completed_days
  });

  const daysRemaining = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0 && goal.status !== 'Completed';
  
  const handleStatusChange = (newStatus: GoalStatus) => {
    updateGoalStatus(goal.id, newStatus);
  };
  
  const handleDeleteGoal = () => {
    deleteGoal(goal.id);
    onClose();
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
              <DialogDescription>Modify your goal details and deadline.</DialogDescription>
            </DialogHeader>
            <EditGoalForm goal={goal} onClose={() => setIsEditing(false)} />
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-2 py-1 rounded-md bg-primary/10 text-primary">
                      {goal.category}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded-md ${
                      goal.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      goal.status === 'In-Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  <DialogTitle className="text-xl font-bold">{goal.title}</DialogTitle>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={handleDeleteGoal}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogDescription className="mt-2 text-sm text-muted-foreground">
                {goal.description || "No description provided for this goal."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 my-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Deadline: {format(goal.deadline, 'MMMM d, yyyy')}</span>
                </div>
                
                {isOverdue ? (
                  <span className="text-destructive font-medium animate-pulse">Overdue</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{daysRemaining} days remaining</span>
                  </div>
                )}
              </div>
              
              {/* Daily Habit Check-In Panel */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border/50 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-1">
                      Daily Check-In
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Mark your progress daily to build your habit streak.
                    </p>
                  </div>
                  {goal.streak && goal.streak > 0 ? (
                    <div className="text-orange-600 font-bold text-sm bg-orange-100 dark:bg-orange-950/40 px-2.5 py-1 rounded-full flex items-center gap-1 border border-orange-200/20">
                      🔥 {goal.streak} Streak
                    </div>
                  ) : null}
                </div>

                <Button
                  onClick={() => checkInGoalAction(goal.id)}
                  disabled={isCheckedInToday || goal.status === 'Completed'}
                  className={cn(
                    "w-full py-6 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl transition-all duration-300",
                    isCheckedInToday
                      ? "bg-green-600 hover:bg-green-700 text-white cursor-default opacity-95"
                      : goal.status === 'Completed'
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  )}
                >
                  {isCheckedInToday ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>Checked In for Today!</span>
                    </>
                  ) : goal.status === 'Completed' ? (
                    <span>Goal Completed! 🎉</span>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
                      <span>Check-In for Today (+1 Day)</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Hybrid Progress Breakdown */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-base">Overall Hybrid Progress</span>
                    <span className="font-bold text-base text-primary">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3.5 transition-all duration-500">
                    <div className="progress-gradient h-full rounded-full" style={{ width: `${overallProgress}%` }} />
                  </Progress>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Time progress */}
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/30 space-y-1.5">
                    <span className="text-xs text-muted-foreground font-medium block">Time Elapsed (50%)</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold">{Math.round(timeProgress)}%</span>
                      <span className="text-xs text-muted-foreground">{daysPassed} / {totalDuration} Days</span>
                    </div>
                    <Progress value={timeProgress} className="h-1.5" />
                  </div>

                  {/* Check-in progress */}
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/30 space-y-1.5">
                    <span className="text-xs text-muted-foreground font-medium block">Check-ins (50%)</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold">{Math.round(checkInProgress)}%</span>
                      <span className="text-xs text-muted-foreground">{goal.completed_days || 0} / {totalDuration} Days</span>
                    </div>
                    <Progress value={checkInProgress} className="h-1.5" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Change status:</label>
                <div className="flex gap-2">
                  <Button
                    variant={goal.status === 'Pending' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStatusChange('Pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={goal.status === 'In-Progress' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStatusChange('In-Progress')}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={goal.status === 'Completed' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStatusChange('Completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between border-t pt-4">
              <Button variant="outline" onClick={onClose}>Close</Button>
              
              {goal.is_public ? (
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Goal
                </Button>
              ) : (
                <Button variant="outline" className="flex items-center gap-2" disabled>
                  <X className="h-4 w-4" />
                  Private Goal
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
