/**
 * Abstract interface for mapping operations.
 * Allows the same UI components to map items to different entity types.
 */
export interface MappingActions {
  /** Map a set of items to a specific entity */
  mapItems: (
    itemIds: string[],
    entityType: string,
    entityId: string,
    forceReplace?: boolean
  ) => Promise<{
    successCount: number;
    errorCount: number;
    conflicts: { itemId: string; currentName?: string }[];
    firstErrorMessage?: string;
  }>;
  
  /** Get options for mapping based on current brand */
  getMappingOptions: (brandId: string | null) => {
    shoots: { id: string; label: string }[];
    products: { id: string; label: string }[];
    models: { id: string; label: string }[];
  };
}
