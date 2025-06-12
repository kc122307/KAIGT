
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGoalStore } from "../../../store/goalStore";

export const useInvitationSender = () => {
  const { currentUser } = useGoalStore();
  const [isLoading, setIsLoading] = useState(false);

  const sendInvitation = async (email: string) => {
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
        .select('id')
        .eq('email', email.trim());
        
      if (userError) {
        console.error('Error finding user:', userError);
        toast({
          title: "Error",
          description: "There was an error finding the user. Email may not exist in our system.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!userData || userData.length === 0) {
        toast({
          title: "User not found",
          description: "Could not find a user with that email address.",
          variant: "destructive",
        });
        return false;
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
        return false;
      }
        
      if (existingInvitation && existingInvitation.length > 0) {
        toast({
          title: "Invitation already sent",
          description: "You have already sent an invitation to this user.",
          variant: "destructive",
        });
        return false;
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
        return false;
      }
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}.`,
      });
      
      return true;
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendInvitation, isLoading };
};
