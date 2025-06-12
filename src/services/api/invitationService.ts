
import { supabase } from '@/integrations/supabase/client';

export const processInvitationToken = async (token: string, userId: string) => {
  try {
    // Find the invitation by token
    const { data: invitation, error: findError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !invitation) {
      console.error('Invitation not found:', findError);
      return { success: false, error: 'Invalid or expired invitation token' };
    }

    // Update the invitation to link it to the new user
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({
        to_user_id: userId,
        to_email: null,
        invitation_type: 'registered'
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return { success: false, error: 'Failed to process invitation' };
    }

    // Create a notification for the new user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: "Team Invitation Ready",
        message: "Your team invitation is ready to accept. Check your notifications.",
        type: 'collaboration'
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    return { success: true };

  } catch (error) {
    console.error('Error processing invitation token:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
