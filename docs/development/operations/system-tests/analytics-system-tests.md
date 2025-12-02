# Analytics System Tests

Derived from the Analytics System Tests section in `docs/operations/comprehensive-test-plan.md`. These scenarios validate the meta analytics experience (e.g., `/meta` dashboard) and any supporting aggregation utilities.

## Test Environment & Data Setup
- Use a seeded dataset with at least 20 games over 7+ days, covering multiple categories (e.g., Offense, Support, Utility) and classes.
- Include at least three players with varied participation: a high-volume player, a casual player, and a new player with one game.
- Ensure ELO updates are enabled so historical snapshots can be generated per game result.
- Clear caches or force data refresh before each test if the analytics layer caches results.

## Test Cases

### Analytics Aggregation
1. **Activity aggregation by day**
   - **Setup:** Filter disabled; use full dataset.
   - **Steps:** Load the analytics dashboard and select the activity chart for daily view.
   - **Assertions:**
     - Days with games display counts equal to the number of games played that day.
     - Days without games render as zero or are omitted per UI design (consistent spacing, no negative values).

2. **ELO history aggregation**
   - **Setup:** Choose a player with 5+ games.
   - **Steps:**
     - Open the ELO history chart for the player.
     - Hover or inspect data points for each game date.
   - **Assertions:**
     - Each game produces a point in chronological order.
     - ELO values align with the expected post-game calculations for wins/losses.
     - Trend lines update when toggling between absolute and per-category views (if available).

3. **Win rate calculation per category**
   - **Setup:** Use games across at least two categories with mixed outcomes for a player.
   - **Steps:** View the win-rate by category panel.
   - **Assertions:**
     - Win-rate percentages equal `wins / total games` per category and are rounded/formatted per design.
     - Categories with no games display as zero or are excluded consistently.

4. **Class selection statistics**
   - **Setup:** Ensure games cover multiple classes (e.g., Assault, Tank, Support).
   - **Steps:** Open the class usage chart.
   - **Assertions:**
     - Counts reflect the number of times each class was picked across games.
     - Percentages sum to ~100% when all classes are included.
     - Classes never selected display as zero or are hidden per product spec.

5. **Game length distribution**
   - **Setup:** Include games of short, medium, and long durations.
   - **Steps:** Open the game length histogram/distribution chart.
   - **Assertions:**
     - Buckets show correct counts based on configured duration ranges.
     - Hovering a bucket reveals accurate range labels and counts.
     - Outlier durations fall into the correct extreme buckets without breaking chart layout.

6. **Player activity tracking**
   - **Setup:** Identify one high-volume player and one new player.
   - **Steps:** View the player activity section (sessions or games played).
   - **Assertions:**
     - High-volume player appears at or near the top with accurate counts.
     - New player appears with a count of one and does not get filtered out.
     - Sorting/pagination (if present) maintain correct ordering.

### Analytics Filtering
7. **Date range filtering**
   - **Setup:** Choose a range covering only a subset of the seeded games.
   - **Steps:** Apply the date range filter on the analytics dashboard.
   - **Assertions:**
     - All charts refresh to reflect only games within the selected dates.
     - Activity and distribution counts adjust proportionally; dates outside the range show zero data.
     - Clearing the filter restores the full dataset.

8. **Category filtering**
   - **Setup:** Select a single category represented in the data.
   - **Steps:** Apply a category filter and reload the aggregation panels.
   - **Assertions:**
     - Win-rate, class usage, and activity charts only incorporate games from the chosen category.
     - UI shows an empty or zero state if the category has no games in the chosen date window.
     - Removing the filter repopulates charts with all categories.

9. **Player filtering**
   - **Setup:** Pick one player with multiple games.
   - **Steps:** Apply a player filter and review all analytics panels.
   - **Assertions:**
     - ELO history, win rates, and class stats reflect only the selected player's games.
     - Multi-player panels exclude games without the selected player.
     - Switching to another player updates charts without stale data from the previous selection.

10. **Combined filters (date + category + player)**
    - **Setup:** Choose a player and category that intersect for at least two games within a specific date range.
    - **Steps:** Apply date range, category, and player filters simultaneously.
    - **Assertions:**
      - All visible charts scope data to the intersection of the three filters.
      - No cross-filter leakage occurs (counts match raw query results for that intersection).
      - Clearing any single filter expands the dataset according to the remaining filters.
