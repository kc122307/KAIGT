
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGoalStore } from "../../store/goalStore";

export const SendInvitationForm = () => {
  const { currentUser } = useGoalStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email')  // Make sure to include email in the select query
        .eq('email', email.trim());
        
      if (userError) {
        console.error('Error finding user:', userError);
        toast({
          title: "Error",
          description: "There was an error finding the user. Email may not exist in our system.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!userData || userData.length === 0) {
        toast({
          title: "User not found",
          description: "Could not find a user with that email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const userId = userData[0].id;
      
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

  return (
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
  );
};
