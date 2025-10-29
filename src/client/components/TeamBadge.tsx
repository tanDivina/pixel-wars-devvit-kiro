import type { Team } from '../../shared/types/game';

interface TeamBadgeProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  glow?: boolean;
  className?: string;
}

export const TeamBadge = ({ 
  team, 
  size = 'md', 
  showName = false, 
  glow = false,
  className = '' 
}: TeamBadgeProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const glowClass = glow ? 'shadow-lg' : '';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded flex-shrink-0 ${glowClass} transition-all duration-300`}
        style={{ 
          backgroundColor: team.color,
          boxShadow: glow ? `0 0 10px ${team.color}` : undefined,
        }}
        title={team.name}
      />
      {showName && (
        <span className="font-semibold">{team.name}</span>
      )}
    </div>
  );
};

interface TeamBadgeListProps {
  teams: Team[];
  currentTeamId?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TeamBadgeList = ({ teams, currentTeamId, size = 'sm' }: TeamBadgeListProps) => {
  return (
    <div className="flex items-center gap-3">
      {teams.map((team) => {
        const isCurrentTeam = team.id === currentTeamId;
        return (
          <TeamBadge
            key={team.id}
            team={team}
            size={size}
            glow={isCurrentTeam}
            className={isCurrentTeam ? 'opacity-100' : 'opacity-60'}
          />
        );
      })}
    </div>
  );
};
