# Statistics and Charts Feature Design

**Date:** 2025-11-04
**Status:** Approved
**Feature:** Statistics page with ELO trends, win rate trends, and head-to-head matchup charts

## Overview

Add a comprehensive statistics page to the Pickleball PWA that visualizes player performance over time using interactive charts. This feature builds on the existing ELO tracking system and match history data.

## Requirements

### User-Facing Features

1. **ELO Trend Chart**: Line chart showing ELO rating progression over all matches
2. **Win Rate Trend Chart**: Area chart displaying win percentage trends over time
3. **Head-to-Head Statistics**: Breakdown of performance against each opponent
4. **Time Period Filtering**: Allow users to filter data by 7 days, 30 days, or all time
5. **Dashboard Navigation**: Add "Stats" button to main dashboard Quick Actions

### Technical Requirements

- Mobile-first responsive design
- Server-side data aggregation for performance
- Reuse existing database queries where possible
- Match existing UI/UX patterns and color scheme
- Touch-friendly interactions

## Technology Decisions

### Chart Library: Recharts

**Rationale:**
- React-native API with declarative components
- Responsive by default
- Good mobile performance
- Well-documented and actively maintained
- ~100KB bundle size (acceptable for PWA)

**Alternatives Considered:**
- Chart.js: Smaller bundle but less React-friendly
- D3.js: Too complex for this use case

### Navigation: Dashboard Button

**Rationale:**
- Consistent with existing Quick Actions pattern
- Easily discoverable
- Minimal UI disruption

**Implementation:** Expand Quick Actions from 2-column to 3-column grid

## Architecture

### Page Structure

```
/dashboard/stats
├── Time period filter (7d / 30d / All)
├── ELO Trend Chart
├── Win Rate Trend Chart
└── Head-to-Head Statistics (card grid)
```

### Data Flow

1. Server Component fetches match history
2. Server-side aggregation calculates statistics
3. Pass serialized data to Client Components
4. Recharts renders interactive visualizations

### Component Architecture

**New Files:**
- `app/dashboard/stats/page.tsx` - Main stats page (Server Component)
- `app/dashboard/stats/EloChart.tsx` - ELO trend line chart (Client Component)
- `app/dashboard/stats/WinRateChart.tsx` - Win rate area chart (Client Component)
- `app/dashboard/stats/HeadToHeadStats.tsx` - Opponent matchup cards (Client Component)
- `lib/db/stats.ts` - Database aggregation helpers

**Modified Files:**
- `app/dashboard/page.tsx` - Add Stats button to Quick Actions
- `package.json` - Add recharts dependency

## Data Aggregation

### ELO History Calculation

```typescript
interface EloDataPoint {
  date: string;
  elo: number;
  matchNumber: number;
}

// Calculate cumulative ELO at each match
const eloHistory = matches.map((match, index) => {
  const cumulativeChange = matches
    .slice(0, index + 1)
    .reduce((sum, m) => sum + (isUserPlayerA(m) ? m.elo_change_a : m.elo_change_b), 0);

  return {
    date: match.played_at,
    elo: STARTING_ELO + cumulativeChange,
    matchNumber: index + 1
  };
});
```

### Win Rate Trends

```typescript
interface WinRateDataPoint {
  date: string;
  winRate: number;
  wins: number;
  losses: number;
}

// Group matches by date, calculate daily win rate
const groupByDate = (matches) => {
  const grouped = matches.reduce((acc, match) => {
    const date = match.played_at.toISOString().split('T')[0];
    if (!acc[date]) acc[date] = { wins: 0, total: 0 };
    acc[date].total++;
    if (isWin(match)) acc[date].wins++;
    return acc;
  }, {});

  return Object.entries(grouped).map(([date, stats]) => ({
    date,
    winRate: (stats.wins / stats.total) * 100,
    wins: stats.wins,
    losses: stats.total - stats.wins
  }));
};
```

### Head-to-Head Statistics

```typescript
interface HeadToHeadStat {
  opponentId: number;
  opponentName: string;
  opponentPhotoUrl: string | null;
  wins: number;
  losses: number;
  winRate: number;
  avgScoreDiff: number;
}

// Group by opponent, calculate aggregates
const headToHead = groupByOpponent(matches).map(opponent => ({
  opponentId: opponent.id,
  opponentName: opponent.name,
  opponentPhotoUrl: opponent.photo_url,
  wins: opponent.wins,
  losses: opponent.losses,
  winRate: (opponent.wins / (opponent.wins + opponent.losses)) * 100,
  avgScoreDiff: average(opponent.matches.map(m =>
    isUserPlayerA(m) ? (m.score_a - m.score_b) : (m.score_b - m.score_a)
  ))
}));
```

## UI/UX Design

### Chart Specifications

**ELO Trend Chart:**
- Type: Line chart with dots at data points
- X-axis: Date or match number
- Y-axis: ELO rating
- Tooltip: Shows date, ELO value, opponent name, match result
- Color: Blue line (#2563eb)
- Reference line at starting ELO (1500)

**Win Rate Trend Chart:**
- Type: Area chart with gradient fill
- X-axis: Date
- Y-axis: Win percentage (0-100%)
- Tooltip: Shows date, win rate, W-L record for period
- Color: Green gradient for above 50%, red for below
- Reference line at 50%

**Head-to-Head Cards:**
- Grid layout (2 columns on mobile, 3 on tablet+)
- Each card shows:
  - Opponent photo/avatar
  - Opponent name
  - Record (W-L)
  - Win percentage
  - Average score differential (+/- format)
- Sort by total matches (most played first)

### Time Period Filter

```
[7 Days] [30 Days] [All Time]
```

- Horizontal button group
- Active state: filled background
- Inactive state: outline only
- Default: All Time

### Mobile Optimization

**Layout:**
- All charts stack vertically (full width)
- Minimum chart height: 300px
- Touch-friendly tooltips (larger activation area)
- Horizontal scrolling for x-axis labels if needed

**Performance:**
- Limit data points to max 50 for line charts (sample if necessary)
- Use `ResponsiveContainer` from Recharts
- Consider lazy loading charts below the fold

**Color Scheme:**
- Wins/positive: Green (#16a34a)
- Losses/negative: Red (#dc2626)
- Neutral/trends: Blue (#2563eb)
- Background: White (#ffffff)
- Border: Gray (#e5e7eb)

## Database Queries

### Existing Queries to Reuse

```typescript
// From lib/db/index.ts
getMatchesByPlayer(playerId: number, playerType: string): Promise<Match[]>
```

### New Queries to Add

```typescript
// lib/db/stats.ts

// Get matches within time period
getMatchesByPlayerAndPeriod(
  playerId: number,
  playerType: string,
  days: number | null
): Promise<Match[]>

// Get opponent statistics
getOpponentStatsForPlayer(
  playerId: number,
  playerType: string
): Promise<HeadToHeadStat[]>

// Get daily aggregated stats
getDailyStatsForPlayer(
  playerId: number,
  playerType: string,
  days: number | null
): Promise<DailyStat[]>
```

## Implementation Notes

### Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "recharts": "^2.10.0"
  }
}
```

### TypeScript Types

```typescript
// types/stats.ts
export interface EloDataPoint {
  date: string;
  elo: number;
  matchNumber: number;
}

export interface WinRateDataPoint {
  date: string;
  winRate: number;
  wins: number;
  losses: number;
}

export interface HeadToHeadStat {
  opponentId: number;
  opponentName: string;
  opponentPhotoUrl: string | null;
  wins: number;
  losses: number;
  winRate: number;
  avgScoreDiff: number;
}

export type TimePeriod = '7d' | '30d' | 'all';
```

### Error Handling

- Empty state: "No matches yet. Play some games to see your stats!"
- Insufficient data: Show message if < 2 matches
- Loading state: Show skeleton loaders for charts

### Testing Considerations

- Test with various data volumes (0, 1, 10, 100+ matches)
- Verify chart responsiveness on different screen sizes
- Test time period filtering
- Validate ELO calculation accuracy
- Check head-to-head sorting and aggregation

## Future Enhancements

Not included in initial implementation but worth considering:

- Export statistics as CSV/PDF
- Compare stats with friends/other players
- Advanced filtering (by opponent, date range picker)
- Win/loss streak tracking
- Performance predictions based on ELO
- Social sharing of achievements
- Push notifications for milestones

## Success Criteria

- Statistics page loads in < 2 seconds with 100 matches
- Charts are responsive and touch-friendly on mobile
- Data accurately reflects match history
- Navigation is intuitive and consistent with existing UI
- No regressions in existing functionality
