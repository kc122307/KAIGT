
import { Card, CardContent } from "@/components/ui/card";
import { useGoalStore } from "../../store/goalStore";
import { Check, Clock, Hourglass } from "lucide-react";

export const Stats = () => {
  const { goals, currentUser } = useGoalStore();
  
  // Filter goals for current user
  const userGoals = goals.filter(goal => goal.user_id === currentUser?.id);
  
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
      color: "text-green-600",
      cardClass: "stat-card-green",
    },
    {
      title: "In Progress",
      value: inProgressGoals,
      icon: Clock,
      color: "text-blue-600", 
      cardClass: "stat-card-blue",
    },
    {
      title: "Pending",
      value: pendingGoals,
      icon: Hourglass,
      color: "text-teal-600",
      cardClass: "stat-card-teal",
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={stat.title} className={`${stat.cardClass} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0`}>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium opacity-75">{stat.title}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`rounded-full p-3 ${stat.color} bg-white/20 backdrop-blur-sm float-animation`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
