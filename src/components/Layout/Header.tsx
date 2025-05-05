
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGoalStore } from "../../store/goalStore";
import { useTheme } from "../ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Plus,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const { currentUser, logout, notifications } = useGoalStore();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  
  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  
  return (
    <header className="border-b sticky top-0 z-30 bg-background">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">GoalTracker</span>
          </Link>
        </div>
        
        <div className="hidden md:flex md:flex-1 max-w-md mx-4">
          {showSearch && (
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search goals..."
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className="md:flex hidden"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Link to="/goals">
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <img 
                    src={currentUser?.avatar} 
                    alt="User avatar" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{currentUser?.name}</span>
                  <span className="text-xs text-muted-foreground">{currentUser?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
