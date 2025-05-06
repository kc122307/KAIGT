
import { useState, useEffect } from "react";
import { useGoalStore } from "../../store/goalStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Invitation = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  created_at: string;
  from_user_name: string;
};

export const TeamInvitation = () => {
  const { currentUser } = useGoalStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Fetch invitations when component mounts
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchInvitations = async () => {
      try {
        const { data, error } = await supabase
          .from('team_invitations')
          .select(`
            id, 
            from_user_id, 
            to_user_id, 
            status, 
            created_at,
            profiles!team_invitations_from_user_id_fkey(name)
          `)
          .eq('to_user_id', currentUser.id)
          .eq('status', 'pending');
          
        if (error) {
          console.error('Error fetching invitations:', error);
          return;
        }
        
        if (!data) return;
        
        // Format the invitations data
        const formattedInvitations = data.map(inv => ({
          id: inv.id,
          from_user_id: inv.from_user_id,
          to_user_id: inv.to_user_id,
          status: inv.status as 'pending' | 'accepted' | 'rejected' | 'ignored',
          created_at: inv.created_at,
          from_user_name: inv.profiles?.name || 'Unknown User'
        }));
        
        setInvitations(formattedInvitations);
      } catch (error) {
        console.error('Error in fetchInvitations:', error);
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

  // Send invitation to another user
  const sendInvitation = async () => {
    if (!currentUser) return;
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter an email address to send an invitation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Find user by email
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email);
        
      if (userError || !users || users.length === 0) {
        toast({
          title: "User not found",
          description: "Could not find a user with that email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const userId = users[0].id;
      
      // Check if invitation already exists
      const { data: existingInvitation, error: invitationError } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('from_user_id', currentUser.id)
        .eq('to_user_id', userId)
        .eq('status', 'pending');
        
      if (invitationError) {
        console.error('Error checking existing invitation:', invitationError);
        toast({
          title: "Error",
          description: "There was an error checking for existing invitations.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
        
      if (existingInvitation && existingInvitation.length > 0) {
        toast({
          title: "Invitation already sent",
          description: "You have already sent an invitation to this user.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Create new invitation
      const { error: insertError } = await supabase
        .from('team_invitations')
        .insert({
          from_user_id: currentUser.id,
          to_user_id: userId,
          status: 'pending'
        });
        
      if (insertError) {
        console.error('Error sending invitation:', insertError);
        toast({
          title: "Failed to send invitation",
          description: "There was an error sending the invitation. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}.`,
      });
      
      setEmail("");
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle invitation response (accept, reject, ignore)
  const respondToInvitation = async (invitationId: string, status: 'accepted' | 'rejected' | 'ignored') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status })
        .eq('id', invitationId);
        
      if (error) {
        toast({
          title: "Error",
          description: `Failed to ${status} invitation. Please try again.`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `You have ${status} the invitation.`,
      });
      
      // Remove the invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
    } catch (error) {
      console.error(`Error ${status} invitation:`, error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Team Invitation</CardTitle>
          <CardDescription>Invite teammates to join your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input 
              placeholder="Enter email address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={sendInvitation} 
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Respond to team invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {invitations.map((invitation) => (
                <li key={invitation.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.from_user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Sent {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => respondToInvitation(invitation.id, 'ignored')}
                      disabled={isLoading}
                    >
                      Ignore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => respondToInvitation(invitation.id, 'rejected')}
                      disabled={isLoading}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => respondToInvitation(invitation.id, 'accepted')}
                      disabled={isLoading}
                    >
                      Accept
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
