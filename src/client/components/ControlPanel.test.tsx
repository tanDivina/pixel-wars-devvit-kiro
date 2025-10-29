import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from './ControlPanel';

describe('ControlPanel', () => {
  const mockConfig = {
    canvasWidth: 100,
    canvasHeight: 100,
    creditCooldown: 120,
    maxCredits: 10,
    initialCredits: 5,
    zoneSize: 10,
    teams: [
      { id: 'red', name: 'Red Team', color: '#FF4444' },
      { id: 'blue', name: 'Blue Team', color: '#4444FF' },
      { id: 'green', name: 'Green Team', color: '#44FF44' },
    ],
  };

  const mockTeam = { id: 'red', name: 'Red Team', color: '#FF4444' };

  const defaultProps = {
    config: mockConfig,
    userTeam: mockTeam,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onResetView: vi.fn(),
    onToggleLeaderboard: vi.fn(),
    currentZoom: 1,
  };

  it('should render control panel', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.getByText(/Click to place pixels/)).toBeInTheDocument();
  });

  it('should display current zoom percentage', () => {
    render(<ControlPanel {...defaultProps} currentZoom={1.5} />);
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('should call onZoomIn when zoom in button is clicked', () => {
    const onZoomIn = vi.fn();
    render(<ControlPanel {...defaultProps} onZoomIn={onZoomIn} />);
    
    const zoomInButton = screen.getByLabelText('Zoom in');
    fireEvent.click(zoomInButton);
    expect(onZoomIn).toHaveBeenCalled();
  });

  it('should call onZoomOut when zoom out button is clicked', () => {
    const onZoomOut = vi.fn();
    render(<ControlPanel {...defaultProps} onZoomOut={onZoomOut} />);
    
    const zoomOutButton = screen.getByLabelText('Zoom out');
    fireEvent.click(zoomOutButton);
    expect(onZoomOut).toHaveBeenCalled();
  });

  it('should call onResetView when reset button is clicked', () => {
    const onResetView = vi.fn();
    render(<ControlPanel {...defaultProps} onResetView={onResetView} />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    expect(onResetView).toHaveBeenCalled();
  });

  it('should call onToggleLeaderboard when leaderboard button is clicked', () => {
    const onToggleLeaderboard = vi.fn();
    render(<ControlPanel {...defaultProps} onToggleLeaderboard={onToggleLeaderboard} />);
    
    const leaderboardButton = screen.getByTitle('View leaderboard');
    fireEvent.click(leaderboardButton);
    expect(onToggleLeaderboard).toHaveBeenCalled();
  });

  it('should display all team names on desktop', () => {
    render(<ControlPanel {...defaultProps} />);
    
    // These are hidden on mobile but visible on desktop
    expect(screen.getByText('Red Team')).toBeInTheDocument();
    expect(screen.getByText('Blue Team')).toBeInTheDocument();
    expect(screen.getByText('Green Team')).toBeInTheDocument();
  });

  it('should highlight user team', () => {
    const { container } = render(<ControlPanel {...defaultProps} />);
    
    const redTeamElement = screen.getByText('Red Team');
    const redTeamContainer = redTeamElement.closest('.font-semibold');
    expect(redTeamContainer).toBeInTheDocument();
  });

  it('should render without config', () => {
    render(<ControlPanel {...defaultProps} config={null} />);
    expect(screen.getByText(/Click to place pixels/)).toBeInTheDocument();
  });

  it('should render without user team', () => {
    render(<ControlPanel {...defaultProps} userTeam={null} />);
    expect(screen.getByText(/Click to place pixels/)).toBeInTheDocument();
  });
});
