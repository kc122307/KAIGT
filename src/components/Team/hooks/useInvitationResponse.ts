
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InvitationStatus } from "../types";

export const useInvitationResponse = (onSuccess: (invitationId: string) => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const respondToInvitation = async (invitationId: string, status: InvitationStatus) => {
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
      
      onSuccess(invitationId);
      
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

  return { respondToInvitation, isLoading };
};
