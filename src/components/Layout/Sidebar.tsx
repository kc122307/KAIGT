
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  ListChecks,
  BarChart,
  Users,
  Settings,
  Trophy,
  Bell,
  History,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Goals",
    icon: Target,
    path: "/goals",
  },
  {
    title: "Tasks",
    icon: ListChecks,
    path: "/tasks",
  },
  {
    title: "Progress",
    icon: BarChart,
    path: "/progress",
  },
  {
    title: "Activity",
    icon: History,
    path: "/activity",
  },
  {
    title: "Teams",
    icon: Users,
    path: "/teams",
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    path: "/leaderboard",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/notifications",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export const Sidebar = ({ open }: SidebarProps) => {
  const location = useLocation();
  
  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">GoalTracker</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.title}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                  isActive ? "bg-primary/10 text-primary font-medium" : ""
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
