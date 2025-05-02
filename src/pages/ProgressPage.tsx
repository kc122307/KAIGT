
import { useState } from "react";
import { useGoalStore } from "../store/goalStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Calendar,
  Circle,
  CircleCheck,
  Clock,
  Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCategory } from "../types";

const ProgressPage = () => {
  const goals = useGoalStore((state) => state.goals);
  const currentUser = useGoalStore((state) => state.currentUser);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate overall progress statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter((goal) => goal.status === "Completed").length;
  const inProgressGoals = goals.filter((goal) => goal.status === "In-Progress").length;
  const pendingGoals = goals.filter((goal) => goal.status === "Pending").length;
  
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  
  // Calculate progress by category
  const categoriesData = goals.reduce((acc, goal) => {
    const category = goal.category as GoalCategory;
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        averageProgress: 0,
      };
    }
    
    acc[category].total += 1;
    if (goal.status === "Completed") acc[category].completed += 1;
    else if (goal.status === "In-Progress") acc[category].inProgress += 1;
    else acc[category].pending += 1;
    
    acc[category].averageProgress += goal.progress;
    
    return acc;
  }, {} as Record<GoalCategory, { 
    total: number; 
    completed: number; 
    inProgress: number; 
    pending: number; 
    averageProgress: number;
  }>);
  
  // Calculate average progress for each category
  Object.keys(categoriesData).forEach(category => {
    const categoryData = categoriesData[category as GoalCategory];
    categoryData.averageProgress = categoryData.total > 0 
      ? Math.round(categoryData.averageProgress / categoryData.total) 
      : 0;
  });

  // Get upcoming deadlines (next 7 days)
  const today = new Date();
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(today.getDate() + 7);
  
  const upcomingDeadlines = goals
    .filter(goal => 
      goal.status !== "Completed" && 
      new Date(goal.deadline) >= today && 
      new Date(goal.deadline) <= oneWeekFromNow
    )
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground">Track your goals and view your progress over time</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGoals}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CircleCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedGoals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completionRate}% completion rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressGoals}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Circle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingGoals}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>
                Your goal completion rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">All Goals</span>
                    <span className="text-sm text-muted-foreground">
                      {completionRate}%
                    </span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
                
                {currentUser && (
                  <div className="pt-4 space-y-2">
                    <p className="text-sm font-medium">Current Streak</p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{currentUser.streakCount}</div>
                      <div className="text-sm text-muted-foreground">days</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-4 space-y-4">
          {Object.keys(categoriesData).length > 0 ? (
            Object.entries(categoriesData).map(([category, data]) => (
              <Card key={category}>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Average Progress</span>
                      <span>{data.averageProgress}%</span>
                    </div>
                    <Progress value={data.averageProgress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 text-sm">
                    <div className="flex flex-col items-center p-2 border rounded-lg">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-bold">{data.completed}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 border rounded-lg">
                      <span className="text-muted-foreground">In Progress</span>
                      <span className="font-bold">{data.inProgress}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 border rounded-lg">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-bold">{data.pending}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BarChart className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-center text-muted-foreground">
                  No categories to display. Start creating goals!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Goals due in the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDeadlines.map((goal) => {
                    const daysLeft = Math.ceil(
                      (new Date(goal.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div key={goal.id} className="flex items-center justify-between py-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{goal.title}</span>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <Badge
                            variant={daysLeft <= 1 ? "destructive" : daysLeft <= 3 ? "default" : "outline"}
                          >
                            {daysLeft === 0
                              ? "Due Today"
                              : daysLeft === 1
                              ? "Due Tomorrow"
                              : `${daysLeft} Days Left`}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-center text-muted-foreground">
                    No upcoming deadlines in the next 7 days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
