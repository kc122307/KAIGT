import { useGoalStore } from "../../store/goalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { getUsers } from "../../services/api/userService";
import { User } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { useGSAP } from "../../hooks/useGSAP";

export const Leaderboard = () => {
  const { users: storeUsers, currentUser } = useGoalStore();
  const [refreshedUsers, setRefreshedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { containerRef } = useGSAP();
  
  // Fetch fresh user data to ensure we have updated streak counts and completed goals
  useEffect(() => {
    const fetchLatestUserData = async () => {
      setIsLoading(true);
      try {
        // Force refresh from API rather than using cached data
        const latestUsers = await getUsers(true);
        console.log("Fetched latest users for leaderboard:", latestUsers);
        setRefreshedUsers(latestUsers);
      } catch (error) {
        console.error("Error fetching latest user data:", error);
        // Fallback to store data if API fails
        setRefreshedUsers(storeUsers);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLatestUserData();
    
    // Set up real-time subscription for profiles table updates AND goals table updates
    const profilesChannel = supabase
      .channel('public:profiles_leaderboard_component')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profiles change received in leaderboard component:', payload);
          // Refresh data when profiles are updated
          fetchLatestUserData();
        }
      )
      .subscribe();
    
    // Also subscribe to goal completions to update leaderboard in real-time  
    const goalsChannel = supabase
      .channel('public:goals_leaderboard_component')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('Goal change received in leaderboard:', payload);
          // Refresh data when goals are changed
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    // Also subscribe to activities to update streaks in real-time
    const activitiesChannel = supabase
      .channel('public:activities_leaderboard_component')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('Activity change received in leaderboard:', payload);
          // Refresh data when activities are changed
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [storeUsers]);
  
  // Use refreshed data, fallback to store data
  const users = refreshedUsers.length > 0 ? refreshedUsers : storeUsers;
  
  // Sort users by streak count (descending), then by completed goals if streaks are equal
  const sortedUsers = [...users].sort((a, b) => {
    if (b.streakCount === a.streakCount) {
      return b.completedGoals - a.completedGoals;
    }
    return b.streakCount - a.streakCount;
  });
  
  // Get current user's ranking and create display list
  const currentUserRank = currentUser 
    ? sortedUsers.findIndex(user => user.id === currentUser.id) + 1
    : null;
    
  // Create the display list: top 10 + current user if not in top 10
  const getDisplayUsers = () => {
    const top10 = sortedUsers.slice(0, 10);
    
    // If current user is not in top 10, add them at the end
    if (currentUser && currentUserRank && currentUserRank > 10) {
      const currentUserData = sortedUsers.find(user => user.id === currentUser.id);
      if (currentUserData) {
        return [...top10, currentUserData];
      }
    }
    
    return top10;
  };
  
  const displayUsers = getDisplayUsers();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex justify-center py-4">
            <div className="animate-pulse">Loading leaderboard...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div ref={containerRef}>
      <Card className="scroll-fade">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
            {currentUserRank && (
              <span className="text-xs bg-muted px-2 py-1 rounded-full ml-auto">
                Your Rank: #{currentUserRank}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {sortedUsers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No leaderboard data available
            </div>
          ) : (
            displayUsers.map((user, index) => {
              const isCurrentUser = currentUser && user.id === currentUser.id;
              const actualRank = sortedUsers.findIndex(u => u.id === user.id) + 1;
              const isTop10 = actualRank <= 10;
              const isLastItem = index === displayUsers.length - 1;
              
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between py-2 transition-colors duration-200 ${
                    !isLastItem ? "border-b" : ""
                  } ${
                    isCurrentUser 
                      ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 rounded-md px-2 border-l-4 border-blue-500" 
                      : "hover:bg-muted/30"
                  } ${
                    !isTop10 && isCurrentUser ? "mt-2 pt-4 border-t-2 border-dashed border-muted-foreground/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {actualRank === 1 && (
                        <span className="absolute -top-1 -right-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        {isCurrentUser && (
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.completedGoals} goals completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">#{actualRank}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{user.streakCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};
