// TODO: Replace mock implementations with real API calls when backend is connected.
import type { BrandFormValues, BrandViewModel } from "@/shared/types/domain";
import { MOCK_BRANDS } from "@/shared/lib/mockData";

export async function fetchBrands(): Promise<BrandViewModel[]> {
  return MOCK_BRANDS;
}

export async function createBrand(form: BrandFormValues): Promise<BrandViewModel> {
  return { id: crypto.randomUUID(), name: form.name, icon: form.icon, description: form.description };
}

export async function updateBrand(id: string, form: BrandFormValues): Promise<BrandViewModel> {
  return { id, name: form.name, icon: form.icon, description: form.description };
}
