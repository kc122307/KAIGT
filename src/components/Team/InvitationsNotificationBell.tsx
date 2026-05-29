import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getUserTeamInvitations, TeamInvitation } from '@/services/api/teamService';
import { InvitationCard } from './InvitationCard';

export const InvitationsNotificationBell: React.FC = () => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadInvitations();
    
    // Poll for new invitations every 30 seconds
    const interval = setInterval(loadInvitations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await getUserTeamInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationProcessed = () => {
    // Reload invitations after accept/reject
    loadInvitations();
  };

  const pendingCount = invitations.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Team Invitations</h3>
          <p className="text-sm text-muted-foreground">
            {pendingCount === 0 ? 'No pending invitations' : `${pendingCount} pending invitation${pendingCount > 1 ? 's' : ''}`}
          </p>
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading invitations...
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No pending invitations</p>
              <p className="text-xs mt-1">You'll see team invitations here</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onProcessed={handleInvitationProcessed}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
