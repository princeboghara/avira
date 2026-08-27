"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Printer,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  searchPlaceholder?: string;
  searchableKeys?: (keyof T | string)[];
  onBulkDelete?: (selectedIds: string[]) => void;
  title?: string;
  actions?: React.ReactNode;
  initialPageSize?: number;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = "Search records...",
  searchableKeys = [],
  onBulkDelete,
  title,
  actions,
  initialPageSize = 10,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number | "ALL">(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 1. Filter Data by Search Query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      if (searchableKeys.length > 0) {
        return searchableKeys.some((k) => {
          const val = item[k as string];
          return val ? String(val).toLowerCase().includes(q) : false;
        });
      }
      return Object.values(item).some((val) =>
        val ? String(val).toLowerCase().includes(q) : false
      );
    });
  }, [data, searchQuery, searchableKeys]);

  // 2. Sort Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // 3. Paginate Data
  const effectivePageSize = pageSize === "ALL" ? sortedData.length || 1 : pageSize;
  const totalPages = Math.ceil(sortedData.length / (effectivePageSize || 1)) || 1;
  const clampedPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    if (pageSize === "ALL") return sortedData;
    const startIndex = (clampedPage - 1) * effectivePageSize;
    return sortedData.slice(startIndex, startIndex + effectivePageSize);
  }, [sortedData, clampedPage, effectivePageSize, pageSize]);

  // Handle Sort Toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Selection Logic
  const allCurrentSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.has(keyExtractor(item)));

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allCurrentSelected) {
      paginatedData.forEach((item) => next.delete(keyExtractor(item)));
    } else {
      paginatedData.forEach((item) => next.add(keyExtractor(item)));
    }
    setSelectedIds(next);
  };

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        {/* Left: Page Size Selector & Title */}
        <div className="flex items-center gap-3">
          {title && <h3 className="font-bold text-sm text-[#1a1c1c]">{title}</h3>}
          <div className="flex items-center gap-1.5 text-xs text-[#5f5e5e] font-semibold">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === "ALL" ? "ALL" : Number(e.target.value);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="ALL">All ({data.length})</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Right: Search Input & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-[#006d36] focus:bg-white w-48 sm:w-60 font-medium"
            />
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-[#5f5e5e] hover:text-[#1a1c1c] cursor-pointer transition-colors"
            title="Print / Export Table"
          >
            <Printer className="w-4 h-4" />
          </button>

          {onBulkDelete && selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => onBulkDelete(Array.from(selectedIds))}
              className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}

          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75 text-[#5f5e5e] uppercase tracking-wider font-extrabold select-none">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                  />
                </th>

                {/* Index / Sr. No. */}
                <th className="py-3.5 px-4 w-14 font-mono">#</th>

                {/* Columns */}
                {columns.map((col, idx) => {
                  const key = (col.accessorKey as string) || String(idx);
                  const isSorted = sortKey === key;

                  return (
                    <th
                      key={key}
                      onClick={() => col.sortable !== false && col.accessorKey && handleSort(col.accessorKey as string)}
                      className={`py-3.5 px-4 ${col.className || ""} ${
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      } ${col.sortable !== false && col.accessorKey ? "cursor-pointer hover:bg-gray-100/80 transition-colors" : ""}`}
                    >
                      <div
                        className={`flex items-center gap-1.5 ${
                          col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start"
                        }`}
                      >
                        <span>{col.header}</span>
                        {col.sortable !== false && col.accessorKey && (
                          <span className="text-gray-400">
                            {isSorted ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#006d36]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#006d36]" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="py-12 text-center text-xs text-[#5f5e5e] font-medium"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const rowId = keyExtractor(row);
                  const isSelected = selectedIds.has(rowId);
                  const globalIndex = (clampedPage - 1) * (effectivePageSize || 1) + idx + 1;

                  return (
                    <tr
                      key={rowId}
                      className={`hover:bg-emerald-50/30 transition-colors ${
                        isSelected ? "bg-emerald-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(rowId)}
                          className="w-4 h-4 rounded border-gray-300 text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                        />
                      </td>

                      {/* Sr No. */}
                      <td className="py-3 px-4 font-mono font-bold text-[#5f5e5e] text-[11px]">
                        {globalIndex}
                      </td>

                      {/* Columns */}
                      {columns.map((col, cIdx) => (
                        <td
                          key={String(col.accessorKey || cIdx)}
                          className={`py-3 px-4 ${col.className || ""} ${
                            col.align === "right"
                              ? "text-right"
                              : col.align === "center"
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {col.cell
                            ? col.cell(row, globalIndex)
                            : col.accessorKey
                            ? String(row[col.accessorKey as string] ?? "")
                            : null}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Controls */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5f5e5e]">
          <div>
            Showing{" "}
            <strong className="text-[#1a1c1c]">
              {sortedData.length === 0 ? 0 : (clampedPage - 1) * (effectivePageSize || 1) + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-[#1a1c1c]">
              {Math.min(clampedPage * (effectivePageSize || 1), sortedData.length)}
            </strong>{" "}
            of <strong className="text-[#1a1c1c]">{sortedData.length}</strong> entries
            {selectedIds.size > 0 && (
              <span className="ml-2 text-[#006d36] font-bold">
                ({selectedIds.size} selected)
              </span>
            )}
          </div>

          {pageSize !== "ALL" && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={clampedPage <= 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-[#1a1c1c] bg-white border border-gray-200 rounded-lg">
                Page {clampedPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={clampedPage >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
