import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Leaderboard } from './Leaderboard';

// Mock the useLeaderboard hook
vi.mock('../hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({
    players: [
      { username: 'player1', pixelsPlaced: 100, rank: 1, team: 'red' },
      { username: 'player2', pixelsPlaced: 80, rank: 2, team: 'blue' },
      { username: 'player3', pixelsPlaced: 60, rank: 3, team: 'green' },
    ],
    teams: [
      { teamId: 'red', teamName: 'Red Team', zonesControlled: 30, totalPixels: 500, rank: 1 },
      { teamId: 'blue', teamName: 'Blue Team', zonesControlled: 25, totalPixels: 400, rank: 2 },
      { teamId: 'green', teamName: 'Green Team', zonesControlled: 20, totalPixels: 300, rank: 3 },
      { teamId: 'yellow', teamName: 'Yellow Team', zonesControlled: 15, totalPixels: 200, rank: 4 },
    ],
    userRank: 1,
    loading: false,
    refresh: vi.fn(),
  }),
}));

describe('Leaderboard', () => {
  const mockTeam = { id: 'red', name: 'Red Team', color: '#FF4444' };

  it('should not render when closed', () => {
    const { container } = render(
      <Leaderboard isOpen={false} onClose={vi.fn()} userTeam={mockTeam} username="player1" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open', () => {
    render(
      <Leaderboard isOpen={true} onClose={vi.fn()} userTeam={mockTeam} username="player1" />
    );
    expect(screen.getByText('🏆 Leaderboard')).toBeInTheDocument();
  });

  it('should show player rankings by default', () => {
    render(
      <Leaderboard isOpen={true} onClose={vi.fn()} userTeam={mockTeam} username="player1" />
    );
    expect(screen.getByText('player1')).toBeInTheDocument();
    expect(screen.getByText('100 pixels')).toBeInTheDocument();
  });

  it('should switch to team standings tab', () => {
    render(
      <Leaderboard isOpen={true} onClose={vi.fn()} userTeam={mockTeam} username="player1" />
    );
    
    const teamsTab = screen.getByText('👥 Teams');
    fireEvent.click(teamsTab);
    
    expect(screen.getByText('Red Team')).toBeInTheDocument();
    expect(screen.getByText('Blue Team')).toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Leaderboard isOpen={true} onClose={onClose} userTeam={mockTeam} username="player1" />
    );
    
    const backdrop = container.querySelector('.fixed.inset-0.bg-black');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Leaderboard isOpen={true} onClose={onClose} userTeam={mockTeam} username="player1" />
    );
    
    const closeButton = screen.getByLabelText('Close leaderboard');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should display user rank in footer', () => {
    render(
      <Leaderboard isOpen={true} onClose={vi.fn()} userTeam={mockTeam} username="player1" />
    );
    expect(screen.getByText(/Your rank:/)).toBeInTheDocument();
    expect(screen.getByText(/#1/)).toBeInTheDocument();
  });

  it('should highlight current user in player rankings', () => {
    const { container } = render(
      <Leaderboard isOpen={true} onClose={vi.fn()} userTeam={mockTeam} username="player1" />
    );
    
    const userElement = screen.getByText(/player1 \(You\)/);
    expect(userElement).toBeInTheDocument();
    
    // Check for purple styling
    const userContainer = userElement.closest('.bg-purple-50');
    expect(userContainer).toBeInTheDocument();
  });

  it('should show medals for top 3 players', () => {
    render(
      <Leaderboard isOpen={true} onClose={vi.fn()} userTeam={mockTeam} username="player1" />
    );
    
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
  });
});
