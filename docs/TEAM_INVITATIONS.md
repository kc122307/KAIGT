# Team Invitations System

## Overview
The app now features a complete **in-app invitation system** for teams. Users receive notifications directly in the app when invited to join a team, and can accept or decline invitations without needing email.

## How It Works

### For Team Owners/Members Sending Invitations

1. **Navigate to Team Dashboard**
   - Go to `/team` page
   - Click the "Invite" button

2. **Enter Username**
   - Enter the username of the person you want to invite
   - The system will check if they're a registered user
   - Click "Send Invitation"

3. **Confirmation**
   - You'll see a success message: "{username} will receive an in-app notification"
   - The invited user will see a notification in their notification bell

### For Users Receiving Invitations

1. **Notification Bell**
   - A bell icon appears in the sidebar profile section
   - A red badge shows the number of pending invitations

2. **View Invitations**
   - Click the bell icon to open the invitations dropdown
   - See all pending team invitations with:
     - Team name and description
     - Who invited you
     - How long ago the invitation was sent

3. **Respond to Invitations**
   - **Accept**: Join the team immediately
     - Success message: "You've joined {team name}"
     - You'll appear in the team's member list
   
   - **Decline**: Reject the invitation
     - Success message: "You've declined the invitation to {team name}"
     - Invitation is removed from your list

## Features

### Real-time Notifications
- Invitations poll every 30 seconds for updates
- Badge count updates automatically
- Smooth dropdown interface

### User Experience
- Clean, card-based invitation display
- Avatar images for team inviters
- Time-ago stamps (e.g., "5m ago", "2h ago")
- Loading states and error handling
- Success/error toast messages

### Database Structure

**team_invitations table:**
```
- id: UUID
- team_id: UUID (references teams table)
- from_user_id: UUID (user sending invitation)
- to_user_id: UUID (user receiving invitation)
- to_email: string (for unregistered users)
- status: 'pending' | 'accepted' | 'rejected'
- invitation_type: 'registered' | 'unregistered'
- created_at: timestamp
```

## Components

### InvitationsNotificationBell
`src/components/Team/InvitationsNotificationBell.tsx`
- Bell icon with badge in sidebar
- Dropdown menu with invitation list
- Auto-refresh every 30 seconds

### InvitationCard
`src/components/Team/InvitationCard.tsx`
- Individual invitation display
- Accept/Reject buttons
- Team and sender information
- Time-ago display

### TeamDashboard
`src/components/Team/TeamDashboard.tsx`
- Send invitations via username
- Updated messaging for in-app notifications

## API Functions

All located in `src/services/api/teamService.ts`:

```typescript
// Get all pending invitations for current user
getUserTeamInvitations(): Promise<TeamInvitation[]>

// Accept a team invitation
acceptTeamInvitation(invitationId: string): Promise<boolean>

// Reject a team invitation  
rejectTeamInvitation(invitationId: string): Promise<boolean>

// Send invitation to a user (by username)
sendTeamInvitation(email: string, teamId: string): Promise<boolean>
```

## Future Enhancements

Potential improvements:
- Push notifications (browser notifications API)
- Email fallback for unregistered users
- Bulk invitation sending
- Invitation expiration after X days
- Team invitation history
- Custom invitation messages

## Troubleshooting

**No invitations showing up?**
- Check that the database has the `team_invitations` table with `team_id` column
- Verify RLS policies allow users to read their own invitations
- Check browser console for any errors

**Can't accept invitation?**
- Verify team hasn't reached max capacity (4 members)
- Check if you're already a member of the team
- Ensure the invitation is still in 'pending' status

**Invitations not refreshing?**
- The component polls every 30 seconds
- You can close and reopen the dropdown to manually refresh
- Check your network connection
