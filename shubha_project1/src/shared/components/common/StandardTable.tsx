"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

type StandardTableProps = {
  /** Header rows */
  header: React.ReactNode;
  /** Body rows */
  children: React.ReactNode;
  containerClassName?: string;
  tableClassName?: string;
};

/**
 * Shared shadcn-based table wrapper for consistent sizing and stickies.
 */
export default function StandardTable({
  header,
  children,
  containerClassName,
  tableClassName,
}: StandardTableProps) {
  return (
    <div
      className={cn(
        "max-h-[70vh] min-h-[50vh] overflow-y-auto overflow-x-hidden",
        containerClassName
      )}
    >
      <Table className={cn("w-full text-sm", tableClassName)}>
        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
          {header}
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}
