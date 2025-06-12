
import { UserAvatar } from "./UserAvatar";
import { InvitationActions } from "./InvitationActions";
import { useInvitationResponse } from "./hooks/useInvitationResponse";

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
  const { respondToInvitation, isLoading } = useInvitationResponse(onInvitationResponded);

  const handleRespond = (status: InvitationStatus) => {
    respondToInvitation(invitation.id, status);
  };

  return (
    <li className="border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <UserAvatar name={invitation.from_user_name} />
        <div>
          <p className="font-medium">{invitation.from_user_name}</p>
          <p className="text-xs text-muted-foreground">
            Sent {new Date(invitation.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <InvitationActions 
        onRespond={handleRespond}
        isLoading={isLoading}
      />
    </li>
  );
};
