import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as boardsApi from "@/features/boards/api/boards.api";
import type { BoardViewModel } from "@/shared/types/domain";

interface BoardsContextValue {
  selectedBrandId: string | null;
  setSelectedBrandId: (id: string | null) => void;
  selectedBoardId: string | null;
  setSelectedBoardId: (id: string | null) => void;
  boards: BoardViewModel[];
  isLoadingBoards: boolean;
  createBoard: (name: string, assetIds?: string[]) => Promise<void>;
  addAssetsToBoard: (boardId: string, assetIds: string[]) => Promise<void>;
  refreshBoards: () => void;
}

const BoardsContext = createContext<BoardsContextValue>({
  selectedBrandId: null,
  setSelectedBrandId: () => {},
  selectedBoardId: null,
  setSelectedBoardId: () => {},
  boards: [],
  isLoadingBoards: false,
  createBoard: async () => {},
  addAssetsToBoard: async () => {},
  refreshBoards: () => {},
});

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: boards = [], isLoading: isLoadingBoards } = useQuery<BoardViewModel[]>({
    queryKey: ["boards", selectedBrandId],
    queryFn: () => boardsApi.fetchBoards(selectedBrandId!),
    enabled: !!selectedBrandId,
  });

  const refreshBoards = () => {
    queryClient.invalidateQueries({ queryKey: ["boards", selectedBrandId] });
  };

  const createBoard = async (name: string, assetIds: string[] = []) => {
    if (!selectedBrandId) return;
    await boardsApi.createBoard(selectedBrandId, name, assetIds);
    refreshBoards();
  };

  const addAssetsToBoard = async (boardId: string, assetIds: string[]) => {
    await boardsApi.addAssetsToBoard(boardId, assetIds);
    refreshBoards();
  };

  return (
    <BoardsContext.Provider
      value={{
        selectedBrandId,
        setSelectedBrandId,
        selectedBoardId,
        setSelectedBoardId,
        boards,
        isLoadingBoards,
        createBoard,
        addAssetsToBoard,
        refreshBoards,
      }}
    >
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  return useContext(BoardsContext);
}
