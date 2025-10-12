# Streak Feature Implementation

## Overview
This document describes the implementation of the streak status feature that displays user's daily streak progress in the navigation bar.

## Feature Description
- Displays a fire icon button with a dynamic segmented circular border
- Border segments light up based on user's daily streak count
- Icon changes based on qualification status
- Fetches streak data when user enters the `/paragraph` route

## API Integration

### Endpoint
- **URL**: `GET /api/v1/today-streak-status`
- **Authentication**: Requires Bearer token (JWT)
- **Response Structure**:
```json
{
  "count": 3,
  "is_qualify": false,
  "date": "2025-10-12",
  "status": true
}
```

## Files Created/Modified

### 1. New Service: `streakService.ts`
**Location**: `src/services/streakService.ts`

Created a new service to handle streak-related API calls:
- `getTodayStreakStatus()`: Fetches current streak status from API
- Uses existing `apiClient` for authenticated requests
- Implements proper error handling with `handleApiError`

### 2. Updated: `Layout.tsx`
**Location**: `src/components/Layout.tsx`

Added streak data management:
- Imports `StreakService` and `useAuth` hook
- Uses `useLocation` to detect route changes
- Fetches streak status when user is authenticated and on `/paragraph` route
- Passes `streakCount` and `isStreakQualified` props to Navigation component
- Resets streak data on errors

### 3. Updated: `Navigation.tsx`
**Location**: `src/features/navigation/Navigation.tsx`

Enhanced navigation component with streak visualization:

#### Props Added
- `streakCount?: number` - Number of active streak segments (0-5)
- `isStreakQualified?: boolean` - Whether user qualifies for full streak

#### Visual Logic

**Fire Icon Display**:
- If `streakCount >= 5` AND `isStreakQualified === true`: Show `noto_fire.svg` (active)
- Otherwise: Show `noto_deactivate_fire.svg` (inactive)

**Border Segments** (4 equal parts):
1. **count = 1**: First segment (0-85°) highlighted in `#FF9800` (orange)
2. **count = 2**: First 2 segments (0-85°, 95-175°) highlighted
3. **count = 3**: First 3 segments highlighted
4. **count = 4**: First 4 segments highlighted
5. **count >= 5 AND is_qualify = true**: All 4 segments highlighted

**Border Colors**:
- Active segment: `#FF9800` (orange)
- Inactive segment: `rgb(209, 213, 219)` (gray-300)
- Segment gaps: `transparent` (2px visual gap = 10° in conic gradient)

#### Implementation Details
- `getStreakBorderGradient()`: Dynamic function that generates conic gradient based on streak count
- Uses CSS `conic-gradient` for circular segmented border effect
- Border structure: 3px solid transparent with gradient background
- Each segment: ~85° with 10° transparent gaps between segments

## User Flow

1. User logs in (authenticated)
2. User navigates to `/paragraph` route
3. Layout component detects route change
4. Layout fetches streak status from API with Bearer token
5. Streak data is passed to Navigation component
6. Fire icon button displays with appropriate:
   - Icon (active/inactive fire)
   - Border highlighting (0-4 segments based on count)

## Visual States

### State Examples

| Count | is_qualify | Icon | Border Segments |
|-------|-----------|------|-----------------|
| 0 | false | Deactivated | All gray |
| 1 | false | Deactivated | 1st orange, rest gray |
| 2 | false | Deactivated | 1st-2nd orange, rest gray |
| 3 | false | Deactivated | 1st-3rd orange, rest gray |
| 4 | false | Deactivated | All orange |
| 5 | true | **Active** | All orange (qualified) |
| 5 | false | Deactivated | All orange (not qualified) |

## Technical Notes

### Authentication
- API call automatically includes JWT token via `apiClient` interceptor
- Token retrieved from `sessionStorage.getItem('jwt_token')`
- No manual token handling required in component

### Error Handling
- On API error, streak data resets to defaults (count=0, qualified=false)
- Errors logged to console for debugging
- User experience not disrupted by failed streak fetches

### Performance
- Streak data fetched only when:
  - User is authenticated
  - Route is exactly `/paragraph`
- Uses React `useEffect` with proper dependencies
- Prevents unnecessary API calls on other routes

## Assets Used
- `src/assets/noto_fire.svg` - Active streak icon
- `src/assets/noto_deactivate_fire.svg` - Inactive streak icon
- `src/assets/coin.svg` - Coin icon (existing)

## Styling
- Border: 3px solid with conic gradient
- Border radius: 50% (circular)
- Hover effect: Container background changes (group hover)
- Smooth transitions on all interactive elements
- Responsive design with `rounded-full` parent container
