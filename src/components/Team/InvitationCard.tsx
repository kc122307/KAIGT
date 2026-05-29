import React, { useState } from 'react';
import { Users, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { acceptTeamInvitation, rejectTeamInvitation, TeamInvitation } from '@/services/api/teamService';

interface InvitationCardProps {
  invitation: TeamInvitation;
  onProcessed: () => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ invitation, onProcessed }) => {
  const [processing, setProcessing] = useState(false);

  const handleAccept = async () => {
    try {
      setProcessing(true);
      await acceptTeamInvitation(invitation.id);
      
      toast({
        title: "Invitation accepted!",
        description: `You've joined ${invitation.team?.name || 'the team'}.`,
      });
      
      onProcessed();
    } catch (error: any) {
      toast({
        title: "Failed to accept invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      await rejectTeamInvitation(invitation.id);
      
      toast({
        title: "Invitation declined",
        description: `You've declined the invitation to ${invitation.team?.name || 'the team'}.`,
      });
      
      onProcessed();
    } catch (error: any) {
      toast({
        title: "Failed to reject invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
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
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 mt-1">
            <AvatarImage src={invitation.from_user?.avatar} alt={invitation.from_user?.name} />
            <AvatarFallback>
              <Users className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {invitation.from_user?.name || 'Someone'} invited you to join
                </p>
                <p className="font-bold text-base mt-1">
                  {invitation.team?.name || 'a team'}
                </p>
                {invitation.team?.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {invitation.team.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(invitation.created_at)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={processing}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={processing}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
