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
import { Users, Plus, Target, Trophy, Calendar, User, Settings, Crown, LogOut } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { 
  getUserTeams, 
  getTeamById, 
  getTeamMembers, 
  getTeamGoals,
  getTeamMemberGoals,
  createTeam,
  createTeamGoal,
  updateTeamGoal,
  sendTeamInvitation,
  leaveTeam,
  Team,
  TeamMember,
  TeamGoal
} from '../../services/api/teamService';
import { useGoalStore } from '../../store/goalStore';
import { Goal } from '../../types';

export const TeamDashboard: React.FC = () => {
  const { currentUser } = useGoalStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [memberGoals, setMemberGoals] = useState<{ [userId: string]: Goal[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: '',
    deadline: ''
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
      const newGoal = await createTeamGoal(currentTeam.id, goalForm);
      setTeamGoals([newGoal, ...teamGoals]);
      setGoalForm({ title: '', description: '', category: '', deadline: '' });
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
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteEmail}.`,
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
    } catch (error: any) {
      toast({
        title: "Error updating goal",
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
                        <Label htmlFor="goalDeadline">Deadline</Label>
                        <Input
                          id="goalDeadline"
                          type="date"
                          value={goalForm.deadline}
                          onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
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
                  {teamGoals.map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{goal.title}</h4>
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
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                          <Badge variant="outline">{goal.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={goal.progress} className="w-20" />
                          <span className="text-xs font-medium">{goal.progress}%</span>
                        </div>
                      </div>

                      {goal.created_by_user && (
                        <p className="text-xs text-muted-foreground">
                          Created by {goal.created_by_user.name}
                        </p>
                      )}
                    </div>
                  ))}
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
    </div>
  );
};