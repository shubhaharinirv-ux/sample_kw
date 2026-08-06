"use client";

import React, { useState, ChangeEvent, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { useBoards } from "@/features/boards/context/BoardsContext";
import BoardOptionsMenu from "./BoardOptionsMenu";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";
import { pushToast } from "@/shared/lib/toast";

const BoardPane: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [openNewBoardPopup, setOpenNewBoardPopup] = useState(false);
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);

  const {
    boards,
    selectedBoardId,
    setSelectedBoardId,
    addAssetsToBoard,
    createBoard,
  } = useBoards();
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDropOnBoard = (boardId: string, event: React.DragEvent) => {
    event.preventDefault();
    setDragOverBoardId(null);
    const raw = event.dataTransfer.getData("application/kalaio-item");
    if (!raw) return;
    try {
      const asset = JSON.parse(raw) as { id: string };
      if (!asset?.id) return;
      const alreadyInBoard = boards
        .find((b) => b.id === boardId)
        ?.assetIds.includes(asset.id);

      if (alreadyInBoard) {
        pushToast({
          title: "Already in board",
          description: "This item is already in the selected board.",
        });
        return;
      }

      addAssetsToBoard(boardId, [asset.id]);
      pushToast({
        title: "Item added",
        description: `Added to board "${boards.find((b) => b.id === boardId)?.name || "Board"}"`,
      });
    } catch (err) {
      console.error("Failed to drop item", err);
      pushToast({
        title: "Drop failed",
        description: "Could not add item to board.",
        variant: "error",
      });
    }
  };

  const handleDragOverBoard = (boardId: string, event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (dragOverBoardId !== boardId) setDragOverBoardId(boardId);
  };

  const handleDragLeaveBoard = (boardId: string) => {
    if (dragOverBoardId === boardId) setDragOverBoardId(null);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredBoards = useMemo(() => {
    if (!searchTerm.trim()) return boards;

    return boards.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boards, searchTerm]);

  const handleAddBoard = async () => {
    if (!newBoardName.trim()) return;

    await createBoard(newBoardName.trim(), []);

    setNewBoardName("");
    setOpenNewBoardPopup(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sticky Header - Title + Search */}
      <div className="shrink-0 sticky top-0 bg-white z-10 px-4 pt-1 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Boards</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenNewBoardPopup(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 transition"
            >
              <Plus size={16} className="text-gray-700" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2 shadow-sm">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search boards..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="outline-none text-sm w-full bg-transparent text-gray-700"
          />
        </div>
      </div>

      {/* Scrollable Body - Boards List */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 pt-4 space-y-2">
        {filteredBoards.length > 0 ? (
          filteredBoards.map((board) => {
            const handleSelectBoard = () => {
              setSelectedBoardId(board.id);
              navigate(`/library/b/${board.id}${search}`);
            };
            // Use assetCount from server (or fallback to assetIds length)
            const validCount = board.assetCount ?? board.assetIds?.length ?? 0;
            return (
              <div
                key={board.id}
                onClick={handleSelectBoard}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectBoard();
                  }
                }}
                onDragOver={(e) => handleDragOverBoard(board.id, e)}
                onDragEnter={(e) => handleDragOverBoard(board.id, e)}
                onDragLeave={() => handleDragLeaveBoard(board.id)}
                onDrop={(e) => handleDropOnBoard(board.id, e)}
                className={`cursor-pointer border rounded-lg p-3 transition flex items-start justify-between group ${
                  selectedBoardId === board.id
                    ? "border-blue-500 bg-blue-50"
                    : dragOverBoardId === board.id
                    ? "border-blue-400 bg-blue-50/70"
                    : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {board.name}
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      validCount > 0
                        ? "text-gray-500"
                        : "text-gray-500 invisible"
                    }`}
                  >
                    {validCount > 0
                      ? `${validCount} item${validCount > 1 ? "s" : ""}`
                      : "0 items"}
                  </p>
                </div>

                <div className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BoardOptionsMenu
                    boardId={board.id}
                    boardName={board.name}
                    onBoardRenamed={() => {
                      // Optional: refresh or update
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 text-center mt-4">
            No boards found.
          </p>
        )}
      </div>

      <AlertDialog open={openNewBoardPopup} onOpenChange={setOpenNewBoardPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Board</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new board for organizing your items.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <input
            type="text"
            placeholder="Board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            className="w-full border px-3 py-2 rounded-md text-sm mt-2"
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddBoard}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BoardPane;
