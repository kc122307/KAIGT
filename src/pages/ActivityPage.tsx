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
import { Calendar, Activity as ActivityIcon, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Activity } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { getUsers } from "../services/api/userService";
import { useGSAP } from "../hooks/useGSAP";

const ActivityPage = () => {
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const { activities, goals, currentUser } = useGoalStore();
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);
  const { containerRef } = useGSAP();
  
  useEffect(() => {
    const fetchLatestStats = async () => {
      if (!currentUser) return;
      
      try {
        const users = await getUsers(true);
        const currentUserData = users.find(user => user.id === currentUser.id);
        if (currentUserData) {
          setCompletedGoalsCount(currentUserData.completedGoals);
        }
      } catch (error) {
        console.error("Error fetching completed goals count:", error);
        const uniqueCompletedGoalIds = new Set(
          activities
            .filter(activity => activity.action_type === 'completed')
            .map(activity => activity.goal_id)
        );
        setCompletedGoalsCount(uniqueCompletedGoalIds.size);
      }
    };
    
    fetchLatestStats();
    
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

  const groupActivitiesByDate = (activities: Activity[]) => {
    const grouped: Record<string, Activity[]> = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });
    
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => 
        new Date(dateB).getTime() - new Date(dateA).getTime()
      );
  };

  const filteredActivities = getFilteredActivities();
  const groupedActivities = groupActivitiesByDate(filteredActivities);
  
  const getGoalTitle = (goalId: string) => {
    return goals.find(goal => goal.id === goalId)?.title || "Unknown Goal";
  };
  
  const totalActivities = activities.length;
  const todayActivities = activities.filter(activity => 
    new Date(activity.timestamp).toDateString() === new Date().toDateString()
  ).length;
  
  return (
    <div ref={containerRef} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 scroll-fade">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Activity Timeline
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Track all your goal-related activities and progress</p>
        </div>
        
        <div className="w-full sm:w-64">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="hover:scale-105 transition-transform duration-200 border-indigo-200 hover:border-indigo-300">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent className="animate-scale-in">
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
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stats-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ActivityIcon className="h-4 w-4" />
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-indigo-600">{totalActivities}</div>
              <TrendingUp className="h-5 w-5 text-green-500 animate-bounce" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">All-time record</p>
          </CardContent>
        </Card>
        
        <Card className="stats-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Today's Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">{todayActivities}</div>
              {todayActivities > 0 && (
                <div className="h-2 w-2 bg-green-400 rounded-full animate-ping"></div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Today's progress</p>
          </CardContent>
        </Card>
        
        <Card className="stats-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Goals Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-purple-600">{completedGoalsCount}</div>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(completedGoalsCount, 3) }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Achievements unlocked</p>
          </CardContent>
        </Card>
      </div>
      
      {groupedActivities.length > 0 ? (
        <div className="space-y-8">
          {groupedActivities.map(([date, dateActivities], dayIndex) => (
            <Card key={date} className="scroll-fade overflow-hidden hover:shadow-xl transition-all duration-300" style={{ animationDelay: `${dayIndex * 0.1}s` }}>
              <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/10 dark:via-purple-950/10 dark:to-pink-950/10 py-4 border-l-4 border-l-indigo-500">
                <CardTitle className="text-lg font-semibold flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xl">{format(new Date(date), "EEEE, MMMM d, yyyy")}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {dateActivities.length} {dateActivities.length === 1 ? 'activity' : 'activities'}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-muted/20">
                  {dateActivities.map((activity, activityIndex) => (
                    <li 
                      key={activity.id} 
                      className="p-6 flex items-start gap-4 hover:bg-gradient-to-r hover:from-muted/30 hover:to-transparent transition-all duration-200 group"
                      style={{ animationDelay: `${(dayIndex * 0.1) + (activityIndex * 0.05)}s` }}
                    >
                      <div className="mt-1 relative">
                        {activity.action_type === 'created' && (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-200">
                            <span className="text-lg font-bold">+</span>
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-400 rounded-full animate-ping opacity-50"></div>
                          </div>
                        )}
                        {activity.action_type === 'updated' && (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 group-hover:scale-110 transition-transform duration-200">
                            <span className="text-lg">↻</span>
                          </div>
                        )}
                        {activity.action_type === 'completed' && (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center text-green-600 dark:text-green-300 group-hover:scale-110 transition-transform duration-200">
                            <span className="text-lg">✓</span>
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        {activity.action_type === 'deleted' && (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 flex items-center justify-center text-red-600 dark:text-red-300 group-hover:scale-110 transition-transform duration-200">
                            <span className="text-lg">×</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                          {activity.details}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge 
                            variant={
                              activity.action_type === 'created' ? 'info' : 
                              activity.action_type === 'updated' ? 'warning' :
                              activity.action_type === 'completed' ? 'success' : 'destructive'
                            }
                            className="font-medium transition-transform duration-200 group-hover:scale-105"
                          >
                            {activity.action_type}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="max-w-48 truncate transition-all duration-200 group-hover:scale-105 hover:bg-muted"
                          >
                            {getGoalTitle(activity.goal_id)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(activity.timestamp), "h:mm a")}</span>
                          </div>
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
        <Card className="scroll-fade hover:shadow-lg transition-all duration-300">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <ActivityIcon className="h-16 w-16 text-muted-foreground animate-bounce" />
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">No Activities Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {timeFilter === "all" 
                    ? "Start creating and managing goals to see your activity timeline here!"
                    : `No activities found for the selected time period. Try adjusting your filter or create some goals!`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityPage;
