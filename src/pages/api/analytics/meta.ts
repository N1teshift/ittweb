import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import {
  getActivityData,
  getGameLengthData,
  getPlayerActivityData,
  getClassSelectionData,
  getClassWinRateData,
} from '@/features/modules/analytics-group/analytics/lib/analyticsService';

/**
 * GET /api/analytics/meta - Get meta statistics
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const category = req.query.category as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const teamFormat = req.query.teamFormat as string | undefined;

    const [activity, gameLength, playerActivity, classSelection, classWinRates] = await Promise.all([
      getActivityData(undefined, startDate, endDate, category),
      getGameLengthData(category, startDate, endDate, teamFormat),
      getPlayerActivityData(category, startDate, endDate, teamFormat),
      getClassSelectionData(category, startDate, endDate, teamFormat),
      getClassWinRateData(category, startDate, endDate, teamFormat),
    ]);

    return {
      activity,
      gameLength,
      playerActivity,
      classSelection,
      classWinRates,
    };
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    // Cache for 5 minutes - Firestore cache handles freshness, HTTP cache reduces API calls
    cacheControl: {
      public: true,
      maxAge: 300,
      mustRevalidate: true,
    },
  }
);






