/**
 * TanStack Query Hooks - RESTful API Integration
 * Manages all data fetching and caching with react-query
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as boardApi from "@/features/boards/api/boards.api";
import * as libraryApi from "@/features/library/api/library.api";
import * as productsApi from "@/features/settings/api/products.api";

// ============================================
// Boards Queries & Mutations
// ============================================

export function useBoardsQuery(brandId?: string | null) {
  return useQuery({
    queryKey: ["boards", brandId || "all"],
    queryFn: () => boardApi.fetchBoards(brandId ? { brandId } : undefined),
    staleTime: 1000 * 60,
  });
}

export function useBoardByIdQuery(id: string) {
  return useQuery({
    queryKey: ["boards", id],
    queryFn: () => boardApi.fetchBoardById(id),
    staleTime: 1000 * 60,
  });
}

export function useAddBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      brand: string;
      brandId?: string;
      assets?: number[];
    }) =>
      boardApi.createBoard({
        name: payload.name,
        brandId: payload.brandId ?? payload.brand,
        assetIds: payload.assets?.map(String),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useAddAssetsToBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      boardId,
      assetIds,
    }: {
      boardId: string;
      assetIds: string[];
    }) => boardApi.addAssetsToBoard(boardId, assetIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useRemoveAssetsFromBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      boardId,
      assetIds,
    }: {
      boardId: string;
      assetIds: string[];
    }) => boardApi.removeAssetsFromBoard(boardId, assetIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// ============================================
// Library (Items) Queries
// ============================================

export function useItemsQuery(params?: {
  brandId?: string;
  productId?: string;
  limit?: number;
  offset?: number;
  search?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ["items", params],
    queryFn: () => libraryApi.fetchItems(params),
    staleTime: 1000 * 60,
  });
}

export function useItemByIdQuery(id: string) {
  return useQuery({
    queryKey: ["items", id],
    queryFn: () => libraryApi.fetchItemById(id),
    staleTime: 1000 * 60,
  });
}

// ============================================
// Products Queries
// ============================================

export function useProductsQuery(brandId?: string | null) {
  return useQuery({
    queryKey: ["products", brandId || "all"],
    queryFn: () => productsApi.fetchProducts(brandId ? { brandId } : undefined),
    staleTime: 1000 * 60,
  });
}
