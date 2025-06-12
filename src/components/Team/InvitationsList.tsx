
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGoalStore } from "../../store/goalStore";
import { InvitationCard } from "./InvitationCard";
import { InvitationListItem } from "./InvitationListItem";
import { InvitationStatus, Invitation } from "./types";

export const InvitationsList = () => {
  const { currentUser } = useGoalStore();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch invitations when component mounts
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchInvitations = async () => {
      setIsLoading(true);
      try {
        // First, fetch the pending invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('team_invitations')
          .select('id, from_user_id, to_user_id, status, created_at')
          .eq('to_user_id', currentUser.id)
          .eq('status', 'pending');
          
        if (invitationsError) {
          console.error('Error fetching invitations:', invitationsError);
          setIsLoading(false);
          return;
        }
        
        if (!invitationsData || invitationsData.length === 0) {
          setInvitations([]);
          setIsLoading(false);
          return;
        }
        
        // Then, for each invitation, fetch the sender's name
        const invitationsWithNames = await Promise.all(
          invitationsData.map(async (invitation) => {
            // Get sender's profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', invitation.from_user_id)
              .single();
              
            if (profileError) {
              console.error('Error fetching sender profile:', profileError);
              return {
                ...invitation,
                from_user_name: 'Unknown User',
                status: invitation.status as InvitationStatus
              };
            }
            
            return {
              ...invitation,
              from_user_name: profileData?.name || 'Unknown User',
              status: invitation.status as InvitationStatus
            };
          })
        );
        
        setInvitations(invitationsWithNames as Invitation[]);
      } catch (error) {
        console.error('Error in fetchInvitations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvitations();
    
    // Listen for new invitations
    const invitationsChannel = supabase
      .channel('team_invitations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_invitations',
          filter: `to_user_id=eq.${currentUser.id}`
        },
        () => {
          fetchInvitations();
          toast({
            title: "New Team Invitation",
            description: "You have received a new team invitation.",
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(invitationsChannel);
    };
  }, [currentUser]);

  // Handle when an invitation has been responded to
  const handleInvitationResponded = (invitationId: string) => {
    setInvitations(prevInvitations => 
      prevInvitations.filter(inv => inv.id !== invitationId)
    );
  };

  if (!invitations.length) {
    return null;
  }

  return (
    <InvitationCard 
      title="Pending Invitations" 
      description="Respond to team invitations"
    >
      <ul className="space-y-3">
        {invitations.map((invitation) => (
          <InvitationListItem 
            key={invitation.id} 
            invitation={invitation} 
            onInvitationResponded={handleInvitationResponded}
          />
        ))}
      </ul>
    </InvitationCard>
  );
};
