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
  selectable?: boolean;
  showPrint?: boolean;
  showIndex?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  selectable = true,
  showPrint = true,
  showIndex = true,
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
    if (sortKey === "__index__") {
      return sortDirection === "desc" ? [...filteredData].reverse() : [...filteredData];
    }

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
      {/* Top Controls Bar - Frosted Glass with Neumorphic Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Title & Page Size Selector */}
        <div className="flex items-center gap-3">
          {title && <h3 className="font-heading font-extrabold text-sm text-[#0f172a]">{title}</h3>}
          <div className="flex items-center gap-2 text-xs text-[#64748b] font-medium">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === "ALL" ? "ALL" : Number(e.target.value);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className="neo-inset rounded-xl px-3 py-1.5 text-xs font-bold text-[#0f172a] outline-none cursor-pointer"
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
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="neo-input pl-10 pr-3.5 py-2 text-xs rounded-2xl w-48 sm:w-64 font-medium"
            />
          </div>

          {showPrint && (
            <button
              type="button"
              onClick={handlePrint}
              className="neo-btn-icon p-2.5 rounded-xl text-[#64748b] hover:text-[#006d36] cursor-pointer"
              title="Print / Export Table"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          {onBulkDelete && selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => onBulkDelete(Array.from(selectedIds))}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}

          {actions}
        </div>
      </div>

      {/* Table Container - Frosted Glass Canvas */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200/70 bg-white/50 text-[#475569] uppercase tracking-wider font-extrabold select-none">
                {/* Select All Checkbox */}
                {selectable && (
                  <th className="py-4 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                    />
                  </th>
                )}

                {/* Index / Sr. No. with Sorting */}
                {showIndex && (
                  <th
                    onClick={() => handleSort("__index__")}
                    className="py-4 px-4 w-14 font-mono cursor-pointer hover:bg-white/80 transition-colors select-none"
                    title="Sort by Serial Number"
                  >
                    <div className="flex items-center gap-1">
                      <span>#</span>
                      <span className="text-[#94a3b8]">
                        {sortKey === "__index__" ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#006d36]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#006d36]" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </div>
                  </th>
                )}

                {/* Columns */}
                {columns.map((col, idx) => {
                  const key = (col.accessorKey as string) || String(idx);
                  const isSorted = sortKey === key;

                  return (
                    <th
                      key={key}
                      onClick={() => col.sortable !== false && col.accessorKey && handleSort(col.accessorKey as string)}
                      className={`py-4 px-4 ${col.className || ""} ${
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      } ${col.sortable !== false && col.accessorKey ? "cursor-pointer hover:bg-white/80 transition-colors" : ""}`}
                    >
                      <div
                        className={`flex items-center gap-1.5 ${
                          col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start"
                        }`}
                      >
                        <span>{col.header}</span>
                        {col.sortable !== false && col.accessorKey && (
                          <span className="text-[#94a3b8]">
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

            <tbody className="divide-y divide-gray-100/80">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (showIndex ? 1 : 0)}
                    className="py-14 text-center text-xs text-[#64748b] font-medium"
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
                      className={`hover:bg-white/80 transition-colors ${
                        isSelected ? "bg-emerald-50/70" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      {selectable && (
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(rowId)}
                            className="w-4 h-4 rounded border-gray-300 text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                          />
                        </td>
                      )}

                      {/* Sr No. */}
                      {showIndex && (
                        <td className="py-3.5 px-4 font-mono font-bold text-[#64748b] text-[11px]">
                          {globalIndex}
                        </td>
                      )}

                      {/* Columns */}
                      {columns.map((col, cIdx) => (
                        <td
                          key={String(col.accessorKey || cIdx)}
                          className={`py-3.5 px-4 ${col.className || ""} ${
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
        <div className="p-4 sm:p-5 border-t border-gray-100/90 bg-white/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748b]">
          <div>
            Showing{" "}
            <strong className="text-[#0f172a]">
              {sortedData.length === 0 ? 0 : (clampedPage - 1) * (effectivePageSize || 1) + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-[#0f172a]">
              {Math.min(clampedPage * (effectivePageSize || 1), sortedData.length)}
            </strong>{" "}
            of <strong className="text-[#0f172a]">{sortedData.length}</strong> entries
            {selectedIds.size > 0 && (
              <span className="ml-2 text-[#006d36] font-bold">
                ({selectedIds.size} selected)
              </span>
            )}
          </div>

          {pageSize !== "ALL" && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={clampedPage <= 1}
                className="neo-btn-icon p-2 rounded-xl text-[#0f172a] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="glass-pill px-4 py-1.5 font-bold text-[#0f172a] rounded-xl text-xs">
                Page {clampedPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={clampedPage >= totalPages}
                className="neo-btn-icon p-2 rounded-xl text-[#0f172a] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
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
