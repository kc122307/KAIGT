
import { Link, useLocation } from "react-router-dom";
import { useGoalStore } from "../../store/goalStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/Logo";
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
    <div className="flex flex-col h-full sidebar-gradient border-r border-white/20 p-4 backdrop-blur-sm">
      {/* Logo section */}
      <div className="mb-6">
        <Link to="/" className="block">
          <Logo 
            size="xl" 
            showText={true} 
            className="justify-center" 
          />
        </Link>
      </div>
      
      {/* Profile section */}
      {currentUser && (
        <div className="glass-card p-4 mb-6 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-teal-500 p-0.5">
              <div className="h-full w-full rounded-full overflow-hidden bg-white">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{currentUser.name}</div>
              <div className="text-xs opacity-75 flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {completedGoalsCount} goals achieved
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="space-y-1 flex-1">
        {navItems.map(item => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start transition-all duration-200 hover:scale-105 hover:bg-white/10",
                location.pathname === item.path 
                  ? "bg-white/20 shadow-lg backdrop-blur-sm border border-white/30" 
                  : "hover:bg-white/5"
              )}
            >
              {item.icon}
              <span className="ml-2 font-medium">{item.title}</span>
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
