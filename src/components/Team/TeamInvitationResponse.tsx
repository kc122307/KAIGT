import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Check, X, Mail } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { 
  getUserTeamInvitations, 
  acceptTeamInvitation, 
  rejectTeamInvitation,
  TeamInvitation 
} from '../../services/api/teamService';

export const TeamInvitationResponse: React.FC = () => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const userInvitations = await getUserTeamInvitations();
      setInvitations(userInvitations);
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

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      setProcessingInvitation(invitationId);
      await acceptTeamInvitation(invitationId);
      
      // Remove the accepted invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast({
        title: "Invitation accepted",
        description: "You have successfully joined the team!",
      });
    } catch (error: any) {
      toast({
        title: "Error accepting invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      setProcessingInvitation(invitationId);
      await rejectTeamInvitation(invitationId);
      
      // Remove the rejected invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast({
        title: "Invitation rejected",
        description: "The team invitation has been declined.",
      });
    } catch (error: any) {
      toast({
        title: "Error rejecting invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingInvitation(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Team Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-pulse">Loading invitations...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show the component if there are no invitations
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Team Invitations
          <Badge variant="secondary">{invitations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <img 
                        src={invitation.from_user?.avatar} 
                        alt={invitation.from_user?.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {invitation.from_user?.name} invited you to join
                      </p>
                      <p className="text-lg font-semibold text-blue-600">
                        {invitation.team?.name}
                      </p>
                    </div>
                  </div>
                  
                  {invitation.team?.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {invitation.team.description}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Received {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectInvitation(invitation.id)}
                    disabled={processingInvitation === invitation.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    disabled={processingInvitation === invitation.id}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};