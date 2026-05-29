# Testing Team Invitations Feature

## Prerequisites
- Two user accounts registered in the app
- At least one team created by User A

## Test Scenario: Complete Invitation Flow

### Step 1: User A Sends Invitation

1. **Login as User A** (team owner)
2. **Navigate to Team page** (`/team`)
3. **Click "Invite" button** in the team header
4. **Enter User B's username** in the dialog
5. **Click "Send Invitation"**
6. **Verify success toast:** 
   - Should say: "{username} will receive an in-app notification. They can accept or reject from their notification bell."

### Step 2: User B Receives Notification

1. **Login as User B** (or switch accounts)
2. **Check the sidebar** - you should see:
   - Bell icon in the profile section
   - Red badge with number "1" on the bell
3. **Click the bell icon**
4. **Verify invitation display:**
   - Dropdown opens showing invitation card
   - Shows User A's name and avatar
   - Shows team name and description
   - Shows "X minutes/hours ago" timestamp
   - Has "Accept" and "Decline" buttons

### Step 3: User B Accepts Invitation

1. **Click "Accept" button**
2. **Verify success toast:**
   - Should say: "Invitation accepted! You've joined {team name}"
3. **Verify invitation disappears** from dropdown
4. **Verify badge count** updates to 0
5. **Navigate to Team page** (`/team`)
6. **Verify you see the team** in your teams list
7. **Verify you appear** in the team members list

### Step 4: Test Rejection (Alternative Path)

1. **Setup:** Repeat Steps 1-2 with a different team
2. **Click "Decline" button** instead
3. **Verify success toast:**
   - Should say: "Invitation declined. You've declined the invitation to {team name}"
4. **Verify invitation disappears** from dropdown
5. **Verify you do NOT join the team**

## Edge Cases to Test

### Test 1: Multiple Invitations
- Have User A send invitations from 2 different teams
- Badge should show "2"
- Both invitations should appear in dropdown
- Accept one, decline another
- Badge should update correctly

### Test 2: Team at Max Capacity
- Create a team with 4 members
- Try to send an invitation
- Should receive error: "Team is at maximum capacity (4 members)"

### Test 3: Already a Member
- Try to invite someone who's already in the team
- Should receive error: "User is already a member of this team"

### Test 4: Duplicate Invitation
- Send invitation to User B
- Try to send another invitation to User B for same team
- Should receive error: "Invitation already sent to this user"

### Test 5: Auto-refresh
- Login as User B with bell dropdown closed
- Have User A send an invitation
- Wait 30 seconds (auto-refresh interval)
- Bell badge should update automatically

### Test 6: Invalid Username
- Try to send invitation with username that doesn't exist
- Invitation should still be created (for unregistered users)
- to_email field should be populated
- Note: Unregistered users won't see the notification until they register

## Visual Checks

✅ **Bell Icon:**
- Appears in sidebar profile section
- Badge is red and clearly visible
- Badge shows correct count

✅ **Dropdown:**
- Opens smoothly
- Proper width (96 units / ~384px)
- Scrollable if many invitations
- Header shows invitation count

✅ **Invitation Cards:**
- Avatar displays correctly
- Text is readable
- Buttons are responsive
- Time-ago updates correctly
- Cards have left border accent

✅ **Responsive Design:**
- Works on desktop
- Dropdown doesn't overflow screen
- Buttons are clickable
- Toast messages appear correctly

## Expected API Calls

When testing, check Network tab for these calls:

1. **On bell mount/refresh:**
   - GET to Supabase: `team_invitations` table
   - Filter: `to_user_id = current_user_id` AND `status = 'pending'`

2. **On Accept:**
   - POST to `team_members` table
   - UPDATE `team_invitations` set `status = 'accepted'`

3. **On Decline:**
   - UPDATE `team_invitations` set `status = 'rejected'`

4. **On Send Invitation:**
   - INSERT into `team_invitations` table

## Troubleshooting

**Bell icon not showing:**
- Check if InvitationsNotificationBell is imported in Sidebar.tsx
- Verify user is logged in

**No invitations appearing:**
- Check database: `SELECT * FROM team_invitations WHERE to_user_id = 'user_b_id'`
- Verify `team_id` column exists and has data
- Check browser console for errors

**Can't accept invitation:**
- Verify team has space (< 4 members)
- Check RLS policies on team_members table
- Ensure invitation status is 'pending'

**Badge not updating:**
- Wait for 30-second auto-refresh
- Close and reopen dropdown to force refresh
- Check if getUserTeamInvitations is returning correct data
