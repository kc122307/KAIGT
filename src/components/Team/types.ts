
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'ignored';

export interface Invitation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: InvitationStatus;
  created_at: string;
  from_user_name: string;
}
