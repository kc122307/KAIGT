
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGoalStore } from "../../../store/goalStore";
import { sendTeamInvitation, getUserTeams } from "../../../services/api/teamService";

export const useInvitationSender = () => {
  const { currentUser } = useGoalStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

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
      // Get or create user's team
      let teamId = currentTeamId;
      if (!teamId) {
        const userTeams = await getUserTeams();
        if (userTeams.length === 0) {
          // Create a default team for the user
          const { createTeam } = await import('../../../services/api/teamService');
          const team = await createTeam(`${currentUser.name}'s Team`, 'Default team for goal collaboration');
          teamId = team.id;
        } else {
          teamId = userTeams[0].id;
        }
        setCurrentTeamId(teamId);
      }

      // Use the team service to send invitation
      await sendTeamInvitation(email, teamId!);
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}.`,
      });

      return true;

    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "There was an error sending the invitation. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendInvitation, isLoading };
};
