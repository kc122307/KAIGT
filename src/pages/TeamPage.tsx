import { TeamDashboard } from "../components/Team/TeamDashboard";
import { TeamInvitationResponse } from "../components/Team/TeamInvitationResponse";
import { useGSAP } from "../hooks/useGSAP";

const TeamPage = () => {
  const { containerRef } = useGSAP();
  
  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between scroll-fade">
        <h1 className="text-3xl font-bold">Team Collaboration</h1>
        <p className="text-muted-foreground">Achieve goals together with your team</p>
      </div>
      
      {/* Team invitation responses */}
      <div className="scroll-fade">
        <TeamInvitationResponse />
      </div>
      
      {/* Comprehensive team dashboard */}
      <div className="scroll-fade">
        <TeamDashboard />
      </div>
    </div>
  );
};

export default TeamPage;
