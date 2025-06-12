
import { Button } from "@/components/ui/button";
import { InvitationStatus } from "./types";

interface InvitationActionsProps {
  onRespond: (status: InvitationStatus) => void;
  isLoading: boolean;
}

export const InvitationActions = ({ onRespond, isLoading }: InvitationActionsProps) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRespond('ignored')}
        disabled={isLoading}
      >
        Ignore
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onRespond('rejected')}
        disabled={isLoading}
      >
        Reject
      </Button>
      <Button
        size="sm"
        onClick={() => onRespond('accepted')}
        disabled={isLoading}
      >
        Accept
      </Button>
    </div>
  );
};
