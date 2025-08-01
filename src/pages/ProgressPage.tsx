
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
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Calendar,
  Circle,
  CircleCheck,
  Clock,
  Target,
  TrendingUp,
  Award,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCategory } from "../types";
import { useGSAP } from "../hooks/useGSAP";

const ProgressPage = () => {
  const goals = useGoalStore((state) => state.goals);
  const currentUser = useGoalStore((state) => state.currentUser);
  const [activeTab, setActiveTab] = useState("overview");
  const { containerRef } = useGSAP();

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
    <div ref={containerRef} className="space-y-6">
      <div className="scroll-fade">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Progress Analytics
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Track your goals and view your progress over time</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 scroll-fade">
          <TabsTrigger value="overview" className="flex items-center gap-2 transition-all duration-200">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2 transition-all duration-200">
            <BarChart className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2 transition-all duration-200">
            <Calendar className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="stats-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <div className="relative">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-400 rounded-full animate-ping opacity-50"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{totalGoals}</div>
                <p className="text-xs text-muted-foreground mt-1">Active goals</p>
              </CardContent>
            </Card>
            
            <Card className="stats-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <div className="relative">
                  <CircleCheck className="h-5 w-5 text-green-500" />
                  {completedGoals > 0 && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{completedGoals}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Award className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-600 font-medium">
                    {completionRate}% completion rate
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="stats-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-5 w-5 text-orange-500 animate-spin-slow" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{inProgressGoals}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently working</p>
              </CardContent>
            </Card>
            
            <Card className="stats-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Circle className="h-5 w-5 text-yellow-500 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{pendingGoals}</div>
                <p className="text-xs text-muted-foreground mt-1">Waiting to start</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="scroll-fade hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/10 dark:to-blue-950/10">
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-500" />
                Overall Progress
              </CardTitle>
              <CardDescription>
                Your goal completion journey
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">All Goals Progress</span>
                    <span className="text-2xl font-bold text-green-600">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={completionRate} className="h-4" />
                    <div 
                      className="absolute top-0 left-0 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                {currentUser && (
                  <div className="pt-6 border-t space-y-4">
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Current Streak
                    </p>
                    <div className="flex items-baseline gap-3">
                      <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        {currentUser.streakCount}
                      </div>
                      <div className="text-lg text-muted-foreground">consecutive days</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-4 space-y-6">
          {Object.keys(categoriesData).length > 0 ? (
            <div className="grid gap-6">
              {Object.entries(categoriesData).map(([category, data], index) => (
                <Card 
                  key={category} 
                  className="scroll-fade hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/10 dark:to-pink-950/10">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                      {category}
                    </CardTitle>
                    <BarChart className="h-6 w-6 text-purple-500" />
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-lg">
                        <span className="font-medium">Average Progress</span>
                        <span className="text-2xl font-bold text-purple-600">{data.averageProgress}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={data.averageProgress} className="h-3" />
                        <div 
                          className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${data.averageProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="flex flex-col items-center p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                        <CircleCheck className="h-6 w-6 text-green-500 mb-2" />
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="text-2xl font-bold text-green-600">{data.completed}</span>
                      </div>
                      <div className="flex flex-col items-center p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                        <Clock className="h-6 w-6 text-orange-500 mb-2" />
                        <span className="text-sm text-muted-foreground">In Progress</span>
                        <span className="text-2xl font-bold text-orange-600">{data.inProgress}</span>
                      </div>
                      <div className="flex flex-col items-center p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                        <Circle className="h-6 w-6 text-yellow-500 mb-2" />
                        <span className="text-sm text-muted-foreground">Pending</span>
                        <span className="text-2xl font-bold text-yellow-600">{data.pending}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="scroll-fade">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-6">
                  <BarChart className="h-16 w-16 text-muted-foreground animate-bounce" />
                  <div className="absolute -top-2 -right-2 h-6 w-6 bg-purple-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Categories Yet</h3>
                <p className="text-center text-muted-foreground max-w-md">
                  Start creating goals in different categories to see your progress breakdown here!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4 space-y-6">
          <Card className="scroll-fade hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/10 dark:to-indigo-950/10">
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-500" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>
                Goals due in the next 7 days - stay on track!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDeadlines.map((goal, index) => {
                    const daysLeft = Math.ceil(
                      (new Date(goal.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div 
                        key={goal.id} 
                        className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
                            <Target className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-lg">{goal.title}</span>
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(goal.deadline).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Progress</div>
                            <div className="font-semibold">{goal.progress}%</div>
                          </div>
                          <Badge
                            variant={daysLeft <= 1 ? "destructive" : daysLeft <= 3 ? "default" : "outline"}
                            className="px-3 py-1 animate-pulse"
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
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative mb-6">
                    <Calendar className="h-16 w-16 text-muted-foreground animate-bounce" />
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-center text-muted-foreground max-w-md">
                    No upcoming deadlines in the next 7 days. You're doing great!
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
