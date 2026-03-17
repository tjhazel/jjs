"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import { formatDate } from "@/lib/time.functions";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Recipe {
  id?: number;
  name: string;
  course: string;
  dishType: string;
  createdDate: string;
}

interface RecipeTableProps {
  recipes: Recipe[] | undefined;
  isLoading: boolean;
}

export default function RecipeTable({ recipes, isLoading }: RecipeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo<ColumnDef<Recipe>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "dishType",
        header: "Dish Type",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "createdDate",
        header: "Created Date",
        cell: (info) => formatDate(info.getValue() as string),
      },
    ],
    []
  );

  const table = useReactTable({
    data: recipes || [],
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading recipes...</div>;
  }

  if (!recipes || recipes.length === 0) {
    return <div className="text-center py-4">No recipes found.</div>;
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-3 px-4 text-left border-b font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="w-4 h-4" />,
                        desc: <ChevronDown className="w-4 h-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows per page:</label>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 border border-gray-300 rounded"
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
