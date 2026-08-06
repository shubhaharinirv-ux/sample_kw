// TODO: Replace mock implementations with real API calls when backend is connected.
import type { BoardViewModel } from "@/shared/types/domain";
import { MOCK_BOARDS } from "@/shared/lib/mockData";

export async function fetchBoards(_brandId: string): Promise<BoardViewModel[]> {
  return MOCK_BOARDS;
}

export async function createBoard(brandId: string, name: string, assetIds: string[] = []): Promise<BoardViewModel> {
  return { id: crypto.randomUUID(), name, brandId, assetIds };
}

export async function addAssetsToBoard(boardId: string, assetIds: string[]): Promise<BoardViewModel> {
  return { id: boardId, name: "", brandId: "", assetIds };
}

export async function renameBoard(boardId: string, name: string): Promise<BoardViewModel> {
  return { id: boardId, name, brandId: "", assetIds: [] };
}

export async function deleteBoard(_boardId: string): Promise<void> {
  return;
}
