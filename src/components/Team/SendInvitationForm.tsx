
import { useState } from "react";
import { InvitationCard } from "./InvitationCard";
import { EmailInput } from "./EmailInput";
import { SendButton } from "./SendButton";
import { useInvitationSender } from "./hooks/useInvitationSender";

export const SendInvitationForm = () => {
  const [email, setEmail] = useState("");
  const { sendInvitation, isLoading } = useInvitationSender();

  const handleSendInvitation = async () => {
    const success = await sendInvitation(email);
    if (success) {
      setEmail("");
    }
  };

  return (
    <InvitationCard 
      title="Send Team Invitation" 
      description="Invite teammates to join your team"
    >
      <div className="flex gap-3">
        <EmailInput 
          value={email} 
          onChange={setEmail}
        />
        <SendButton 
          onClick={handleSendInvitation} 
          isLoading={isLoading}
        />
      </div>
    </InvitationCard>
  );
};
