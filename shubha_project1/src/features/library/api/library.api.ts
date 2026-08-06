// TODO: Replace mock implementations with real API calls when backend is connected.
import type { AssetFormValues, AssetViewModel } from "@/shared/types/domain";

export interface ItemFilterParams {
  brandId?: string;
  productId?: string;
  shootId?: string;
  modelIds?: string[];
  limit?: number;
  offset?: number;
  search?: string;
  type?: string;
  inference?: string;
  boardId?: string;
  customAttributes?: Record<string, string>;
  matchType?: "exact" | "contains";
}

export async function fetchItems(_params?: ItemFilterParams) {
  return { items: [] as AssetViewModel[], total: 0 };
}

// Re-export as fetchAssets for backwards compatibility
export const fetchAssets = fetchItems;

export async function fetchItemById(_id: string): Promise<AssetViewModel> {
  throw new Error("Not implemented");
}

export async function createItem(_form: AssetFormValues): Promise<AssetViewModel> {
  throw new Error("Not implemented");
}

export async function updateItem(_id: string, _form: AssetFormValues): Promise<AssetViewModel> {
  throw new Error("Not implemented");
}
