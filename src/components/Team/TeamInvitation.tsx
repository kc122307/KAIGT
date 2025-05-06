
import { SendInvitationForm } from "./SendInvitationForm";
import { InvitationsList } from "./InvitationsList";

export const TeamInvitation = () => {
  return (
    <div className="space-y-6">
      <SendInvitationForm />
      <InvitationsList />
    </div>
  );
};
