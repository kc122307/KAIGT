import { useEffect, useState } from "react";
import { useGoalStore } from "../store/goalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { getUsers } from "../services/api/userService";
import { User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { TeamInvitation } from "../components/Team/TeamInvitation";
import { useGSAP } from "../hooks/useGSAP";

const TeamPage = () => {
  const { users: storeUsers, currentUser } = useGoalStore();
  const [refreshedUsers, setRefreshedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { containerRef } = useGSAP();
  
  // Fetch fresh user data to ensure we have updated streak counts and completed goals
  useEffect(() => {
    const fetchLatestUserData = async () => {
      setIsLoading(true);
      try {
        // Force refresh to get accurate goal completion data
        const latestUsers = await getUsers(true);
        console.log("Fetched latest users for team page:", latestUsers);
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
      .channel('public:profiles_team')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profiles change received in team page:', payload);
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    // Also listen for goals changes to update completed goals count
    const goalsChannel = supabase
      .channel('public:goals_team')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('Goals change received in team page:', payload);
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    // Listen for activity changes to update streak counts
    const activitiesChannel = supabase
      .channel('public:activities_team')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('Activity change received in team page:', payload);
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    // Listen for team invitation changes
    const invitationsChannel = supabase
      .channel('public:team_invitations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_invitations'
        },
        (payload) => {
          console.log('Team invitation change received:', payload);
          fetchLatestUserData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(invitationsChannel);
    };
  }, [storeUsers]);
  
  // Use refreshed data, fallback to store data, and filter out current user
  const allUsers = refreshedUsers.length > 0 ? refreshedUsers : storeUsers;
  const users = allUsers.filter(user => user.id !== currentUser?.id);
  
  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between scroll-fade">
        <h1 className="text-3xl font-bold">Team</h1>
      </div>
      
      <div className="scroll-fade">
        <TeamInvitation />
      </div>
      
      <Card className="scroll-fade">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-pulse">Loading team data...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No team members found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Completed Goals</TableHead>
                  <TableHead>Current Streak</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.completedGoals}</TableCell>
                    <TableCell>{user.streakCount} days</TableCell>
                    <TableCell>
                      <Badge variant={user.streakCount > 0 ? "success" : "secondary"}>
                        {user.streakCount > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPage;
