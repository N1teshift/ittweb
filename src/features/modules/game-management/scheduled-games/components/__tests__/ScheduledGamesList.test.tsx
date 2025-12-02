import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduledGamesList from '../ScheduledGamesList';
import type { Game } from '@/features/modules/game-management/games/types';

// Mock the ScheduledGameCard component
jest.mock('../ScheduledGameCard', () => ({
  ScheduledGameCard: ({ game, onGameClick, onJoin, onLeave, onEdit, onRequestDelete, onUploadReplay, isJoining, isLeaving, isDeleting, isUploadingReplay, userIsAdmin }: any) => (
    <div data-testid={`scheduled-game-card-${game.id}`}>
      <div>Game: {game.gamename || game.id}</div>
      <div>Status: {game.status || game.gameState}</div>
      {onGameClick && <button onClick={() => onGameClick(game)} data-testid={`game-click-${game.id}`}>View Game</button>}
      {onJoin && <button onClick={() => onJoin(game.id)} data-testid={`join-${game.id}`}>Join</button>}
      {onLeave && <button onClick={() => onLeave(game.id)} data-testid={`leave-${game.id}`}>Leave</button>}
      {onEdit && userIsAdmin && <button onClick={() => onEdit(game)} data-testid={`edit-${game.id}`}>Edit</button>}
      {onRequestDelete && userIsAdmin && <button onClick={() => onRequestDelete(game)} data-testid={`delete-${game.id}`}>Delete</button>}
      {onUploadReplay && <button onClick={() => onUploadReplay(game)} data-testid={`upload-${game.id}`}>Upload Replay</button>}
      {isJoining === game.id && <span data-testid={`joining-${game.id}`}>Joining...</span>}
      {isLeaving === game.id && <span data-testid={`leaving-${game.id}`}>Leaving...</span>}
      {isDeleting === game.id && <span data-testid={`deleting-${game.id}`}>Deleting...</span>}
      {isUploadingReplay === game.id && <span data-testid={`uploading-${game.id}`}>Uploading...</span>}
    </div>
  ),
}));

describe('ScheduledGamesList', () => {
  const mockGames: Game[] = [
    {
      id: 'game1',
      gameId: 1001,
      gameState: 'scheduled',
      creatorName: 'Player1',
      createdByDiscordId: 'discord123',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z',
      scheduledDateTime: '2025-01-15T15:00:00Z',
      timezone: 'America/New_York',
      teamSize: '1v1',
      gameType: 'elo',
      status: 'scheduled',
      scheduledGameId: 1,
    },
    {
      id: 'game2',
      gameId: 1002,
      gameState: 'scheduled',
      creatorName: 'Player2',
      createdByDiscordId: 'discord456',
      createdAt: '2025-01-02T10:00:00Z',
      updatedAt: '2025-01-02T10:00:00Z',
      scheduledDateTime: '2025-01-16T16:00:00Z',
      timezone: 'Europe/London',
      teamSize: '2v2',
      gameType: 'normal',
      status: 'ongoing',
      scheduledGameId: 2,
    },
  ];

  const defaultProps = {
    games: mockGames,
    onGameClick: jest.fn(),
    onJoin: jest.fn(),
    onLeave: jest.fn(),
    onEdit: jest.fn(),
    onRequestDelete: jest.fn(),
    onUploadReplay: jest.fn(),
    isJoining: null,
    isLeaving: null,
    isDeleting: null,
    isUploadingReplay: null,
    userIsAdmin: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no games are provided', () => {
    render(<ScheduledGamesList {...defaultProps} games={[]} />);

    expect(screen.getByText('No scheduled games yet.')).toBeInTheDocument();
    expect(screen.getByText('Be the first to schedule a game!')).toBeInTheDocument();
    expect(screen.queryByTestId('scheduled-game-card-game1')).not.toBeInTheDocument();
  });

  it('renders list of games when games are provided', () => {
    render(<ScheduledGamesList {...defaultProps} />);

    expect(screen.getByTestId('scheduled-game-card-game1')).toBeInTheDocument();
    expect(screen.getByTestId('scheduled-game-card-game2')).toBeInTheDocument();
    expect(screen.getByText('Game: game1')).toBeInTheDocument();
    expect(screen.getByText('Game: game2')).toBeInTheDocument();
  });

  it('passes correct props to ScheduledGameCard components', () => {
    render(<ScheduledGamesList {...defaultProps} />);

    // Check that cards are rendered (mock will show the game data)
    expect(screen.getByText('Status: scheduled')).toBeInTheDocument();
    expect(screen.getByText('Status: ongoing')).toBeInTheDocument();
  });

  it('renders action buttons when handlers are provided', () => {
    render(<ScheduledGamesList {...defaultProps} />);

    expect(screen.getByTestId('game-click-game1')).toBeInTheDocument();
    expect(screen.getByTestId('join-game1')).toBeInTheDocument();
    expect(screen.getByTestId('leave-game1')).toBeInTheDocument();
    expect(screen.getByTestId('upload-game1')).toBeInTheDocument();
  });

  it('renders admin buttons only when user is admin', () => {
    render(<ScheduledGamesList {...defaultProps} userIsAdmin={true} />);

    expect(screen.getByTestId('edit-game1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-game1')).toBeInTheDocument();
  });

  it('does not render admin buttons when user is not admin', () => {
    render(<ScheduledGamesList {...defaultProps} userIsAdmin={false} />);

    expect(screen.queryByTestId('edit-game1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-game1')).not.toBeInTheDocument();
  });

  it('shows loading states for specific games', () => {
    render(<ScheduledGamesList {...defaultProps} isJoining="game1" isLeaving="game2" />);

    expect(screen.getByTestId('joining-game1')).toBeInTheDocument();
    expect(screen.getByTestId('leaving-game2')).toBeInTheDocument();
    expect(screen.queryByTestId('joining-game2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('leaving-game1')).not.toBeInTheDocument();
  });

  it('calls onGameClick when game click button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScheduledGamesList {...defaultProps} />);

    await user.click(screen.getByTestId('game-click-game1'));

    expect(defaultProps.onGameClick).toHaveBeenCalledWith(mockGames[0]);
    expect(defaultProps.onGameClick).toHaveBeenCalledTimes(1);
  });

  it('calls onJoin when join button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScheduledGamesList {...defaultProps} />);

    await user.click(screen.getByTestId('join-game1'));

    expect(defaultProps.onJoin).toHaveBeenCalledWith('game1');
    expect(defaultProps.onJoin).toHaveBeenCalledTimes(1);
  });

  it('calls onLeave when leave button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScheduledGamesList {...defaultProps} />);

    await user.click(screen.getByTestId('leave-game1'));

    expect(defaultProps.onLeave).toHaveBeenCalledWith('game1');
    expect(defaultProps.onLeave).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked by admin', async () => {
    const user = userEvent.setup();
    render(<ScheduledGamesList {...defaultProps} userIsAdmin={true} />);

    await user.click(screen.getByTestId('edit-game1'));

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockGames[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onRequestDelete when delete button is clicked by admin', async () => {
    const user = userEvent.setup();
    render(<ScheduledGamesList {...defaultProps} userIsAdmin={true} />);

    await user.click(screen.getByTestId('delete-game1'));

    expect(defaultProps.onRequestDelete).toHaveBeenCalledWith(mockGames[0]);
    expect(defaultProps.onRequestDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onUploadReplay when upload button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScheduledGamesList {...defaultProps} />);

    await user.click(screen.getByTestId('upload-game1'));

    expect(defaultProps.onUploadReplay).toHaveBeenCalledWith(mockGames[0]);
    expect(defaultProps.onUploadReplay).toHaveBeenCalledTimes(1);
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<ScheduledGamesList {...defaultProps} />);

    expect(container.querySelector('.space-y-4')).toBeInTheDocument();
  });

  it('renders empty state with correct styling', () => {
    const { container } = render(<ScheduledGamesList {...defaultProps} games={[]} />);

    expect(container.querySelector('.text-center')).toBeInTheDocument();
    expect(container.querySelector('.py-12')).toBeInTheDocument();
  });
});

