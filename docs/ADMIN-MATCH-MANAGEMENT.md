# Admin Match Management

Admins can edit and delete matches from the admin dashboard.

## Features

### View All Matches
- `/dashboard/admin/matches`
- Shows all matches with player IDs, scores, winners, and dates
- Displays whether players are Users (👤) or Opponents (🎯)

### Edit Match Scores
1. Click "Edit" on any match
2. Update score A and score B
3. Click "Save" to apply changes
4. Winner is automatically recalculated based on new scores

**Important**: Editing scores does NOT automatically recalculate ELO ratings. After editing matches, use the "Recalculate All ELO" button on the admin dashboard to update player ratings.

### Delete Matches
1. Click "Delete" on any match
2. Confirm the deletion
3. Match is permanently removed

**Warning**: Deleting matches is permanent and will affect ELO calculations. Consider recalculating ELO after deleting matches.

## API Endpoints

### Get All Matches
```
GET /api/admin/matches
```

### Update Match Scores
```
PATCH /api/admin/matches
Body: { id: number, scoreA: number, scoreB: number }
```

### Delete Match
```
DELETE /api/admin/matches
Body: { id: number }
```

## Database Functions

### `db.getAllMatches()`
Returns all matches ordered by play date (newest first)

### `db.updateMatchScores(matchId, scoreA, scoreB)`
Updates match scores and recalculates the winner

### `db.deleteMatch(matchId)`
Permanently deletes a match

## Access Control

- Only admins can access these endpoints
- Protected by `requireAdmin()` server-side guard
- Returns 401 if not authenticated or not admin

## Best Practices

1. **Before Editing**: Take note of the current scores
2. **After Editing**: Run "Recalculate All ELO" to update ratings
3. **Before Deleting**: Consider if the match should just be edited instead
4. **After Deleting**: Run "Recalculate All ELO" to fix ratings

