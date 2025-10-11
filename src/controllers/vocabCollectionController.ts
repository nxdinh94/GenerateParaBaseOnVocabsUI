import { VocabCollectionService } from '@/services/vocabCollectionService';

export interface ChangeCollectionRequest {
  selected_collection_id: string;
}

export interface ChangeCollectionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class VocabCollectionController {
  /**
   * Change the user's selected vocabulary collection
   * @param collectionId - The ID of the collection to select
   * @returns Response indicating success or failure
   */
  static async changeSelectedCollection(collectionId: string): Promise<ChangeCollectionResponse> {
    try {
      console.log('🔄 Changing selected collection to:', collectionId);
      
      const response = await VocabCollectionService.changeSelectedCollection(collectionId);
      
      if (response.success) {
        console.log('✅ Successfully changed selected collection');
        return {
          success: true,
          message: response.message || 'Collection changed successfully',
        };
      } else {
        console.error('❌ Failed to change collection:', response.error);
        return {
          success: false,
          error: response.error || 'Failed to change collection',
        };
      }
    } catch (error) {
      console.error('❌ Error in changeSelectedCollection controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all vocabulary collections
   */
  static async getVocabCollections() {
    return await VocabCollectionService.getVocabCollections();
  }

  /**
   * Get vocabulary collections with vocab counts
   */
  static async getVocabCollectionsWithCounts() {
    return await VocabCollectionService.getVocabCollectionsWithCounts();
  }
}
