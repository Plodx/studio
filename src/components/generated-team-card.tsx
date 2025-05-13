import type { GeneratedGroup, Team } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Circle } from 'lucide-react';

interface GeneratedTeamCardProps {
  group: GeneratedGroup;
  groupNumber: number;
}

const TeamListItem: React.FC<{ team: Team }> = ({ team }) => (
  <li className="flex items-center space-x-3 py-2">
    {team.type === 'strong' ? (
      <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0" aria-label="Strong Team" />
    ) : (
      <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" aria-label="Weak Team" />
    )}
    <span className="text-base">{team.name}</span>
  </li>
);

export function GeneratedTeamCard({ group, groupNumber }: GeneratedTeamCardProps) {
  return (
    <Card className="w-full shadow-xl transform transition-all hover:scale-[1.02] duration-300 ease-out bg-card rounded-lg border">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center text-primary">
          Group {groupNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
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
      </CardContent>
    </Card>
  );
}
