import type { GeneratedGroup, Team } from '@/app/actions';
import { Separator } from '@/components/ui/separator';
import { Shield, ShieldCheck, ShieldOff, Users } from 'lucide-react';

interface GeneratedTeamCardProps {
  group: GeneratedGroup;
}

const TeamListItem: React.FC<{ team: Team }> = ({ team }) => (
  <li className="flex items-center space-x-3 py-2">
    {team.type === 'strong' ? (
      <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0" aria-label="Strong Team" />
    ) : team.type === 'weak' ? (
      <ShieldOff className="h-6 w-6 text-muted-foreground flex-shrink-0" aria-label="Weak Team" />
    ) : team.type === 'medium' ? (
      <Shield className="h-6 w-6 text-accent flex-shrink-0" aria-label="Medium Team" />
    ) : (
      <Users className="h-6 w-6 text-primary/80 flex-shrink-0" aria-label="Neutral Team" />
    )}
    <span className="text-base">{team.name}</span>
  </li>
);

export function GeneratedTeamCard({ group }: GeneratedTeamCardProps) {
  const isRandomMode = group.weakTeams.length === 0 && !group.mediumTeams;
  const isBalancedV2 = !!group.mediumTeams && group.mediumTeams.length > 0;

  if (isRandomMode) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2 border-b border-border pb-1">
            Teams
          </h3>
          <ul className="space-y-1">
            {group.strongTeams.map((team) => (
              <TeamListItem key={`${group.id}-neutral-${team.name}`} team={team} />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (isBalancedV2) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2 border-b border-border pb-1">
            Strong Teams
          </h3>
          <ul className="space-y-1">
            {group.strongTeams.map((team) => (
              <TeamListItem key={`${group.id}-strong-${team.name}`} team={team} />
            ))}
          </ul>
        </div>
        <Separator className="my-3" />
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2 border-b border-border pb-1">
            Medium Teams
          </h3>
          <ul className="space-y-1">
            {group.mediumTeams!.map((team) => (
              <TeamListItem key={`${group.id}-medium-${team.name}`} team={team} />
            ))}
          </ul>
        </div>
        <Separator className="my-3" />
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2 border-b border-border pb-1">
            Weak Teams
          </h3>
          <ul className="space-y-1">
            {group.weakTeams.map((team) => (
              <TeamListItem key={`${group.id}-weak-${team.name}`} team={team} />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Default to Balanced mode
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2 border-b border-border pb-1">
          Strong Teams
        </h3>
        <ul className="space-y-1">
          {group.strongTeams.map((team) => (
            <TeamListItem key={`${group.id}-strong-${team.name}`} team={team} />
          ))}
        </ul>
      </div>
      <Separator className="my-3" />
      <div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2 border-b border-border pb-1">
          Weak Teams
        </h3>
        <ul className="space-y-1">
          {group.weakTeams.map((team) => (
            <TeamListItem key={`${group.id}-weak-${team.name}`} team={team} />
          ))}
        </ul>
      </div>
    </div>
  );
}
