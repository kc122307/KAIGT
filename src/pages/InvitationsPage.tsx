import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Check, X, Mail, Clock, Loader2, Home, User } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { 
  getUserTeamInvitations, 
  acceptTeamInvitation, 
  rejectTeamInvitation,
  TeamInvitation 
} from '../services/api/teamService';
import { useGoalStore } from '../store/goalStore';
import { useGSAP } from "../hooks/useGSAP";

const InvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { containerRef } = useGSAP();
  const fetchUserData = useGoalStore(state => state.fetchUserData);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await getUserTeamInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error loading invitations",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string, teamName: string) => {
    try {
      setProcessingId(id);
      await acceptTeamInvitation(id);
      
      toast({
        title: "Invitation accepted!",
        description: `You have successfully joined ${teamName}.`,
      });
      
      // Update local state
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      
      // Refresh user store context (teams, notifications, goals)
      await fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error accepting invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, teamName: string) => {
    try {
      setProcessingId(id);
      await rejectTeamInvitation(id);
      
      toast({
        title: "Invitation declined",
        description: `You declined the invitation to join ${teamName}.`,
      });
      
      // Update local state
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      
      // Refresh user store context
      await fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error declining invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div ref={containerRef} className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5 scroll-fade">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Team Invitations
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Respond to collaboration requests to start achieving goals together
          </p>
        </div>
        
        {invitations.length > 0 && (
          <Badge variant="outline" className="px-3 py-1 text-sm font-semibold border-primary/30 text-primary bg-primary/5">
            {invitations.length} Pending
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse border border-muted glass-card">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-12 bg-muted rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="h-9 bg-muted rounded flex-1" />
                  <div className="h-9 bg-muted rounded flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <Card className="text-center py-16 px-4 max-w-md mx-auto glass-card flex flex-col items-center gap-5 mt-8 border border-white/20 shadow-xl scroll-fade">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Mail className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No Pending Invitations</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Your inbox is clean! When you are invited to join other teams, they will appear here.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/team">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitations.map((invitation) => {
            const teamName = invitation.team?.name || 'Unknown Team';
            const inviterName = invitation.from_user?.name || 'Someone';
            
            return (
              <Card key={invitation.id} className="scroll-fade flex flex-col justify-between border-white/20 glass-card transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/25">
                      <AvatarImage src={invitation.from_user?.avatar} alt={inviterName} />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">
                        {inviterName}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>Invited {getTimeAgo(invitation.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <div className="space-y-4 pb-6 px-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      {teamName}
                    </h3>
                    {invitation.team?.description ? (
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {invitation.team.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground/60 text-sm italic">
                        No description provided for this team.
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(invitation.id, teamName)}
                      disabled={processingId !== null}
                      className="flex-1 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      {processingId === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleAccept(invitation.id, teamName)}
                      disabled={processingId !== null}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 transition-all duration-200"
                    >
                      {processingId === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;
