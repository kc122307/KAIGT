
import { useState, useEffect } from "react";
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
import { Activity } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { getUsers } from "../services/api/userService";

const ActivityPage = () => {
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const { activities, goals, currentUser } = useGoalStore();
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);
  
  // Fetch fresh data for completed goals count
  useEffect(() => {
    const fetchLatestStats = async () => {
      if (!currentUser) return;
      
      try {
        // Force refresh to get accurate completed goals count
        const users = await getUsers(true);
        const currentUserData = users.find(user => user.id === currentUser.id);
        if (currentUserData) {
          setCompletedGoalsCount(currentUserData.completedGoals);
        }
      } catch (error) {
        console.error("Error fetching completed goals count:", error);
        // Fall back to counting completed goals from the goals array
        const uniqueCompletedGoalIds = new Set(
          activities
            .filter(activity => activity.action_type === 'completed')
            .map(activity => activity.goal_id)
        );
        setCompletedGoalsCount(uniqueCompletedGoalIds.size);
      }
    };
    
    fetchLatestStats();
    
    // Set up real-time subscriptions for goals and activities
    const goalsChannel = supabase
      .channel('public:goals_activity_page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('Goals change received in activity page:', payload);
          fetchLatestStats();
        }
      )
      .subscribe();
      
    const activitiesChannel = supabase
      .channel('public:activities_activity_page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('Activity change received in activity page:', payload);
          fetchLatestStats();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [activities, currentUser]);
  
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
  const groupActivitiesByDate = (activities: Activity[]) => {
    const grouped: Record<string, Activity[]> = {};
    
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
            <div className="text-2xl font-bold">{completedGoalsCount}</div>
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
                        {activity.action_type === 'created' && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">+</div>
                        )}
                        {activity.action_type === 'updated' && (
                          <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300">↻</div>
                        )}
                        {activity.action_type === 'completed' && (
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">✓</div>
                        )}
                        {activity.action_type === 'deleted' && (
                          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300">×</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.details}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant={
                            activity.action_type === 'created' ? 'info' : 
                            activity.action_type === 'updated' ? 'warning' :
                            activity.action_type === 'completed' ? 'success' : 'destructive'
                          }>
                            {activity.action_type}
                          </Badge>
                          <Badge variant="outline">
                            {getGoalTitle(activity.goal_id)}
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
