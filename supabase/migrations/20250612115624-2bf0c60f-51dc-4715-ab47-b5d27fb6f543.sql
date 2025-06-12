
-- Add email field to team_invitations table to support inviting unregistered users
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS to_email TEXT;

-- Make to_user_id nullable since we might not have a user_id for unregistered users
ALTER TABLE public.team_invitations 
ALTER COLUMN to_user_id DROP NOT NULL;

-- Add constraint to ensure either to_user_id or to_email is provided
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_recipient' 
        AND table_name = 'team_invitations'
    ) THEN
        ALTER TABLE public.team_invitations 
        ADD CONSTRAINT check_recipient CHECK (
          (to_user_id IS NOT NULL AND to_email IS NULL) OR 
          (to_user_id IS NULL AND to_email IS NOT NULL)
        );
    END IF;
END $$;

-- Add invitation_type to distinguish between registered and unregistered user invitations
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS invitation_type TEXT NOT NULL DEFAULT 'registered';

-- Add token for unregistered user invitations
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(to_email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(invitation_token);

-- Enable Row Level Security
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can update their received invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Create RLS policies for team_invitations
CREATE POLICY "Users can view invitations sent to them" 
ON public.team_invitations 
FOR SELECT 
USING (
  auth.uid() = to_user_id OR 
  auth.uid() = from_user_id
);

CREATE POLICY "Users can create invitations" 
ON public.team_invitations 
FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their received invitations" 
ON public.team_invitations 
FOR UPDATE 
USING (auth.uid() = to_user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);
