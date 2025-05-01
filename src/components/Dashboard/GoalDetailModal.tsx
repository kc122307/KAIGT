
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGoalStore } from "../../store/goalStore";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Trash, Edit, Check, X, Users, Share2 } from "lucide-react";
import { format } from 'date-fns';
import { Slider } from "@/components/ui/slider";
import { EditGoalForm } from "./EditGoalForm";
import { GoalStatus } from "../../types";

interface GoalDetailModalProps {
  goalId: string;
  onClose: () => void;
}

export const GoalDetailModal = ({ goalId, onClose }: GoalDetailModalProps) => {
  const { goals, updateGoalProgress, updateGoalStatus, deleteGoal } = useGoalStore();
  const goal = goals.find(g => g.id === goalId);
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(goal?.progress || 0);
  
  if (!goal) {
    onClose();
    return null;
  }
  
  const daysRemaining = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0 && goal.status !== 'Completed';
  
  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
  };
  
  const handleProgressUpdate = () => {
    updateGoalProgress(goal.id, progress);
  };
  
  const handleStatusChange = (status: GoalStatus) => {
    updateGoalStatus(goal.id, status);
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
                  <DialogTitle>{goal.title}</DialogTitle>
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
              <DialogDescription>{goal.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 my-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Deadline: {format(goal.deadline, 'MMMM d, yyyy')}</span>
                </div>
                
                {isOverdue ? (
                  <span className="text-destructive font-medium">Overdue</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{daysRemaining} days remaining</span>
                  </div>
                )}
              </div>
              
              {goal.collaborators && goal.collaborators.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Collaborating with: {goal.collaborators.map(user => user.name).join(', ')}
                  </span>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Update progress:</label>
                <div className="flex gap-4 items-center">
                  <Slider 
                    value={[progress]} 
                    min={0} 
                    max={100} 
                    step={5}
                    onValueChange={handleProgressChange}
                    className="flex-1" 
                  />
                  <Button onClick={handleProgressUpdate} size="sm">Update</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Change status:</label>
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
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={onClose}>Close</Button>
              
              {goal.isPublic ? (
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
