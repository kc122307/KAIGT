
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'ignored';

export interface Invitation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: InvitationStatus;
  created_at: string;
  from_user_name: string;
}

interface InvitationListItemProps {
  invitation: Invitation;
  onInvitationResponded: (invitationId: string) => void;
}

export const InvitationListItem = ({ 
  invitation, 
  onInvitationResponded 
}: InvitationListItemProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Handle invitation response (accept, reject, ignore)
  const respondToInvitation = async (status: InvitationStatus) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status })
        .eq('id', invitation.id);
        
      if (error) {
        toast({
          title: "Error",
          description: `Failed to ${status} invitation. Please try again.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Success",
        description: `You have ${status} the invitation.`,
      });
      
      onInvitationResponded(invitation.id);
      
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
    <li className="border rounded-lg p-4">
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
          onClick={() => respondToInvitation('ignored')}
          disabled={isLoading}
        >
          Ignore
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => respondToInvitation('rejected')}
          disabled={isLoading}
        >
          Reject
        </Button>
        <Button
          size="sm"
          onClick={() => respondToInvitation('accepted')}
          disabled={isLoading}
        >
          Accept
        </Button>
      </div>
    </li>
  );
};
