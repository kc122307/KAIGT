
import { useState } from "react";
import { useGoalStore } from "../store/goalStore";
import { format, subDays } from "date-fns";
import { ActivityLog } from "../components/ActivityLog/ActivityLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ActivityPage = () => {
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const { activities, goals } = useGoalStore();
  
  // Filter activities by time
  const getFilteredActivities = () => {
    const now = new Date();
    
    switch (timeFilter) {
      case "today":
        return activities.filter(activity => 
          new Date(activity.timestamp).toDateString() === now.toDateString()
        );
      case "week":
        const oneWeekAgo = subDays(now, 7);
        return activities.filter(activity => 
          new Date(activity.timestamp) >= oneWeekAgo
        );
      case "month":
        const oneMonthAgo = subDays(now, 30);
        return activities.filter(activity => 
          new Date(activity.timestamp) >= oneMonthAgo
        );
      default:
        return activities;
    }
  };

  // Group activities by date
  const groupActivitiesByDate = (activities: typeof useGoalStore.getState().activities) => {
    const grouped: Record<string, typeof activities> = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });
    
    // Sort dates in descending order
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => 
        new Date(dateB).getTime() - new Date(dateA).getTime()
      );
  };

  const filteredActivities = getFilteredActivities();
  const groupedActivities = groupActivitiesByDate(filteredActivities);
  
  // Get goal title by id
  const getGoalTitle = (goalId: string) => {
    return goals.find(goal => goal.id === goalId)?.title || "Unknown Goal";
  };
  
  // Calculate activity stats
  const totalActivities = activities.length;
  const todayActivities = activities.filter(activity => 
    new Date(activity.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const completedGoals = activities.filter(activity => activity.actionType === 'completed').length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        
        <div className="w-full sm:w-48">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Period</SelectLabel>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayActivities}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Goals Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals}</div>
          </CardContent>
        </Card>
      </div>
      
      {groupedActivities.length > 0 ? (
        <div className="space-y-6">
          {groupedActivities.map(([date, dateActivities]) => (
            <Card key={date} className="overflow-hidden">
              <CardHeader className="bg-muted/50 py-3">
                <CardTitle className="text-md font-medium flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {dateActivities.map(activity => (
                    <li key={activity.id} className="p-4 flex items-start gap-3">
                      <div className="mt-1">
                        {activity.actionType === 'created' && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">+</div>
                        )}
                        {activity.actionType === 'updated' && (
                          <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300">↻</div>
                        )}
                        {activity.actionType === 'completed' && (
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">✓</div>
                        )}
                        {activity.actionType === 'deleted' && (
                          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300">×</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.details}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant={
                            activity.actionType === 'created' ? 'info' : 
                            activity.actionType === 'updated' ? 'warning' :
                            activity.actionType === 'completed' ? 'success' : 'destructive'
                          }>
                            {activity.actionType}
                          </Badge>
                          <Badge variant="outline">
                            {getGoalTitle(activity.goalId)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.timestamp), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No activities found for the selected time period.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityPage;
