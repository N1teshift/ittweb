jest.mock('../../../games/lib/gameService', () => ({
  getGames: jest.fn(),
}));

import { getGames } from '../../games/lib/gameService';
import { getActivityData } from '../analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds activity data even when there are no games', async () => {
    (getGames as jest.Mock).mockResolvedValue({ games: [] });

    const result = await getActivityData('player', '2024-01-01', '2024-01-01');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ date: '2024-01-01', games: 0 });
  });
});
