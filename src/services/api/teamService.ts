import { supabase } from '@/integrations/supabase/client';
import { User, Goal } from '../../types';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  max_members: number;
  is_active: boolean;
  owner?: User;
  members?: TeamMember[];
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  user?: User;
}

export interface TeamGoal {
  id: string;
  team_id: string;
  created_by: string;
  title: string;
  description: string | null;
  category: string;
  deadline: string;
  status: 'In Progress' | 'Completed' | 'Cancelled';
  progress: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by_user?: User;
  contributions?: TeamGoalContribution[];
  completed_days?: number;
  streak?: number;
  last_checked_in?: string | null;
}

export interface TeamGoalContribution {
  id: string;
  team_goal_id: string;
  user_id: string;
  contribution_points: number;
  notes: string | null;
  updated_at: string;
  user?: User;
}

export interface TeamInvitation {
  id: string;
  team_id: string | null;
  from_user_id: string;
  to_user_id: string | null;
  to_email: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  invitation_type: 'registered' | 'unregistered';
  invitation_token: string | null;
  created_at: string;
  from_user?: User;
  team?: Team;
}

// Team Management Functions

export const createTeam = async (name: string, description?: string): Promise<Team> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: team, error } = await supabase
    .from('teams')
    .insert({
      name,
      description,
      owner_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }

  // Add owner as first member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: user.id,
      role: 'owner'
    });

  if (memberError) {
    console.error('Error adding owner as team member:', memberError);
    // Don't throw error, team is still created
  }

  return team;
};

export const getUserTeams = async (): Promise<Team[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  // First get teams where user is owner
  const { data: ownedTeams, error: ownedError } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_id', user.id)
    .eq('is_active', true);

  if (ownedError) {
    console.error('Error fetching owned teams:', ownedError);
    throw ownedError;
  }

  // Then get teams where user is a member
  const { data: memberTeams, error: memberError } = await supabase
    .from('team_members')
    .select(`
      teams!inner(*)
    `)
    .eq('user_id', user.id);

  if (memberError) {
    console.error('Error fetching member teams:', memberError);
    // Don't throw error, just return owned teams
  }

  // Combine owned teams and member teams, avoiding duplicates
  const allTeams = [...(ownedTeams || [])];
  
  if (memberTeams) {
    memberTeams.forEach((membership: any) => {
      const team = membership.teams;
      if (team && !allTeams.find(t => t.id === team.id)) {
        allTeams.push(team);
      }
    });
  }

  return allTeams;
};

export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members(
        *,
        profiles(id, name, avatar)
      )
    `)
    .eq('id', teamId)
    .single();

  if (error) {
    console.error('Error fetching team:', error);
    return null;
  }

  // Transform the data
  if (team) {
    team.members = team.team_members?.map((member: any) => ({
      ...member,
      user: member.profiles
    }));
    team.member_count = team.team_members?.length || 0;
    delete team.team_members;
  }

  return team;
};

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  // Get all team members (RLS only allows users to see their own memberships)
  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .order('joined_at');

  if (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }

  if (!members || members.length === 0) {
    return [];
  }

  // Manually fetch user profiles for each member
  const membersWithProfiles = await Promise.all(
    members.map(async (member) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, avatar, completed_goals, streak_count')
        .eq('id', member.user_id)
        .single();

      return {
        ...member,
        user: profile ? {
          id: profile.id,
          name: profile.name,
          email: '',
          avatar: profile.avatar || '',
          completedGoals: profile.completed_goals || 0,
          streakCount: profile.streak_count || 0,
          lastActive: null
        } : null
      };
    })
  );

  return membersWithProfiles.filter(member => member.user !== null);
};

export const sendTeamInvitation = async (email: string, teamId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if team is at max capacity
  const { data: memberCount } = await supabase
    .from('team_members')
    .select('id', { count: 'exact' })
    .eq('team_id', teamId);

  if ((memberCount?.length || 0) >= 4) {
    throw new Error('Team is at maximum capacity (4 members)');
  }

  // Check if user exists (by email lookup RPC or by username search)
  let userData: { id: string; name: string }[] | null = null;
  
  if (email.trim().includes('@')) {
    // If it looks like an email, find their UUID using our RPC function
    const { data: userId, error: rpcError } = await supabase.rpc('get_user_id_by_email', { 
      email_to_search: email.trim() 
    });
    
    if (rpcError) {
      console.error('Error invoking get_user_id_by_email RPC:', rpcError);
    }
    
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile for resolved email:', profileError);
      } else if (profile) {
        userData = [profile];
      }
    }
  } else {
    // Lookup by username/name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('name', email.trim())
      .limit(1);
      
    if (profileError) {
      console.error('Error finding user by name:', profileError);
    }
    userData = profile;
  }

  let invitationData: any;
  let invitationType: 'registered' | 'unregistered';

  if (userData && userData.length > 0) {
    // User is registered
    const userId = userData[0].id;
    invitationType = 'registered';

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('from_user_id', user.id)
      .eq('to_user_id', userId)
      .eq('team_id', teamId)
      .eq('status', 'pending');

    if (existingInvitation && existingInvitation.length > 0) {
      throw new Error('Invitation already sent to this user');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (existingMember && existingMember.length > 0) {
      throw new Error('User is already a member of this team');
    }

    invitationData = {
      team_id: teamId,
      from_user_id: user.id,
      to_user_id: userId,
      to_email: null,
      status: 'pending',
      invitation_type: invitationType
    };
  } else {
    // User is not registered
    invitationType = 'unregistered';

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('from_user_id', user.id)
      .eq('to_email', email.trim())
      .eq('team_id', teamId)
      .eq('status', 'pending');

    if (existingInvitation && existingInvitation.length > 0) {
      throw new Error('Invitation already sent to this email');
    }

    invitationData = {
      team_id: teamId,
      from_user_id: user.id,
      to_user_id: null,
      to_email: email.trim(),
      status: 'pending',
      invitation_type: invitationType
    };
  }

  // Perform insert and select the generated invitation_token
  const { data: insertedData, error: insertError } = await supabase
    .from('team_invitations')
    .insert(invitationData)
    .select('invitation_token')
    .single();

  if (insertError) {
    console.error('Error sending invitation:', insertError);
    throw insertError;
  }

  // If unregistered user is invited, trigger the email notification function
  if (invitationType === 'unregistered' && insertedData?.invitation_token) {
    try {
      // Get inviter's profile name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      
      const from_user_name = profileData?.name || 'A teammate';

      console.log('Invoking send-invitation-email edge function...', {
        to_email: email.trim(),
        from_user_name,
        invitation_token: insertedData.invitation_token
      });

      const { error: invokeError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          to_email: email.trim(),
          from_user_name,
          invitation_token: insertedData.invitation_token
        }
      });

      if (invokeError) {
        console.error('Failed to trigger invitation email edge function:', invokeError);
      } else {
        console.log('Invitation email Edge function triggered successfully.');
      }
    } catch (e) {
      console.error('Error invoking invitation email edge function:', e);
    }
  }

  return true;
};

export const acceptTeamInvitation = async (invitationId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get invitation details
  const { data: invitation, error: invitationError } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('id', invitationId)
    .eq('to_user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (invitationError || !invitation) {
    throw new Error('Invitation not found or already processed');
  }

  // Check team capacity
  const { data: memberCount } = await supabase
    .from('team_members')
    .select('id', { count: 'exact' })
    .eq('team_id', invitation.team_id);

  if ((memberCount?.length || 0) >= 4) {
    throw new Error('Team is at maximum capacity');
  }

  // Add user to team (only the user can insert their own membership due to RLS)
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: invitation.team_id,
      user_id: user.id,
      role: 'member'
    });

  if (memberError) {
    console.error('Error adding team member:', memberError);
    throw memberError;
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('team_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  if (updateError) {
    console.error('Error updating invitation:', updateError);
    throw updateError;
  }

  return true;
};

export const rejectTeamInvitation = async (invitationId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('team_invitations')
    .update({ status: 'rejected' })
    .eq('id', invitationId)
    .eq('to_user_id', user.id);

  if (error) {
    console.error('Error rejecting invitation:', error);
    throw error;
  }

  return true;
};

export const getUserTeamInvitations = async (): Promise<TeamInvitation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  // Get basic invitations first
  const { data: invitations, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('to_user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching team invitations:', error);
    throw error;
  }

  if (!invitations || invitations.length === 0) {
    return [];
  }

  // Manually fetch related data to avoid RLS issues
  const enhancedInvitations = await Promise.all(
    invitations.map(async (invitation) => {
      let team = null;
      let from_user = null;

      // Fetch team data if team_id exists
      if (invitation.team_id) {
        const { data: teamData } = await supabase
          .from('teams')
          .select('id, name, description')
          .eq('id', invitation.team_id)
          .single();
        team = teamData;
      }

      // Fetch from_user data
      if (invitation.from_user_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .eq('id', invitation.from_user_id)
          .single();
        
        if (userData) {
          from_user = {
            id: userData.id,
            name: userData.name,
            email: '',
            avatar: userData.avatar || '',
            completedGoals: 0,
            streakCount: 0,
            lastActive: null
          };
        }
      }

      return {
        ...invitation,
        team,
        from_user
      };
    })
  );

  return enhancedInvitations;
};

// Team Goals Functions

export const createTeamGoal = async (teamId: string, goalData: {
  title: string;
  description?: string;
  category: string;
  deadline: string;
}): Promise<TeamGoal> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: goal, error } = await supabase
    .from('team_goals')
    .insert({
      team_id: teamId,
      created_by: user.id,
      ...goalData
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team goal:', error);
    throw error;
  }

  return goal;
};

export const getTeamGoals = async (teamId: string): Promise<TeamGoal[]> => {
  const { data: goals, error } = await supabase
    .from('team_goals')
    .select(`
      *,
      profiles!team_goals_created_by_fkey(id, name, avatar),
      team_goal_contributions(
        *,
        profiles!team_goal_contributions_user_id_fkey(id, name, avatar)
      )
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching team goals:', error);
    throw error;
  }

  return goals?.map((goal: any) => ({
    ...goal,
    created_by_user: goal.profiles ? {
      id: goal.profiles.id,
      name: goal.profiles.name,
      email: '',
      avatar: goal.profiles.avatar || '',
      completedGoals: 0,
      streakCount: 0,
      lastActive: null
    } : null,
    contributions: goal.team_goal_contributions?.map((contrib: any) => ({
      ...contrib,
      user: contrib.profiles ? {
        id: contrib.profiles.id,
        name: contrib.profiles.name,
        email: '',
        avatar: contrib.profiles.avatar || '',
        completedGoals: 0,
        streakCount: 0,
        lastActive: null
      } : null
    })) || []
  })) || [];
};

export const updateTeamGoal = async (goalId: string, updates: {
  title?: string;
  description?: string;
  status?: 'In Progress' | 'Completed' | 'Cancelled';
  progress?: number;
}): Promise<TeamGoal> => {
  const { data: goal, error } = await supabase
    .from('team_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating team goal:', error);
    throw error;
  }

  return goal;
};

export const deleteTeamGoal = async (goalId: string): Promise<void> => {
  const { error } = await supabase
    .from('team_goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting team goal:', error);
    throw error;
  }
};

export const updateTeamGoalContribution = async (goalId: string, contributionPoints: number, notes?: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('team_goal_contributions')
    .upsert({
      team_goal_id: goalId,
      user_id: user.id,
      contribution_points: contributionPoints,
      notes
    });

  if (error) {
    console.error('Error updating team goal contribution:', error);
    throw error;
  }

  return true;
};

export const getTeamMemberGoals = async (teamId: string): Promise<{ [userId: string]: Goal[] }> => {
  // Get team members
  const members = await getTeamMembers(teamId);
  const memberGoals: { [userId: string]: Goal[] } = {};

  // Fetch goals for each member
  await Promise.all(
    members.map(async (member) => {
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', member.user_id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (!error && goals) {
        memberGoals[member.user_id] = goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          deadline: new Date(goal.deadline),
          status: goal.status as 'In Progress' | 'Completed' | 'Cancelled',
          progress: goal.progress,
          isPublic: goal.is_public,
          userId: goal.user_id,
          createdAt: new Date(goal.created_at),
          updatedAt: new Date(goal.updated_at)
        }));
      } else {
        memberGoals[member.user_id] = [];
      }
    })
  );

  return memberGoals;
};

export const leaveTeam = async (teamId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error leaving team:', error);
    throw error;
  }

  return true;
};

export const checkInTeamGoal = async (goalId: string, updates: {
  completed_days: number;
  streak: number;
  last_checked_in: string;
  progress: number;
  status: 'In Progress' | 'Completed' | 'Cancelled';
}): Promise<TeamGoal> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: goal, error } = await supabase
    .from('team_goals')
    .update({
      completed_days: updates.completed_days,
      streak: updates.streak,
      last_checked_in: updates.last_checked_in,
      progress: updates.progress,
      status: updates.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error checking in team goal:', error);
    throw error;
  }

  return goal;
};