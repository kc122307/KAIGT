
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGoalStore } from "../../../store/goalStore";

export const useInvitationSender = () => {
  const { currentUser } = useGoalStore();
  const [isLoading, setIsLoading] = useState(false);

  const sendInvitation = async (email: string) => {
    if (!currentUser) return false;
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter an email address to send an invitation.",
        variant: "destructive",
      });
      return false;
    }

    // Prevent sending invitation to yourself (case-insensitive)
    const inputValue = email.trim().toLowerCase();
    const ownEmail = (currentUser.email || '').trim().toLowerCase();
    const ownName = (currentUser.name || '').trim().toLowerCase();

    if (inputValue === ownEmail || inputValue === ownName) {
      toast({
        title: "Cannot invite yourself",
        description: "You cannot send an invitation to your own account.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // First check if user exists by email (search in name field for now since profiles don't have email)
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('name', email.trim())
        .limit(1);

      if (userError) {
        console.error('Error finding user:', userError);
      }

      let invitationData;
      let invitationType: 'registered' | 'unregistered';

      if (userData && userData.length > 0) {
        // User is registered
        const userId = userData[0].id;
        invitationType = 'registered';

        // Check if invitation already exists for registered user
        const { data: existingInvitation } = await supabase
          .from('team_invitations')
          .select('id')
          .eq('from_user_id', currentUser.id)
          .eq('to_user_id', userId)
          .eq('status', 'pending');

        if (existingInvitation && existingInvitation.length > 0) {
          toast({
            title: "Invitation already sent",
            description: "You have already sent an invitation to this user.",
            variant: "destructive",
          });
          return false;
        }

        invitationData = {
          from_user_id: currentUser.id,
          to_user_id: userId,
          to_email: null,
          status: 'pending',
          invitation_type: invitationType
        };
      } else {
        // User is not registered
        invitationType = 'unregistered';

        // Check if invitation already exists for unregistered user
        const { data: existingInvitation } = await supabase
          .from('team_invitations')
          .select('id')
          .eq('from_user_id', currentUser.id)
          .eq('to_email', email.trim())
          .eq('status', 'pending');

        if (existingInvitation && existingInvitation.length > 0) {
          toast({
            title: "Invitation already sent",
            description: "You have already sent an invitation to this email address.",
            variant: "destructive",
          });
          return false;
        }

        invitationData = {
          from_user_id: currentUser.id,
          to_user_id: null,
          to_email: email.trim(),
          status: 'pending',
          invitation_type: invitationType
        };
      }

      // Create invitation
      const { data: invitation, error: insertError } = await supabase
        .from('team_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (insertError) {
        console.error('Error sending invitation:', insertError);
        toast({
          title: "Failed to send invitation",
          description: "There was an error sending the invitation. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      if (invitationType === 'registered') {
        // Create notification for registered user
        await supabase
          .from('notifications')
          .insert({
            user_id: userData[0].id,
            title: "New Team Invitation",
            message: `${currentUser.name} has invited you to join their team.`,
            type: 'collaboration'
          });

        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${email}. They will see it in their notifications.`,
        });
      } else {
        // Send email to unregistered user
        try {
          const response = await supabase.functions.invoke('send-invitation-email', {
            body: {
              to_email: email.trim(),
              from_user_name: currentUser.name,
              invitation_token: invitation.invitation_token
            }
          });

          if (response.error) {
            console.error('Error sending invitation email:', response.error);
            toast({
              title: "Invitation created but email failed",
              description: "The invitation was created but we couldn't send the email. The user can still register and accept manually.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Invitation sent",
              description: `An invitation email has been sent to ${email}. They will need to register to accept.`,
            });
          }
        } catch (emailError) {
          console.error('Error calling email function:', emailError);
          toast({
            title: "Invitation created but email failed",
            description: "The invitation was created but we couldn't send the email. The user can still register and accept manually.",
            variant: "destructive",
          });
        }
      }

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
