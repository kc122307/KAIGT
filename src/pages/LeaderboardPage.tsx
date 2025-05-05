
import { useEffect, useState } from "react";
import { useGoalStore } from "../store/goalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUsers } from "../services/api/userService";
import { User } from "../types";
import { supabase } from "@/integrations/supabase/client";

const LeaderboardPage = () => {
  const { users: storeUsers, currentUser } = useGoalStore();
  const [refreshedUsers, setRefreshedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch fresh user data to ensure we have updated streak counts and completed goals
  useEffect(() => {
    const fetchLatestUserData = async () => {
      setIsLoading(true);
      try {
        // Force refresh to get accurate streak data
        const latestUsers = await getUsers(true);
        console.log("Fetched latest users for leaderboard page:", latestUsers);
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
      .channel('public:profiles_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profiles change received in leaderboard page:', payload);
          // Refresh data when profiles are updated
          fetchLatestUserData();
        }
      )
      .subscribe();
    
    // Also listen for goal completions
    const goalsChannel = supabase
      .channel('public:goals_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events, not just UPDATE
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('Goal event received in leaderboard page:', payload);
          // Refresh data when goals are updated
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    // Also listen for activity changes to update streak counts
    const activitiesChannel = supabase
      .channel('public:activities_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('Activity event received in leaderboard page:', payload);
          // Refresh data when activities are updated
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
  
  // Find current user's rank
  const currentUserRank = currentUser 
    ? sortedUsers.findIndex(user => user.id === currentUser.id) + 1 
    : null;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-pulse">Loading leaderboard data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        
        {currentUserRank && currentUser && (
          <div className="bg-muted px-4 py-2 rounded-md text-sm flex items-center gap-2">
            <span>Your Rank:</span> 
            <span className="font-bold">#{currentUserRank}</span>
            <span className="mx-2">|</span>
            <span>Streak:</span>
            <span className="font-bold">{currentUser.streakCount}</span>
            <span className="mx-2">|</span>
            <span>Goals:</span>
            <span className="font-bold">{currentUser.completedGoals}</span>
          </div>
        )}
      </div>
      
      {sortedUsers.length >= 3 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sortedUsers.slice(0, 3).map((user, index) => (
            <Card key={user.id} className={
              index === 0 ? "border-yellow-500 dark:border-yellow-500" : 
              index === 1 ? "border-gray-400 dark:border-gray-400" : 
              "border-amber-700 dark:border-amber-700"
            }>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-xl">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                  <span>
                    {index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"} Place
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-muted">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-muted-foreground">{user.completedGoals} goals completed</p>
                    <div className="mt-2 flex items-center justify-center gap-1.5">
                      <Medal className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-xl">{user.streakCount}</span>
                      <span className="text-sm text-muted-foreground">day streak</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">Not enough users for top rankings</p>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Rankings</h2>
        <Card>
          <CardContent className="p-0">
            {sortedUsers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No users found to display in rankings
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Completed Goals</TableHead>
                    <TableHead className="text-right">Streak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user, index) => (
                    <TableRow 
                      key={user.id}
                      className={currentUser && user.id === currentUser.id ? "bg-muted/50" : ""}
                    >
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden">
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span>{user.name}</span>
                          {currentUser && user.id === currentUser.id && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.completedGoals}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-semibold">{user.streakCount}</span>
                          <Medal className="h-4 w-4 text-yellow-500" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardPage;
