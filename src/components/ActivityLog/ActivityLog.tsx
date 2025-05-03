
import { useGoalStore } from "../../store/goalStore";
import { format } from "date-fns";
import { Activity } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ActivityLogProps {
  limit?: number;
  showViewMore?: boolean;
  userId?: string;
  goalId?: string;
}

export const ActivityLog = ({ 
  limit, 
  showViewMore = false,
  userId,
  goalId
}: ActivityLogProps) => {
  const { activities, currentUser } = useGoalStore();
  const navigate = useNavigate();
  
  let filteredActivities = activities;
  
  // Filter by user ID if specified, or default to current user
  if (userId) {
    filteredActivities = filteredActivities.filter(activity => activity.user_id === userId);
  } else if (currentUser) {
    filteredActivities = filteredActivities.filter(activity => activity.user_id === currentUser.id);
  }
  
  // Filter by goal ID if specified
  if (goalId) {
    filteredActivities = filteredActivities.filter(activity => activity.goal_id === goalId);
  }
  
  // Sort activities by timestamp (newest first)
  filteredActivities = filteredActivities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Limit the number of activities if specified
  if (limit && filteredActivities.length > limit) {
    filteredActivities = filteredActivities.slice(0, limit);
  }
  
  const getActivityIcon = (activity: Activity) => {
    switch (activity.action_type) {
      case 'created':
        return '➕';
      case 'updated':
        return '🔄';
      case 'completed':
        return '✅';
      case 'deleted':
        return '❌';
      default:
        return '📝';
    }
  };
  
  const handleViewMore = () => {
    navigate('/activity');
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        {filteredActivities.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No activities to display.
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredActivities.map(activity => (
              <li key={activity.id} className="flex items-start gap-3">
                <div className="text-xl mt-0.5">{getActivityIcon(activity)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {showViewMore && filteredActivities.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={handleViewMore}>
              View All Activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
