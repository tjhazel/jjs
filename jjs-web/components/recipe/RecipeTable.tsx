"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  recipeId?: number;
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
  const router = useRouter();
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
        header: "Created",
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
    return <div className="text-center py-8 text-gray-600">Loading recipes...</div>;
  }

  if (!recipes || recipes.length === 0) {
    return <div className="text-center py-8 text-gray-600">No recipes found.</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Desktop table - hidden on mobile */}
      <div className="hidden sm:block border border-gray-200">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200 bg-white">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-3 px-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-gray-700">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  row.original.recipeId && router.push(`/recipe/${row.original.recipeId}`);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-4 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list view */}
      <div className="sm:hidden space-y-3">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            className="border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              row.original.recipeId && router.push(`/recipe/${row.original.recipeId}`);
            }}
          >
            <h3 className="font-semibold text-gray-900 mb-2">{row.original.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">Course:</span> {row.original.course}</p>
              <p><span className="font-medium text-gray-900">Type:</span> {row.original.dishType}</p>
              <p><span className="font-medium text-gray-900">Created:</span> {formatDate(row.original.createdDate)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Per page:</label>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 border border-gray-300 text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
