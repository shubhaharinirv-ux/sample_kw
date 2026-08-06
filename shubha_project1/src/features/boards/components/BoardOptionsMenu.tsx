import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";
import { renameBoard, deleteBoard } from "@/features/boards/api/boards.api";
import { useBoards } from "@/features/boards/context/BoardsContext";
import { pushToast } from "@/shared/lib/toast";

interface BoardOptionsMenuProps {
  boardId: string;
  boardName: string;
  onBoardRenamed?: () => void;
}

export default function BoardOptionsMenu({
  boardId,
  boardName,
  onBoardRenamed,
}: BoardOptionsMenuProps) {
  const { refreshBoards, setSelectedBoardId, selectedBoardId } = useBoards();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(boardName);

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === boardName) {
      setRenameOpen(false);
      return;
    }
    try {
      await renameBoard(boardId, newName.trim());
      refreshBoards();
      onBoardRenamed?.();
      pushToast({ title: "Board renamed" });
    } catch {
      pushToast({ title: "Rename failed", variant: "error" });
    }
    setRenameOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteBoard(boardId);
      if (selectedBoardId === boardId) setSelectedBoardId(null);
      refreshBoards();
      pushToast({ title: "Board deleted" });
    } catch {
      pushToast({ title: "Delete failed", variant: "error" });
    }
    setDeleteOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-200 transition"
          >
            <MoreHorizontal size={14} className="text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setNewName(boardName);
              setRenameOpen(true);
            }}
            className="flex items-center gap-2 text-sm"
          >
            <Pencil size={13} />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
            className="flex items-center gap-2 text-sm text-red-600 focus:text-red-600"
          >
            <Trash2 size={13} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename dialog */}
      <AlertDialog open={renameOpen} onOpenChange={setRenameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Board</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for "{boardName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="w-full border px-3 py-2 rounded-md text-sm mt-1"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>Rename</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              "{boardName}" will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
