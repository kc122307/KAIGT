
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
    
    // Set up real-time subscription for profiles table updates
    const profilesChannel = supabase
      .channel('public:profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profiles change received in leaderboard:', payload);
          // Refresh data when profiles are updated
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, [storeUsers]);
  
  // Use refreshed data, fallback to store data
  const users = refreshedUsers.length > 0 ? refreshedUsers : storeUsers;
  
  // Sort users by streak count (descending)
  const sortedUsers = [...users].sort((a, b) => b.streakCount - a.streakCount);
  
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
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {sortedUsers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No leaderboard data available
          </div>
        ) : (
          sortedUsers.map((user, index) => (
            <div 
              key={user.id} 
              className={`flex items-center justify-between py-2 ${
                index !== sortedUsers.length - 1 ? "border-b" : ""
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
