
import { Card, CardContent } from "@/components/ui/card";
import { useGoalStore } from "../../store/goalStore";
import { Check, Clock, Hourglass } from "lucide-react";

export const Stats = () => {
  const { goals, currentUser } = useGoalStore();
  
  // Filter goals for current user
  const userGoals = goals.filter(goal => goal.userId === currentUser?.id);
  
  // Calculate stats
  const completedGoals = userGoals.filter(goal => goal.status === 'Completed').length;
  const inProgressGoals = userGoals.filter(goal => goal.status === 'In-Progress').length;
  const pendingGoals = userGoals.filter(goal => goal.status === 'Pending').length;
  
  // Calculate overall progress
  const totalProgress = userGoals.length > 0 
    ? userGoals.reduce((sum, goal) => sum + goal.progress, 0) / userGoals.length 
    : 0;
  
  const stats = [
    {
      title: "Completed",
      value: completedGoals,
      icon: Check,
      color: "text-green-500",
    },
    {
      title: "In Progress",
      value: inProgressGoals,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Pending",
      value: pendingGoals,
      icon: Hourglass,
      color: "text-yellow-500",
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`rounded-full p-2 ${stat.color} bg-muted/30`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
