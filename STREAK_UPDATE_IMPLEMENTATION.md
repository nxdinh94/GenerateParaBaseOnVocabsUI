# Streak Update on Paragraph Generation - Implementation

## Overview
This document describes the implementation of automatic streak updates when a user successfully generates a paragraph. The feature includes real-time UI updates with smooth animations.

## Feature Flow

### 1. User Generates Paragraph
When a user successfully generates a paragraph on the `/paragraph` route:

1. Paragraph is generated via `paragraphController.generateParagraph()`
2. If generation is successful (`response.success && response.data`)
3. Learned vocabularies are marked via `learnedVocabService.markVocabulariesAsLearned()`
4. **Streak is updated via `StreakService.updateStreak()`**

### 2. Streak API Call

**Endpoint**: `POST http://localhost:8000/api/v1/streak`
- **Method**: POST
- **Body**: `{}` (empty body)
- **Authentication**: Bearer token (JWT) - automatically added by `apiClient` interceptor
- **Response Structure**:
```json
{
  "id": "68eb53916a92be13600afcca",
  "user_id": "68e70d5a49faba4753b5a17c",
  "learned_date": "2025-10-12",
  "count": 2,
  "is_qualify": false,
  "created_at": "2025-10-12T07:06:57.440000",
  "status": true
}
```

### 3. Real-time UI Update

After successful streak update:
1. Event is emitted via `streakEvents.emit()`
2. Layout component receives the event via subscription
3. Navigation component receives new props
4. Fire button updates with animation

## Files Modified/Created

### 1. Enhanced Service: `streakService.ts`
**Location**: `src/services/streakService.ts`

Added new method:
```typescript
static async updateStreak(): Promise<StreakResponse>
```

**New Interface**: `StreakResponse`
- Contains full response from streak API
- Includes: id, user_id, learned_date, count, is_qualify, created_at, status

### 2. New Event System: `streakEvents.ts`
**Location**: `src/utils/streakEvents.ts`

Custom event emitter for cross-component communication:
- **Class**: `StreakEventEmitter`
- **Methods**:
  - `subscribe(listener)`: Subscribe to streak updates, returns unsubscribe function
  - `emit(data)`: Emit streak update to all subscribers
- **Export**: `streakEvents` singleton instance

**Why Event System?**
- Decouples ParagraphGeneratorPage from Layout
- No prop drilling needed
- Clean subscription/unsubscription pattern
- Enables multiple listeners if needed in future

### 3. Updated: `ParagraphGeneratorPage.tsx`
**Location**: `src/features/paragraph/ParagraphGeneratorPage.tsx`

Added imports:
```typescript
import { StreakService } from '@/services/streakService';
import { streakEvents } from '@/utils/streakEvents';
```

Added streak update logic after successful paragraph generation:
```typescript
// Call streak API after successful paragraph generation
if (isAuthenticated) {
  try {
    console.log('🔥 Calling streak API to update streak count...');
    const streakResponse = await StreakService.updateStreak();
    
    console.log('✅ Streak updated successfully:', streakResponse);
    
    // Emit event to update streak in navigation
    streakEvents.emit({
      count: streakResponse.count,
      is_qualify: streakResponse.is_qualify
    });
  } catch (streakError) {
    console.error('❌ Error calling streak API:', streakError);
    // Don't block the main flow if streak update fails
  }
}
```

**Position**: After learned-vocabs API call, inside the success block
**Error Handling**: Non-blocking - if streak update fails, paragraph generation still succeeds

### 4. Updated: `Layout.tsx`
**Location**: `src/components/Layout.tsx`

Added imports:
```typescript
import { streakEvents } from '@/utils/streakEvents';
```

Added event subscription:
```typescript
// Listen for streak updates from paragraph generation
useEffect(() => {
  const unsubscribe = streakEvents.subscribe((data) => {
    console.log('🔥 Streak updated:', data);
    setStreakCount(data.count);
    setIsStreakQualified(data.is_qualify);
  });

  return unsubscribe;
}, []);
```

**Lifecycle**:
- Subscribes on mount
- Updates streak state when event is received
- Unsubscribes on unmount (cleanup)

### 5. Updated: `Navigation.tsx`
**Location**: `src/features/navigation/Navigation.tsx`

#### Added Animation State
```typescript
const [isStreakAnimating, setIsStreakAnimating] = useState(false);
```

#### Added Animation Trigger
```typescript
// Trigger animation when streak count changes
React.useEffect(() => {
  if (streakCount > 0) {
    setIsStreakAnimating(true);
    const timer = setTimeout(() => setIsStreakAnimating(false), 1000);
    return () => clearTimeout(timer);
  }
}, [streakCount, isStreakQualified]);
```

**Animation Duration**: 1000ms (1 second)
**Trigger**: Whenever `streakCount` or `isStreakQualified` changes

#### Enhanced Fire Button with Animations

**Button Container Animation**:
```typescript
className={`p-2 transition-all duration-500 border-r border-border relative ${
  isStreakAnimating ? 'animate-pulse scale-110' : ''
}`}
```
- **Scale up**: 110% when animating
- **Pulse effect**: Built-in Tailwind animation
- **Duration**: 500ms for smooth transition

**Icon Animation**:
```typescript
className={`h-5 w-5 transition-all duration-500 ${
  isStreakAnimating ? 'scale-125 brightness-125' : ''
}`}
```
- **Scale up**: 125% when animating
- **Brightness increase**: 125% for glow effect
- **Duration**: 500ms synchronized with button

**Border Gradient Animation**:
```typescript
style={{
  ...
  transition: 'transform 0.5s ease-in-out, background 0.8s ease-in-out'
}}
```
- **Transform**: 500ms (scale animation)
- **Background**: 800ms (gradient color change - slightly longer for smooth effect)
- **Easing**: ease-in-out for natural motion

## Animation Breakdown

### Visual Effects Sequence

1. **Trigger**: Paragraph generation succeeds → Streak API called → Event emitted
2. **State Update** (0ms): `streakCount` and `isStreakQualified` updated
3. **Animation Start** (0-500ms):
   - Button scales from 100% → 110%
   - Icon scales from 100% → 125%
   - Icon brightness increases to 125%
   - Pulse animation starts
4. **Border Transition** (0-800ms):
   - Border gradient smoothly changes to reflect new count
   - New segments light up in orange
   - Icon may change from deactivated → active (if qualified)
5. **Animation End** (1000ms):
   - `isStreakAnimating` set to false
   - Button scales back to 100%
   - Icon returns to normal size and brightness
   - Pulse animation stops
6. **Final State**: New streak count displayed with updated border

### CSS Classes Used

**Tailwind Classes**:
- `transition-all`: Transition all properties
- `duration-500`: 500ms duration
- `animate-pulse`: Built-in pulse animation
- `scale-110`: Scale to 110%
- `scale-125`: Scale to 125%
- `brightness-125`: Increase brightness by 25%

**Inline Styles**:
- `transition: 'transform 0.5s ease-in-out, background 0.8s ease-in-out'`
- Provides precise control over different transition timings

## Error Handling

### Streak API Failure
- Caught in try-catch block
- Error logged to console
- User experience not disrupted
- Paragraph generation still considered successful
- Fire button retains previous state

### Network Issues
- Handled by `apiClient` interceptor
- Errors passed through `handleApiError()`
- No UI blocking or error toasts for streak failures

## User Experience Flow

### Success Scenario
1. User clicks "Generate Paragraph"
2. Paragraph appears in workspace
3. After brief moment (API call time):
   - Fire button pulses and scales up
   - Border segment lights up in orange
   - Icon may change to active fire
   - Animations play for 1 second
   - Button returns to normal state with new streak count

### Error Scenario
1. User clicks "Generate Paragraph"
2. Paragraph appears in workspace
3. If streak API fails:
   - Error logged silently
   - No user notification
   - Fire button shows previous streak count
   - User can retry by generating another paragraph

## Technical Notes

### Performance
- Event system is lightweight (simple pub-sub pattern)
- Animation uses CSS transitions (GPU accelerated)
- No re-renders of unrelated components
- Cleanup functions prevent memory leaks

### Browser Compatibility
- CSS transitions supported in all modern browsers
- Tailwind animations use standard CSS
- No vendor prefixes needed

### Future Enhancements
- Add confetti effect for streak milestones
- Add sound effects for streak updates
- Show toast notification for special achievements
- Add streak history visualization

## Testing Recommendations

1. **Manual Testing**:
   - Generate paragraph and observe fire button animation
   - Check console logs for API calls
   - Verify count increments correctly
   - Test with different streak counts (1-5)
   - Test qualification state changes

2. **Edge Cases**:
   - Test with slow network (animation should still work)
   - Test when API fails (should not crash)
   - Test rapid paragraph generation (multiple calls)
   - Test logout/login during animation

3. **Browser Testing**:
   - Chrome, Firefox, Safari, Edge
   - Check animation smoothness
   - Verify no visual glitches
