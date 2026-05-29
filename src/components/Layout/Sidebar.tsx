import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGoalStore } from "../../store/goalStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  CheckSquare, 
  Settings, 
  LogOut,
  Trophy,
  Users,
  Brain,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserTeamInvitations } from "../../services/api/teamService";

interface SidebarProps {
  open: boolean;
}

export const Sidebar = ({ open }: SidebarProps) => {
  const { logout, currentUser, goals } = useGoalStore();
  const location = useLocation();
  const [invitationsCount, setInvitationsCount] = useState<number>(0);
  
  useEffect(() => {
    if (!currentUser) return;
    
    const loadInvitationsCount = async () => {
      try {
        const data = await getUserTeamInvitations();
        setInvitationsCount(data.length);
      } catch (error) {
        console.error('Error fetching sidebar invitations count:', error);
      }
    };
    
    loadInvitationsCount();
    const interval = setInterval(loadInvitationsCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);
  
  // Calculate completed goals from actual goals data
  const completedGoalsCount = currentUser 
    ? goals.filter(goal => goal.user_id === currentUser.id && goal.status === 'Completed').length
    : 0;
  
  const navItems = [
    { title: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/' },
    { title: 'Goals', icon: <CheckSquare className="h-5 w-5" />, path: '/goals' },
    { title: 'Invitations', icon: <Mail className="h-5 w-5" />, path: '/invitations', badge: invitationsCount },
    { title: 'Leaderboard', icon: <Trophy className="h-5 w-5" />, path: '/leaderboard' },
    { title: 'Team', icon: <Users className="h-5 w-5" />, path: '/team' },
    { title: 'AI Assistant', icon: <Brain className="h-5 w-5" />, path: '/ai' },
  ];
  
  const handleLogout = () => {
    logout().catch(console.error);
  };
  
  return (
    <div className="flex flex-col h-full sidebar-gradient border-r border-white/20 p-4 backdrop-blur-sm">
      {/* Navigation */}
      <div className="space-y-1 flex-1">
        {navItems.map(item => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start transition-all duration-200 border border-transparent text-black hover:text-black dark:text-white dark:hover:text-white",
                location.pathname === item.path 
                  ? "bg-black/10 border-black/10 shadow-sm dark:bg-white/20 dark:border-white/30 dark:shadow-lg" 
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              {item.icon}
              <span className="ml-2 font-medium flex-1 text-left">{item.title}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto h-5 px-1.5 flex items-center justify-center text-[10px] font-bold min-w-[20px] animate-pulse"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-1">
        <Link to="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start transition-all duration-200 border border-transparent text-black hover:text-black dark:text-white dark:hover:text-white",
              location.pathname === '/settings'
                ? "bg-black/10 border-black/10 shadow-sm dark:bg-white/20 dark:border-white/30 dark:shadow-lg"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            )}
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
