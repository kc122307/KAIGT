import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Home,
  LayoutDashboard,
  Target,
  CheckSquare,
  TrendingUp,
  Activity,
  Trophy,
  Users,
  Settings,
  Bell,
  Bot
} from 'lucide-react';
import { useGoalStore } from '../../store/goalStore';

export const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useGoalStore();

  const menuItems = [
    { 
      href: '/goals', 
      icon: Target, 
      label: 'Goals',
      description: 'Manage your goals'
    },
    { 
      href: '/tasks', 
      icon: CheckSquare, 
      label: 'Tasks',
      description: 'Track your tasks'
    },
    { 
      href: '/progress', 
      icon: TrendingUp, 
      label: 'Progress',
      description: 'View your progress'
    },
    { 
      href: '/activity', 
      icon: Activity, 
      label: 'Activity',
      description: 'Recent activity'
    },
    { 
      href: '/ai', 
      icon: Bot, 
      label: 'AI Assistant',
      description: 'AI-powered coaching'
    },
    { 
      href: '/leaderboard', 
      icon: Trophy, 
      label: 'Leaderboard',
      description: 'Community rankings'
    },
    { 
      href: '/team', 
      icon: Users, 
      label: 'Team',
      description: 'Collaborate with others'
    },
  ];

  return (
    <div className="hidden border-r bg-gray-100/40 dark:bg-gray-800/40 h-screen md:flex md:flex-col md:w-60">
      <div className="flex-1 space-y-2 p-4 pt-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
          <LayoutDashboard className="h-6 w-6" />
          <span>GoalTracker</span>
        </Link>
        <Link to="/settings" className="block rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar_url || ""} alt={currentUser?.name || "Avatar"} />
              <AvatarFallback>{currentUser?.name?.charAt(0) || "GT"}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">{currentUser?.name || "Guest"}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser?.email || "No email"}
              </p>
            </div>
          </div>
        </Link>
        <div className="pb-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700",
                  location.pathname === item.href
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "text-gray-900 dark:text-gray-50"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="absolute bottom-4 left-4 md:hidden">
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60">
          <SheetHeader className="text-left">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Manage your account preferences, set profile details and more.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-2 p-4 pt-6">
            <Link to="/settings" className="block rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar_url || ""} alt={currentUser?.name || "Avatar"} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || "GT"}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">{currentUser?.name || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.email || "No email"}
                  </p>
                </div>
              </div>
            </Link>
            <div className="pb-4">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group flex items-center rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700",
                      location.pathname === item.href
                        ? "bg-gray-200 dark:bg-gray-700"
                        : "text-gray-900 dark:text-gray-50"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
