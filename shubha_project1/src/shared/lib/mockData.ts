/**
 * Mock data for frontend-only development.
 * Replace these with real API calls once a backend is connected.
 */

import type { BrandViewModel, BoardViewModel, UserViewModel } from "@/shared/types/domain";

export const MOCK_BRAND: BrandViewModel = {
  id: "mock-brand-1",
  name: "Acme Corp",
  icon: "Building2",
  description: "",
};

export const MOCK_BRANDS: BrandViewModel[] = [MOCK_BRAND];

export const MOCK_BOARDS: BoardViewModel[] = [];

export const MOCK_ASSETS = { items: [], total: 0 };

export const MOCK_PRODUCTS = [];

export const MOCK_USER: UserViewModel = {
  id: "mock-user-1",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
  createdAt: "2024-01-01T00:00:00Z",
};
