import { useEffect, useState, useCallback } from 'react';
import type { LeaderboardResponse } from '../../shared/types/api';
import type { PlayerRanking, TeamRanking } from '../../shared/types/game';
import { LEADERBOARD_REFRESH_INTERVAL } from '../../shared/constants/config';

export const useLeaderboard = () => {
  const [players, setPlayers] = useState<PlayerRanking[]>([]);
  const [teams, setTeams] = useState<TeamRanking[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) return;

      const data: LeaderboardResponse = await res.json();
      if (data.type !== 'leaderboard') return;

      setPlayers(data.players);
      setTeams(data.teams);
      setUserRank(data.userRank);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, LEADERBOARD_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return {
    players,
    teams,
    userRank,
    loading,
    refresh: fetchLeaderboard,
  } as const;
};
