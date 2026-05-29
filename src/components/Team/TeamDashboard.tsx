import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, Target, Trophy, Calendar, User, Settings, Crown, LogOut, Edit, Trash, Check, Sparkles } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '../../integrations/supabase/client';
import { 
  getUserTeams, 
  getTeamById, 
  getTeamMembers, 
  getTeamGoals,
  getTeamMemberGoals,
  createTeam,
  createTeamGoal,
  updateTeamGoal,
  deleteTeamGoal,
  sendTeamInvitation,
  leaveTeam,
  Team,
  TeamMember,
  TeamGoal
} from '../../services/api/teamService';
import { useGoalStore, calculateHybridProgress, getLocalDateString } from '../../store/goalStore';
import { Goal } from '../../types';
import { cn } from '@/lib/utils';

export const TeamDashboard: React.FC = () => {
  const { currentUser } = useGoalStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [memberGoals, setMemberGoals] = useState<{ [userId: string]: Goal[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const todayStr = getLocalDateString(new Date());

  const handleTeamCheckIn = async (goalId: string) => {
    try {
      await useGoalStore.getState().checkInGoalAction(goalId);
      toast({
        title: "Checked in successfully!",
        description: "Team goal checked in.",
      });
      loadTeamData();
    } catch (error: any) {
      toast({
        title: "Error checking in",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Form states
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durationDays: '30'
  });

  const handleDurationDaysChange = (daysVal: string) => {
    const days = parseInt(daysVal) || 0;
    let deadlineStr = '';
    if (days > 0) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      deadlineStr = d.toISOString().split('T')[0];
    }
    setGoalForm(prev => ({
      ...prev,
      durationDays: daysVal,
      deadline: deadlineStr
    }));
  };

  const handleDeadlineChange = (deadlineStr: string) => {
    let daysStr = '';
    if (deadlineStr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(deadlineStr);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      daysStr = String(diffDays);
    }
    setGoalForm(prev => ({
      ...prev,
      deadline: deadlineStr,
      durationDays: daysStr
    }));
  };

  const [editingGoal, setEditingGoal] = useState<TeamGoal | null>(null);
  const [editGoalForm, setEditGoalForm] = useState({
    id: '',
    title: '',
    description: '',
    category: '',
    deadline: '',
    progress: 0
  });
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (currentTeam) {
      loadTeamData();
    }
  }, [currentTeam]);

  // Subscribe to real-time team goals and members changes for the selected team
  useEffect(() => {
    if (!currentTeam) return;

    const goalsChannel = supabase
      .channel(`public:team_goals:${currentTeam.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_goals',
          filter: `team_id=eq.${currentTeam.id}`
        },
        (payload) => {
          console.log('Real-time team goals update received:', payload);
          loadTeamData();
        }
      )
      .subscribe();

    const membersChannel = supabase
      .channel(`public:team_members:${currentTeam.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `team_id=eq.${currentTeam.id}`
        },
        (payload) => {
          console.log('Real-time team members update received:', payload);
          loadTeamData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [currentTeam]);

  // Subscribe to user team membership changes (to update the active teams list)
  useEffect(() => {
    if (!currentUser) return;

    const userTeamsChannel = supabase
      .channel(`public:user_team_memberships:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('User team membership updated:', payload);
          loadTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userTeamsChannel);
    };
  }, [currentUser]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const userTeams = await getUserTeams();
      setTeams(userTeams);
      if (userTeams.length > 0) {
        setCurrentTeam(userTeams[0]);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Error loading teams",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async () => {
    if (!currentTeam) return;

    try {
      const [team, members, goals, memberGoalsData] = await Promise.all([
        getTeamById(currentTeam.id),
        getTeamMembers(currentTeam.id),
        getTeamGoals(currentTeam.id),
        getTeamMemberGoals(currentTeam.id)
      ]);

      if (team) setCurrentTeam(team);
      setTeamMembers(members);
      setTeamGoals(goals);
      setMemberGoals(memberGoalsData);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: "Error loading team data",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.name.trim()) return;

    try {
      const newTeam = await createTeam(teamForm.name, teamForm.description);
      setTeams([...teams, newTeam]);
      setCurrentTeam(newTeam);
      setTeamForm({ name: '', description: '' });
      setCreateTeamOpen(false);
      toast({
        title: "Team created successfully",
        description: `${newTeam.name} has been created.`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating team",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateGoal = async () => {
    if (!currentTeam || !goalForm.title.trim() || !goalForm.category || !goalForm.deadline) return;

    try {
      const newGoal = await createTeamGoal(currentTeam.id, {
        title: goalForm.title,
        description: goalForm.description,
        category: goalForm.category,
        deadline: goalForm.deadline
      });
      setTeamGoals([newGoal, ...teamGoals]);
      setGoalForm({ 
        title: '', 
        description: '', 
        category: '', 
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        durationDays: '30' 
      });
      setCreateGoalOpen(false);
      toast({
        title: "Team goal created",
        description: `${newGoal.title} has been added to the team goals.`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInviteUser = async () => {
    if (!currentTeam || !inviteEmail.trim()) return;

    try {
      await sendTeamInvitation(inviteEmail, currentTeam.id);
      setInviteEmail('');
      setInviteUserOpen(false);
      toast({
        title: "Invitation sent!",
        description: `${inviteEmail} will receive an in-app notification. They can accept or reject from their notification bell.`,
      });
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveTeam = async () => {
    if (!currentTeam || !currentUser) return;

    const isOwner = currentTeam.owner_id === currentUser.id;
    if (isOwner && teamMembers.length > 1) {
      toast({
        title: "Cannot leave team",
        description: "As the owner, you must transfer ownership before leaving or disband the team.",
        variant: "destructive",
      });
      return;
    }

    try {
      await leaveTeam(currentTeam.id);
      const updatedTeams = teams.filter(team => team.id !== currentTeam.id);
      setTeams(updatedTeams);
      setCurrentTeam(updatedTeams.length > 0 ? updatedTeams[0] : null);
      toast({
        title: "Left team",
        description: `You have left ${currentTeam.name}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error leaving team",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGoalStatus = async (goalId: string, status: 'In Progress' | 'Completed' | 'Cancelled') => {
    try {
      await updateTeamGoal(goalId, { status });
      setTeamGoals(teamGoals.map(goal => 
        goal.id === goalId ? { ...goal, status } : goal
      ));
      toast({
        title: "Goal updated",
        description: `Goal status changed to ${status}.`,
      });
      useGoalStore.getState().fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditGoal = (goal: TeamGoal) => {
    setEditingGoal(goal);
    setEditGoalForm({
      id: goal.id,
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      deadline: goal.deadline,
      progress: goal.progress
    });
    setEditGoalOpen(true);
  };

  const handleUpdateGoal = async () => {
    if (!editGoalForm.title.trim() || !editGoalForm.category || !editGoalForm.deadline) return;

    try {
      const updated = await updateTeamGoal(editGoalForm.id, {
        title: editGoalForm.title,
        description: editGoalForm.description,
        category: editGoalForm.category,
        deadline: editGoalForm.deadline,
        progress: editGoalForm.progress
      });
      setTeamGoals(teamGoals.map(g => g.id === editGoalForm.id ? { ...g, ...updated } : g));
      setEditGoalOpen(false);
      setEditingGoal(null);
      toast({
        title: "Team goal updated",
        description: `${updated.title} has been updated.`,
      });
      useGoalStore.getState().fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm("Are you sure you want to delete this team goal?")) return;
    try {
      await deleteTeamGoal(goalId);
      setTeamGoals(teamGoals.filter(g => g.id !== goalId));
      toast({
        title: "Team goal deleted",
        description: "The team goal has been removed.",
      });
      useGoalStore.getState().fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error deleting goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">Loading team data...</div>
      </div>
    );
  }

  if (!currentTeam && teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            No Team Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Create a team to collaborate with others on goals and track progress together.
          </p>
          <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <Label htmlFor="teamDescription">Description (Optional)</Label>
                  <Textarea
                    id="teamDescription"
                    value={teamForm.description}
                    onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    placeholder="Describe your team's purpose"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateTeamOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={!teamForm.name.trim()}>
                    Create Team
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentTeam?.name}
                  {currentUser && currentTeam?.owner_id === currentUser.id && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {teamMembers.length}/4 members
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {teamMembers.length < 4 && (
                <Dialog open={inviteUserOpen} onOpenChange={setInviteUserOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="inviteEmail">Email or Username</Label>
                        <Input
                          id="inviteEmail"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Enter email or username"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setInviteUserOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleInviteUser} disabled={!inviteEmail.trim()}>
                          Send Invitation
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" size="sm" onClick={handleLeaveTeam}>
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Team Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="team-goals">Team Goals</TabsTrigger>
          <TabsTrigger value="member-goals">Member Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}/4</div>
                <p className="text-xs text-muted-foreground">
                  {4 - teamMembers.length} spots remaining
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Team Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamGoals.length}</div>
                <p className="text-xs text-muted-foreground">
                  {teamGoals.filter(g => g.status === 'Completed').length} completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Team Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamMembers.reduce((sum, member) => sum + (member.user?.streakCount || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined streak days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Team Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Team Goals</CardTitle>
            </CardHeader>
            <CardContent>
              {teamGoals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No team goals yet</p>
              ) : (
                <div className="space-y-4">
                  {teamGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={goal.status === 'Completed' ? 'default' : 'secondary'}>
                          {goal.status}
                        </Badge>
                        <Progress value={goal.progress} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length}/4)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img 
                          src={member.user?.avatar} 
                          alt={member.user?.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.user?.name}</p>
                          {member.role === 'owner' && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.user?.completedGoals} goals completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{member.user?.streakCount} days</p>
                      <p className="text-sm text-muted-foreground">Current streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-goals" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Goals ({teamGoals.length})</CardTitle>
                <Dialog open={createGoalOpen} onOpenChange={setCreateGoalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Team Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="goalTitle">Goal Title</Label>
                        <Input
                          id="goalTitle"
                          value={goalForm.title}
                          onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                          placeholder="Enter goal title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goalDescription">Description (Optional)</Label>
                        <Textarea
                          id="goalDescription"
                          value={goalForm.description}
                          onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                          placeholder="Describe the goal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goalCategory">Category</Label>
                        <Select value={goalForm.category} onValueChange={(value) => setGoalForm({ ...goalForm, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                            <SelectItem value="Career & Education">Career & Education</SelectItem>
                            <SelectItem value="Personal Development">Personal Development</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Relationships">Relationships</SelectItem>
                            <SelectItem value="Hobbies & Creativity">Hobbies & Creativity</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="goalDuration">Complete In (Days)</Label>
                        <Input
                          id="goalDuration"
                          type="number"
                          min="1"
                          value={goalForm.durationDays}
                          onChange={(e) => handleDurationDaysChange(e.target.value)}
                          placeholder="Enter number of days"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goalDeadline">Deadline Date</Label>
                        <Input
                          id="goalDeadline"
                          type="date"
                          value={goalForm.deadline}
                          onChange={(e) => handleDeadlineChange(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateGoalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateGoal} disabled={!goalForm.title.trim() || !goalForm.category || !goalForm.deadline}>
                          Create Goal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {teamGoals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No team goals yet. Create your first team goal!</p>
              ) : (
                <div className="space-y-4">
                  {teamGoals.map((goal) => {
                    const isCheckedIn = goal.last_checked_in === todayStr;
                    const { timeProgress, checkInProgress, overallProgress, totalDuration, daysPassed } = calculateHybridProgress({
                      created_at: goal.created_at,
                      deadline: goal.deadline,
                      completed_days: goal.completed_days
                    });

                    return (
                      <div key={goal.id} className="p-4 border rounded-lg space-y-4 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-base">{goal.title}</h4>
                              {goal.streak && goal.streak > 0 ? (
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-orange-200/10 animate-pulse">
                                  🔥 {goal.streak} Day{goal.streak > 1 ? 's' : ''}
                                </span>
                              ) : null}
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={goal.status} onValueChange={(value) => handleUpdateGoalStatus(goal.id, value as any)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleOpenEditGoal(goal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => handleDeleteGoal(goal.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Hybrid Progress details */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold">Overall Hybrid Progress</span>
                              <span className="font-bold text-primary">{overallProgress}%</span>
                            </div>
                            <Progress value={overallProgress} className="h-2.5">
                              <div className="progress-gradient h-full rounded-full" style={{ width: `${overallProgress}%` }} />
                            </Progress>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="bg-muted/30 p-2 rounded border border-border/20 space-y-1">
                              <span className="text-[10px] text-muted-foreground block font-medium">Time Elapsed (50%)</span>
                              <div className="flex justify-between items-baseline text-xs">
                                <span className="font-bold">{Math.round(timeProgress)}%</span>
                                <span className="text-[10px] text-muted-foreground">{daysPassed} / {totalDuration} Days</span>
                              </div>
                              <Progress value={timeProgress} className="h-1" />
                            </div>

                            <div className="bg-muted/30 p-2 rounded border border-border/20 space-y-1">
                              <span className="text-[10px] text-muted-foreground block font-medium">Check-ins (50%)</span>
                              <div className="flex justify-between items-baseline text-xs">
                                <span className="font-bold">{Math.round(checkInProgress)}%</span>
                                <span className="text-[10px] text-muted-foreground">{goal.completed_days || 0} / {totalDuration} Days</span>
                              </div>
                              <Progress value={checkInProgress} className="h-1" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-[10px]">{goal.category}</Badge>
                            {goal.created_by_user && (
                              <span className="text-[10px] text-muted-foreground">
                                Created by {goal.created_by_user.name}
                              </span>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleTeamCheckIn(goal.id)}
                            disabled={isCheckedIn || goal.status === 'Completed'}
                            size="sm"
                            className={cn(
                              "h-7 text-[11px] font-semibold flex items-center gap-1 transition-all duration-300 rounded-full",
                              isCheckedIn
                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200/20"
                                : goal.status === 'Completed'
                                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm active:scale-95 cursor-pointer"
                            )}
                          >
                            {isCheckedIn ? (
                              <>
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Checked In</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 animate-pulse" />
                                <span>Check In</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="member-goals" className="space-y-6">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <img 
                      src={member.user?.avatar} 
                      alt={member.user?.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {member.user?.name}'s Goals
                  <Badge variant="secondary">
                    {memberGoals[member.user_id]?.length || 0} goals
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!memberGoals[member.user_id] || memberGoals[member.user_id].length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No public goals shared</p>
                ) : (
                  <div className="grid gap-4">
                    {memberGoals[member.user_id].map((goal) => (
                      <div key={goal.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{goal.title}</h4>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                            )}
                          </div>
                          <Badge variant={goal.status === 'Completed' ? 'default' : 'secondary'}>
                            {goal.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {goal.deadline.toLocaleDateString()}
                            </span>
                            <Badge variant="outline">{goal.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={goal.progress} className="w-20" />
                            <span className="text-xs font-medium">{goal.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      <Dialog open={editGoalOpen} onOpenChange={setEditGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editGoalTitle">Goal Title</Label>
              <Input
                id="editGoalTitle"
                value={editGoalForm.title}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, title: e.target.value })}
                placeholder="Enter goal title"
              />
            </div>
            <div>
              <Label htmlFor="editGoalDescription">Description (Optional)</Label>
              <Textarea
                id="editGoalDescription"
                value={editGoalForm.description}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, description: e.target.value })}
                placeholder="Describe the goal"
              />
            </div>
            <div>
              <Label htmlFor="editGoalCategory">Category</Label>
              <Select value={editGoalForm.category} onValueChange={(value) => setEditGoalForm({ ...editGoalForm, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                  <SelectItem value="Career & Education">Career & Education</SelectItem>
                  <SelectItem value="Personal Development">Personal Development</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Relationships">Relationships</SelectItem>
                  <SelectItem value="Hobbies & Creativity">Hobbies & Creativity</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editGoalDeadline">Deadline</Label>
              <Input
                id="editGoalDeadline"
                type="date"
                value={editGoalForm.deadline}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label htmlFor="editGoalProgress">Progress</Label>
                <span className="text-xs font-semibold">{editGoalForm.progress}%</span>
              </div>
              <div className="flex gap-4 items-center">
                <input
                  id="editGoalProgress"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editGoalForm.progress}
                  onChange={(e) => setEditGoalForm({ ...editGoalForm, progress: parseInt(e.target.value) })}
                  className="flex-1 accent-primary cursor-pointer"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditGoalOpen(false); setEditingGoal(null); }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGoal} disabled={!editGoalForm.title.trim() || !editGoalForm.category || !editGoalForm.deadline}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};