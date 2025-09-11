# API Architecture Documentation

## Overview

The application has been refactored to follow a proper **Controller → Service → API Client** architecture pattern. This provides better separation of concerns, maintainability, and testability.

## Architecture Layers

### 1. **UI Components** (`src/ui.tsx`)
- **Responsibility**: User interface and user interactions
- **Dependencies**: Controllers only
- **Pattern**: UI → Controller

### 2. **Controllers** (`src/controllers/`)
- **Responsibility**: Business logic coordination, validation, and error handling
- **Dependencies**: Services
- **Pattern**: Controller → Service

### 3. **Services** (`src/services/`)
- **Responsibility**: Business logic implementation and API communication
- **Dependencies**: API Client, Utilities
- **Pattern**: Service → API Client

### 4. **API Client** (`src/services/apiClient.ts`)
- **Responsibility**: HTTP communication configuration and error handling
- **Dependencies**: Axios
- **Pattern**: HTTP requests to external APIs

## File Structure

```
src/
├── controllers/
│   └── paragraphController.ts      # Main controller for paragraph operations
├── services/
│   ├── apiClient.ts               # HTTP client configuration
│   ├── paragraphService.ts        # Paragraph generation business logic
│   ├── savedParagraphService.ts   # Saved paragraphs business logic
│   ├── localStorageService.ts     # localStorage operations
│   └── apiService.ts              # DEPRECATED - kept for compatibility
├── types/
│   └── api.ts                     # TypeScript interfaces and types
├── utits/
│   └── hightlight_vocabs.ts       # Vocabulary highlighting utility
└── ui.tsx                         # Main UI component
```

## Controllers

### ParagraphController (`src/controllers/paragraphController.ts`)

**Purpose**: Orchestrates all paragraph-related operations

**Methods**:
- `generateParagraph(vocabularies, settings)` - Generate new paragraph
- `getSavedParagraphs()` - Retrieve all saved paragraphs
- `saveParagraph(request)` - Save a paragraph
- `deleteSavedParagraph(id)` - Delete a saved paragraph
- `updateSavedParagraph(id, request)` - Update a saved paragraph
- `getParagraphById(id)` - Get specific paragraph
- `refreshSavedParagraphs()` - Refresh paragraphs list

**Usage Example**:
```typescript
import { paragraphController } from './controllers/paragraphController';

// Generate paragraph
const response = await paragraphController.generateParagraph(vocabularies, settings);

// Get saved paragraphs
const savedParagraphs = await paragraphController.getSavedParagraphs();
```

## Services

### ParagraphService (`src/services/paragraphService.ts`)

**Purpose**: Handles paragraph generation business logic

**Key Features**:
- Validates request data
- Communicates with paragraph generation API
- Applies vocabulary highlighting
- Handles timeout and error scenarios

### SavedParagraphService (`src/services/savedParagraphService.ts`)

**Purpose**: Handles saved paragraph operations

**Key Features**:
- CRUD operations for saved paragraphs
- Request validation
- Error handling and logging

## API Client (`src/services/apiClient.ts`)

**Purpose**: Centralized HTTP client configuration

**Features**:
- Axios instance with base configuration
- Request/Response interceptors for logging
- Standardized error handling
- Timeout configuration

**Configuration**:
- Base URL: `http://127.0.0.1:8000/api/v1`
- Default timeout: 60 seconds
- Extended timeout for AI operations: 120 seconds

## Types (`src/types/api.ts`)

**Purpose**: TypeScript type definitions for type safety

**Key Interfaces**:
- `GenerateParagraphRequest` - Paragraph generation request
- `GenerateParagraphResponse` - Paragraph generation response
- `SavedParagraph` - Saved paragraph data structure
- `ParagraphSettings` - UI settings interface
- `ApiResponse<T>` - Generic API response wrapper

## Data Flow

### Paragraph Generation
```
UI Component → ParagraphController → ParagraphService → API Client → External API
```

### Saved Paragraphs
```
UI Component → ParagraphController → SavedParagraphService → API Client → External API
```

### Error Handling
```
API Error → API Client (handleApiError) → Service → Controller → UI Component
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- UI handles only presentation logic
- Controllers handle coordination and validation
- Services handle business logic
- API Client handles communication

### 2. **Maintainability**
- Clear responsibilities for each layer
- Easy to locate and fix issues
- Simplified testing and debugging

### 3. **Scalability**
- Easy to add new features
- Simple to modify business logic
- Straightforward to change API endpoints

### 4. **Type Safety**
- Comprehensive TypeScript interfaces
- Compile-time error detection
- Better IDE support and autocomplete

### 5. **Error Handling**
- Centralized error handling in API Client
- Layer-specific error processing
- User-friendly error messages

## Migration from Old Architecture

### Before (Direct API Service)
```typescript
import { ApiService } from './services/apiService';
const response = await ApiService.generateParagraph(requestData);
```

### After (Controller Pattern)
```typescript
import { paragraphController } from './controllers/paragraphController';
const response = await paragraphController.generateParagraph(vocabularies, settings);
```

### Compatibility
- Old `ApiService` is deprecated but still available
- Throws helpful error messages pointing to new methods
- Types are re-exported for backward compatibility

## Best Practices

### 1. **Use Controllers in UI Components**
```typescript
// ✅ Good
import { paragraphController } from './controllers/paragraphController';
await paragraphController.generateParagraph(vocabularies, settings);

// ❌ Avoid
import { ParagraphService } from './services/paragraphService';
await new ParagraphService().generateParagraph(request);
```

### 2. **Handle Errors Gracefully**
```typescript
const response = await paragraphController.generateParagraph(vocabularies, settings);
if (!response.success) {
  console.error('Error:', response.error);
  // Show user-friendly error message
}
```

### 3. **Use TypeScript Types**
```typescript
import type { ParagraphSettings } from './types/api';
const settings: ParagraphSettings = { /* ... */ };
```

## API Endpoints

### Generate Paragraph
- **Endpoint**: `POST /generate-paragraph`
- **Timeout**: 120 seconds (for AI processing)
- **Request**: `GenerateParagraphRequest`
- **Response**: `ApiParagraphResponse`

### Saved Paragraphs
- **List**: `GET /saved-paragraphs`
- **Create**: `POST /save-paragraph`
- **Get**: `GET /saved-paragraphs/{id}`
- **Update**: `PUT /saved-paragraphs/{id}`
- **Delete**: `DELETE /saved-paragraphs/{id}`

## Testing

The new architecture makes testing much easier:

### Unit Testing Controllers
```typescript
// Mock the services
jest.mock('../services/paragraphService');
// Test controller logic in isolation
```

### Unit Testing Services
```typescript
// Mock the API client
jest.mock('./apiClient');
// Test business logic without network calls
```

### Integration Testing
```typescript
// Test the full flow with real API calls
// Use the controller as the entry point
```

## Performance Considerations

### 1. **Singleton Pattern**
- Controllers use singleton instances to avoid recreation
- Services are lightweight and can be instantiated as needed

### 2. **Error Handling**
- Fast-fail validation in controllers
- Detailed logging at service level

### 3. **Timeout Management**
- Different timeouts for different operations
- Graceful handling of long-running AI requests

## Future Enhancements

### 1. **Caching Layer**
- Add caching service between controller and API service
- Cache frequently requested data

### 2. **Retry Logic**
- Implement automatic retry for failed requests
- Exponential backoff for network errors

### 3. **Offline Support**
- Add offline detection
- Queue requests when offline

### 4. **Request Batching**
- Batch multiple requests for efficiency
- Implement request deduplication

---

This architecture provides a solid foundation for maintainable, scalable, and testable code. Each layer has clear responsibilities, making it easy to understand, modify, and extend the application.
