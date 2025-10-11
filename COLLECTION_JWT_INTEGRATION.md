# Collection JWT Integration Implementation

## Overview
This document describes the implementation of showing the correct vocabulary collection based on the `selected_collection_id` field from the JWT token payload.

## JWT Token Payload Structure
```typescript
{
  "user_id": string,
  "email": string,
  "name": string,
  "picture": string,
  "selected_collection_id": string,  // MongoDB ObjectId
  "type": "refresh" | "access",
  "exp": number  // Unix timestamp
}
```

## Changes Made

### 1. MainWorkspace Component (`src/features/workspace/MainWorkspace.tsx`)

#### Added Imports
- `UserApiService` - For JWT token decoding

#### New State
- `selectedCollectionId: string | undefined` - Tracks the current collection ID from JWT

#### Initialize from JWT Token
```typescript
useEffect(() => {
  const jwtToken = UserApiService.getStoredJwtToken();
  if (jwtToken) {
    const payload = UserApiService.decodeJwtToken(jwtToken);
    if (payload && payload.selected_collection_id) {
      setSelectedCollectionId(payload.selected_collection_id);
      
      // Find collection by ID and set its name
      const collection = collectionOptions.find(c => c.id === payload.selected_collection_id);
      if (collection) {
        setSelectedCollection(collection.name);
      }
    }
  }
}, []); // Run only on mount
```

#### Updated Collection Selection Logic
- Prioritizes `selected_collection_id` from JWT when setting initial collection
- Falls back to first active collection if JWT ID is not found
- Updates both `selectedCollectionId` and `selectedCollection` when user changes collection

### 2. ParagraphGeneratorPage Component (`src/features/paragraph/ParagraphGeneratorPage.tsx`)

#### Added Import
- `UserApiService` - For JWT token decoding

#### Updated Collection Loading Logic
```typescript
useEffect(() => {
  // ... load collections from API
  
  // Get selected_collection_id from JWT
  const jwtToken = UserApiService.getStoredJwtToken();
  const payload = UserApiService.decodeJwtToken(jwtToken);
  const selectedCollectionIdFromJWT = payload?.selected_collection_id;
  
  // Priority: JWT selected_collection_id > first active > first available
  let initialCollectionId;
  if (selectedCollectionIdFromJWT && collections.find(c => c.id === selectedCollectionIdFromJWT)) {
    initialCollectionId = selectedCollectionIdFromJWT;
  } else {
    initialCollectionId = activeCollection?.id || collections[0]?.id;
  }
  
  setCurrentCollectionId(initialCollectionId);
}, [isAuthenticated]);
```

### 3. Existing Infrastructure (Already Implemented)

#### Controller (`src/controllers/vocabCollectionController.ts`)
- `changeSelectedCollection(collectionId: string)` - Updates user's selected collection via API

#### Service (`src/services/vocabCollectionService.ts`)
- `changeSelectedCollection()` - Makes POST request to `/api/v1/change-selected-collection`
- Sends payload: `{ selected_collection_id: string }`
- Uses `apiClient` with automatic JWT token injection

#### UserApiService (`src/services/userApiService.ts`)
- `decodeJwtToken(token: string)` - Decodes JWT to extract payload
- `getStoredJwtToken()` - Retrieves JWT from sessionStorage

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Loads Page                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. ParagraphGeneratorPage mounts                            │
│    - Fetches vocab collections from API                     │
│    - Decodes JWT to get selected_collection_id              │
│    - Sets currentCollectionId based on JWT                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. MainWorkspace renders                                    │
│    - Receives vocabCollections as prop                      │
│    - Decodes JWT to get selected_collection_id              │
│    - Finds matching collection and displays it              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User Changes Collection (dropdown)                       │
│    - Updates local state immediately                        │
│    - Calls API: POST /change-selected-collection            │
│    - Shows toast notification                               │
│    - Triggers vocabulary suggestions refresh                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend Updates JWT Token                                │
│    - Updates selected_collection_id in database             │
│    - Issues new JWT with updated selected_collection_id     │
│    - Returns to frontend                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Next Page Load                                            │
│    - New JWT has updated selected_collection_id             │
│    - Correct collection shown automatically                 │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoint

### POST `/api/v1/change-selected-collection`

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "selected_collection_id": "673abc123def456789012345"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Collection changed successfully"
}
```

## Key Features

### ✅ Implemented
1. **JWT Token Decoding** - Extracts `selected_collection_id` from JWT payload
2. **Initial Collection Display** - Shows correct collection on page load
3. **Collection Change API** - Updates backend when user changes collection
4. **User Feedback** - Toast notifications for success/error
5. **Vocabulary Refresh** - Reloads suggestions when collection changes
6. **Fallback Logic** - Handles missing/invalid collection IDs gracefully

### 🔄 Priority Order
1. **JWT `selected_collection_id`** - If present and valid
2. **First Active Collection** - If JWT ID not found
3. **First Available Collection** - Last resort
4. **Default Collections** - When API fails (offline mode)

## Error Handling

1. **Invalid JWT Token** - Logs error, uses fallback logic
2. **Missing Collection ID** - Falls back to first active collection
3. **API Failure** - Shows error toast, maintains current selection
4. **Network Error** - Caught by apiClient interceptor

## Testing Checklist

- [ ] Login with user that has `selected_collection_id` in JWT
- [ ] Verify correct collection is displayed on page load
- [ ] Change collection and verify API is called
- [ ] Refresh page and verify new selection persists
- [ ] Test with invalid collection ID in JWT
- [ ] Test when API fails (network offline)
- [ ] Verify vocabulary suggestions update on collection change
- [ ] Test toast notifications for success/error cases

## Notes

- JWT token is stored in `sessionStorage.jwt_token`
- Collection IDs are MongoDB ObjectId strings
- API automatically adds JWT token via `apiClient` interceptor
- Component uses both collection ID (for API) and name (for display)
