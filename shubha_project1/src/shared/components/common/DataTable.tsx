"use client";

import React from "react";
import { Table } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ children, className }) => (
  <div
    className={cn(
      "max-h-[70vh] min-h-[50vh] overflow-y-auto overflow-x-hidden",
      className
    )}
  >
    <Table className="w-full border-collapse">{children}</Table>
  </div>
);

export default DataTable;
