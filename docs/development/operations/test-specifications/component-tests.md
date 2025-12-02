# Test Specifications - Component Tests

Test specifications for React components.

### Shared Components
- [ ] `src/features/shared/components/Header.tsx`
  - Test renders navigation links
  - Test renders user menu when authenticated
  - Test renders login button when not authenticated
  - Test responsive behavior

- [ ] `src/features/shared/components/Footer.tsx`
  - Test renders footer content
  - Test renders links

- [ ] `src/features/shared/components/Layout.tsx`
  - Test wraps children with Header and Footer
  - Test applies layout styles

- [ ] `src/features/shared/components/PageHero.tsx`
  - Test renders title
  - Test renders description
  - Test renders optional image

- [ ] `src/features/shared/components/DataCollectionNotice.tsx`
  - Test renders notice when not accepted
  - Test handles accept action
  - Test handles dismiss action

- [ ] `src/features/shared/components/DiscordButton.tsx`
  - Test renders Discord link
  - Test opens in new tab

- [ ] `src/features/shared/components/GitHubButton.tsx`
  - Test renders GitHub link
  - Test opens in new tab

### Game Components
- [ ] `src/features/modules/games/components/GameList.tsx`
  - Test renders list of games
  - Test handles empty state
  - Test handles loading state
  - Test handles error state
  - Test filters games
  - Test pagination

- [ ] `src/features/modules/games/components/GameCard.tsx`
  - Test renders game information
  - Test renders players
  - Test renders date
  - Test renders category

- [ ] `src/features/modules/games/components/GameDetail.tsx`
  - Test renders full game details
  - Test renders player list
  - Test renders ELO changes
  - Test handles non-existent game

### Player Components
- [ ] `src/features/modules/players/components/PlayersPage.tsx`
  - Test renders player list
  - Test handles search
  - Test handles pagination
  - Test handles loading state

- [ ] `src/features/modules/players/components/PlayerProfile.tsx`
  - Test renders player statistics
  - Test renders game history
  - Test renders ELO chart
  - Test handles non-existent player

- [ ] `src/features/modules/players/components/PlayerComparison.tsx`
  - Test compares multiple players
  - Test renders comparison table
  - Test handles different stat categories

### Blog Components
- [ ] `src/features/modules/blog/components/BlogPost.tsx`
  - Test renders post content
  - Test renders MDX content
  - Test renders metadata
  - Test renders edit button for author

- [ ] `src/features/modules/blog/components/NewPostForm.tsx`
  - Test renders form fields
  - Test validates required fields
  - Test handles form submission
  - Test handles errors

- [ ] `src/features/modules/blog/components/EditPostForm.tsx`
  - Test renders form with existing data
  - Test validates required fields
  - Test handles form submission
  - Test handles errors

- [ ] `src/features/modules/blog/components/PostDeleteDialog.tsx`
  - Test renders confirmation dialog
  - Test handles delete action
  - Test handles cancel action

### Archive Components
- [ ] `src/features/modules/archives/components/ArchivesContent.tsx`
  - Test renders archive list
  - Test handles empty state
  - Test handles loading state
  - Test handles error state

- [ ] `src/features/modules/archives/components/ArchiveForm.tsx`
  - Test renders all form sections
  - Test validates form data
  - Test handles form submission
  - Test handles media uploads

- [ ] `src/features/modules/archives/components/ArchiveEditForm.tsx`
  - Test renders form with existing data
  - Test updates archive
  - Test validates changes

- [ ] `src/features/modules/archives/components/ArchiveDeleteDialog.tsx`
  - Test renders confirmation dialog
  - Test handles delete action

- [ ] `src/features/modules/archives/components/ArchiveEntry.tsx`
  - Test renders archive entry
  - Test renders all sections
  - Test renders media embeds

- [ ] `src/features/modules/archives/components/YouTubeEmbed.tsx`
  - Test renders YouTube embed
  - Test handles video ID extraction

- [ ] `src/features/modules/archives/components/TwitchClipEmbed.tsx`
  - Test renders Twitch embed
  - Test handles clip URL parsing

### Scheduled Games Components
- [ ] `src/features/modules/scheduled-games/components/*`
  - Test scheduled game list rendering
  - Test scheduled game form
  - Test player join/leave UI
  - Test replay upload UI
  - Test timezone display

### Standings Components
- [ ] `src/features/modules/standings/components/*`
  - Test leaderboard rendering
  - Test ranking display
  - Test category filtering
  - Test pagination

### Analytics Components
- [ ] `src/features/modules/analytics/components/ActivityChart.tsx`
  - Test renders chart
  - Test handles empty data
  - Test handles date range

- [ ] `src/features/modules/analytics/components/EloChart.tsx`
  - Test renders ELO history chart
  - Test handles multiple players

- [ ] `src/features/modules/analytics/components/WinRateChart.tsx`
  - Test renders win rate pie chart
  - Test calculates percentages

- [ ] `src/features/modules/analytics/components/ClassSelectionChart.tsx`
  - Test renders class selection data
  - Test handles empty data

- [ ] `src/features/modules/analytics/components/GameLengthChart.tsx`
  - Test renders game length distribution
  - Test handles time formatting

- [ ] `src/features/modules/analytics/components/PlayerActivityChart.tsx`
  - Test renders player activity over time
  - Test handles multiple players

- [ ] `src/features/modules/analytics/components/ClassWinRateChart.tsx`
  - Test renders class win rates
  - Test compares classes

### Guides Components
- [ ] `src/features/modules/guides/components/GuideCard.tsx`
  - Test renders guide card
  - Test renders icon
  - Test handles navigation

- [ ] `src/features/modules/guides/components/ClassHeader.tsx`
  - Test renders class name
  - Test renders class icon
  - Test renders stats

- [ ] `src/features/modules/guides/components/ClassIcon.tsx`
  - Test renders icon with correct path
  - Test handles missing icon

- [ ] `src/features/modules/guides/components/GuideIcon.tsx`
  - Test renders guide icon
  - Test handles different icon types

- [ ] `src/features/modules/guides/components/StatsCard.tsx`
  - Test renders stat values
  - Test formats numbers correctly

- [ ] `src/features/modules/guides/components/ColoredText.tsx`
  - Test applies color codes
  - Test renders text correctly

### Map Analyzer Components
- [ ] `src/features/modules/map-analyzer/components/*`
  - Test map parsing
  - Test map data display
  - Test map visualization

### Tools Components
- [ ] `src/features/modules/tools/components/*`
  - Test icon mapper UI
  - Test duel simulator UI
  - Test tool interactions

### Shared Module Components
- [ ] `src/features/modules/shared/components/DateRangeFilter.tsx`
  - Test renders date inputs
  - Test handles date selection
  - Test validates date range
  - Test clears filters

### UI Components
- [ ] `src/features/infrastructure/shared/components/ui/*`
  - Test button component variants
  - Test input component validation
  - Test modal component open/close
  - Test dropdown component
  - Test loading spinner
  - Test error message display

## Related Documentation

- [Test Specifications Index](./README.md)
- [Hook Tests](./hook-tests.md)
- [API Route Tests](./api-route-tests.md)
- [Testing Guide](../testing-guide.md)

