
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'ignored';
export type InvitationType = 'registered' | 'unregistered';

export interface Invitation {
  id: string;
  from_user_id: string;
  to_user_id: string | null;
  to_email: string | null;
  status: InvitationStatus;
  invitation_type: InvitationType;
  invitation_token: string | null;
  created_at: string;
  from_user_name: string;
}
