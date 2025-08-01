
import { Link, useLocation } from "react-router-dom";
import { useGoalStore } from "../../store/goalStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  CheckSquare, 
  ListTodo, 
  LineChart, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Activity,
  Trophy,
  Users,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
}

export const Sidebar = ({ open }: SidebarProps) => {
  const { logout, currentUser, goals } = useGoalStore();
  const location = useLocation();
  
  // Calculate completed goals from actual goals data
  const completedGoalsCount = currentUser 
    ? goals.filter(goal => goal.user_id === currentUser.id && goal.status === 'Completed').length
    : 0;
  
  const navItems = [
    { title: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/' },
    { title: 'Goals', icon: <CheckSquare className="h-5 w-5" />, path: '/goals' },
    { title: 'Tasks', icon: <ListTodo className="h-5 w-5" />, path: '/tasks' },
    { title: 'Progress', icon: <LineChart className="h-5 w-5" />, path: '/progress' },
    { title: 'Activity', icon: <Activity className="h-5 w-5" />, path: '/activity' },
    { title: 'Notifications', icon: <Bell className="h-5 w-5" />, path: '/notifications' },
    { title: 'Leaderboard', icon: <Trophy className="h-5 w-5" />, path: '/leaderboard' },
    { title: 'Team', icon: <Users className="h-5 w-5" />, path: '/team' },
    { title: 'AI Assistant', icon: <Brain className="h-5 w-5" />, path: '/ai' },
  ];
  
  const handleLogout = () => {
    logout().catch(console.error);
  };
  
  return (
    <div className="flex flex-col h-full bg-background border-r p-4">
      {/* Profile section */}
      {currentUser && (
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-xs text-muted-foreground">
              {completedGoalsCount} goals completed
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="space-y-1 flex-1">
        {navItems.map(item => (
          <Link key={item.path} to={item.path}>
            <Button
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className={cn("w-full justify-start", { 
                'bg-secondary': location.pathname === item.path 
              })}
            >
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Button>
          </Link>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-1">
        <Link to="/settings">
          <Button
            variant={location.pathname === '/settings' ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};
