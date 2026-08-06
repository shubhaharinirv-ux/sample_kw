// TODO: Replace mock implementations with real API calls when backend is connected.
import type { ProductFormValues, ProductViewModel } from "@/shared/types/domain";

export async function fetchProducts(_params?: { brandId?: string }): Promise<ProductViewModel[]> {
  return [];
}

export async function fetchProductById(_id: string): Promise<ProductViewModel> {
  throw new Error("Not implemented");
}

export async function createProduct(form: ProductFormValues): Promise<ProductViewModel> {
  return { id: crypto.randomUUID(), name: form.name, brandId: form.brandId, url: form.url ?? "" };
}

export async function updateProduct(id: string, form: ProductFormValues): Promise<ProductViewModel> {
  return { id, name: form.name, brandId: form.brandId, url: form.url ?? "" };
}

export interface ProductDeleteCheckResult {
  product_id: string;
  product_name: string;
  asset_count: number;
  blocking_count: number;
  can_delete: boolean;
}

export async function checkProductDeleteStatus(id: string): Promise<ProductDeleteCheckResult> {
  return { product_id: id, product_name: "", asset_count: 0, blocking_count: 0, can_delete: true };
}

export async function deleteProduct(_id: string, _force: boolean = false): Promise<void> {
  return;
}
