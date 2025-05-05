
import { useGoalStore } from "../../store/goalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { getUsers } from "../../services/api/userService";
import { User } from "../../types";
import { supabase } from "@/integrations/supabase/client";

export const Leaderboard = () => {
  const { users: storeUsers, currentUser } = useGoalStore();
  const [refreshedUsers, setRefreshedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch fresh user data to ensure we have updated streak counts and completed goals
  useEffect(() => {
    const fetchLatestUserData = async () => {
      setIsLoading(true);
      try {
        const latestUsers = await getUsers();
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
          event: 'UPDATE',
          schema: 'public',
          table: 'goals',
          filter: `status=eq.Completed`
        },
        (payload) => {
          console.log('Completed goal change received in leaderboard:', payload);
          // Refresh data when goals are completed
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(goalsChannel);
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
  
  // Get current user's ranking
  const currentUserRank = currentUser 
    ? sortedUsers.findIndex(user => user.id === currentUser.id) + 1
    : null;
  
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
    <Card>
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
          sortedUsers.slice(0, 5).map((user, index) => (
            <div 
              key={user.id} 
              className={`flex items-center justify-between py-2 ${
                index !== Math.min(sortedUsers.length - 1, 4) ? "border-b" : ""
              } ${currentUser && user.id === currentUser.id ? "bg-muted/50 rounded-md px-2" : ""}`}
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
                  {index === 0 && (
                    <span className="absolute -top-1 -right-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.completedGoals} goals completed</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{user.streakCount}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
