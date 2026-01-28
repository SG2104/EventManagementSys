import type { Category } from "../services/api";

interface CategoryFilterProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

export const CategoryFilter = ({
  categories,
  selectedIds,
  onToggle,
  onClear,
}: CategoryFilterProps) => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
          <p className="mt-0.5 text-[0.75rem] text-slate-400">
            Filter events by one or more categories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => {
              const active = selectedIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`rounded-full border px-2.5 py-1 text-[0.72rem] font-medium transition ${
                    active
                      ? "border-emerald-400 bg-emerald-500 text-slate-900 shadow-sm"
                      : "border-slate-600 bg-slate-900 text-slate-100 hover:border-slate-300 hover:-translate-y-px"
                  }`}
                  onClick={() => onToggle(category.id)}
                >
                  {active ? ` ${category.name}` : category.name}
                </button>
              );
            })}
          </div>
          {selectedIds.length > 0 && (
            <button
              type="button"
              className="text-[0.72rem] text-slate-400 underline underline-offset-2 hover:text-slate-100"
              onClick={onClear}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </section>
  );
};