import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import { ChevronFirst, ChevronLast } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ScalablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  itemsPerPageBlock?: number;
}

export const ScalablePagination: React.FC<ScalablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  itemsPerPageBlock = 10,
}) => {
  // Calculate the block of pages to show
  // If itemsPerPageBlock = 10:
  // Pages 1-10 -> block 0
  // Pages 11-20 -> block 1
  const currentBlock = Math.floor((currentPage - 1) / itemsPerPageBlock);
  const startPage = currentBlock * itemsPerPageBlock + 1;
  const endPage = Math.min(startPage + itemsPerPageBlock - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <Pagination className={cn("select-none", className)}>
      <PaginationContent>
        {/* First Page Button */}
        <PaginationItem>
          <PaginationLink
            onClick={() => onPageChange(1)}
            className={cn(
              "cursor-pointer px-2",
              currentPage === 1 && "pointer-events-none opacity-50"
            )}
            aria-label="Go to first page"
          >
            <ChevronFirst className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>

        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={cn(
              "cursor-pointer",
              currentPage === 1 && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
              className="cursor-pointer min-w-[40px]"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={cn(
              "cursor-pointer",
              currentPage === totalPages && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>

        {/* Last Page Button */}
        <PaginationItem>
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            className={cn(
              "cursor-pointer px-2",
              currentPage === totalPages && "pointer-events-none opacity-50"
            )}
            aria-label="Go to last page"
          >
            <ChevronLast className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
