import { useState, useCallback, useRef, useEffect } from "react";
import { Filter, X, GripVertical, ChevronDown, ChevronUp, Search, RotateCcw } from "lucide-react";

/* ─── Types ─── */
export interface FilterItem {
  id: string;
  label: string;
  value?: string;
  options?: string[];
}

interface FilterPanelProps {
  filters: FilterItem[];
  onFiltersChange?: (filters: FilterItem[]) => void;
  onApply?: () => void;
  onReset?: () => void;
  title?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  storageKey?: string;
}

/* ─── Draggable Filter Row ─── */
function DraggableFilterRow({
  filter,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onValueChange,
}: {
  filter: FilterItem;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  onValueChange: (id: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      className="group"
    >
      <div className="flex items-center gap-1.5">
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing p-0.5 text-[#999] dark:text-[#555] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-[12px] h-[12px]" />
        </button>

        {/* Filter dropdown */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-2.5 py-[7px] bg-white dark:bg-[#262b35] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] text-[13px] text-[#212121] dark:text-[#e4e4e4] hover:border-[#c0c6d0] dark:hover:border-[#444b5a] transition-colors"
            style={{ fontWeight: 400 }}
          >
            <span className="truncate text-left">
              {filter.value || filter.label}
            </span>
            {open ? (
              <ChevronUp className="w-[12px] h-[12px] text-[#999] dark:text-[#6b7280] shrink-0 ml-1" />
            ) : (
              <ChevronDown className="w-[12px] h-[12px] text-[#999] dark:text-[#6b7280] shrink-0 ml-1" />
            )}
          </button>

          {/* Dropdown options */}
          {open && filter.options && (
            <div className="mt-1 bg-white dark:bg-[#262b35] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] shadow-sm overflow-hidden z-10 relative">
              {filter.options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onValueChange(filter.id, option);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-[6px] text-[13px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors ${
                    filter.value === option
                      ? "text-[#2552ED] bg-[#f0f3ff] dark:bg-[#1e2d5e]"
                      : "text-[#212121] dark:text-[#e4e4e4]"
                  }`}
                  style={{ fontWeight: 400 }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Panel ─── */
export function FilterPanel({
  filters: initialFilters,
  onFiltersChange,
  onApply,
  onReset,
  title = "Filters",
  collapsed = false,
  onToggleCollapse,
  storageKey,
}: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterItem[]>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as FilterItem[];
          // Merge saved order with initial filters to pick up any new filters
          const savedIds = new Set(parsed.map((f) => f.id));
          const newFilters = initialFilters.filter((f) => !savedIds.has(f.id));
          return [...parsed, ...newFilters];
        } catch { /* fall through */ }
      }
    }
    return initialFilters;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    }
  }, [filters, storageKey]);

  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, _index: number) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (dropIndex: number) => {
      const dragIndex = dragIndexRef.current;
      if (dragIndex === null || dragIndex === dropIndex) return;

      const updated = [...filters];
      const [dragged] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, dragged);
      setFilters(updated);
      onFiltersChange?.(updated);
      dragIndexRef.current = null;
    },
    [filters, onFiltersChange]
  );

  const handleValueChange = useCallback(
    (id: string, value: string) => {
      const updated = filters.map((f) =>
        f.id === id ? { ...f, value } : f
      );
      setFilters(updated);
      onFiltersChange?.(updated);
    },
    [filters, onFiltersChange]
  );

  const handleReset = useCallback(() => {
    const reset = filters.map((f) => ({ ...f, value: undefined }));
    setFilters(reset);
    onFiltersChange?.(reset);
    onReset?.();
  }, [filters, onFiltersChange, onReset]);

  const filteredFilters = searchQuery
    ? filters.filter((f) =>
        f.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filters;

  const visibleFilters = showAll ? filteredFilters : filteredFilters.slice(0, 8);
  const hasMore = filteredFilters.length > 8;
  const activeCount = filters.filter((f) => f.value).length;

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="h-full w-[40px] bg-white dark:bg-[#1e2229] border-l border-[#e5e9f0] dark:border-[#333a47] flex flex-col items-center justify-start pt-4 shrink-0 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#262b35]"
        title="Expand filters"
      >
        <Filter className="w-[14px] h-[14px] text-[#555] dark:text-[#8b92a5] mb-2" />
        {activeCount > 0 && (
          <span className="w-[18px] h-[18px] rounded-full bg-[#2552ED] text-white text-[10px] flex items-center justify-center" style={{ fontWeight: 400 }}>
            {activeCount}
          </span>
        )}
        <span
          className="text-[11px] text-[#555] dark:text-[#8b92a5] mt-3"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            fontWeight: 400,
          }}
        >
          {title}
        </span>
      </button>
    );
  }

  return (
    <div className="w-[260px] bg-white dark:bg-[#1e2229] border-l border-[#e5e9f0] dark:border-[#333a47] flex flex-col h-full shrink-0 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e9f0] dark:border-[#333a47] shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-[14px] h-[14px] text-[#555] dark:text-[#8b92a5]" />
          <span className="text-[14px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>
            {title}
          </span>
          {activeCount > 0 && (
            <span className="w-[18px] h-[18px] rounded-full bg-[#2552ED] text-white text-[10px] flex items-center justify-center" style={{ fontWeight: 400 }}>
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-[4px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors"
          title="Collapse filters"
        >
          <X className="w-[14px] h-[14px] text-[#555] dark:text-[#8b92a5]" />
        </button>
      </div>

      {/* Search filters */}
      <div className="px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-[6px] bg-[#f5f5f5] dark:bg-[#262b35] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px]">
          <Search className="w-[13px] h-[13px] text-[#999] dark:text-[#6b7280] shrink-0" />
          <input
            type="text"
            placeholder="Search filters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[#212121] dark:text-[#e4e4e4] placeholder-[#999] dark:placeholder-[#6b7280] outline-none"
            style={{ fontWeight: 400 }}
          />
        </div>
      </div>

      {/* Filter list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <div className="flex flex-col gap-2">
          {visibleFilters.map((filter, index) => (
            <DraggableFilterRow
              key={filter.id}
              filter={filter}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onValueChange={handleValueChange}
            />
          ))}
        </div>

        {/* See all filters link */}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-3 text-[13px] text-[#2552ED] hover:underline"
            style={{ fontWeight: 400 }}
          >
            See all filters ({filteredFilters.length - 8} more)
          </button>
        )}
        {showAll && hasMore && (
          <button
            onClick={() => setShowAll(false)}
            className="mt-3 text-[13px] text-[#2552ED] hover:underline"
            style={{ fontWeight: 400 }}
          >
            Show fewer filters
          </button>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-[#e5e9f0] dark:border-[#333a47] shrink-0">
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-[7px] text-[13px] text-[#555] dark:text-[#8b92a5] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors"
          style={{ fontWeight: 400 }}
        >
          <RotateCcw className="w-[12px] h-[12px]" />
          Reset
        </button>
        <button
          onClick={onApply}
          className="flex-1 px-3 py-[7px] text-[13px] text-white bg-[#6834b7] rounded-[8px] hover:bg-[#5a2da0] transition-colors"
          style={{ fontWeight: 400 }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}