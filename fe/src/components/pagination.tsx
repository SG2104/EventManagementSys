interface PaginationProps {
    offset: number;
    limit: number;
    total: number;
    onPageChange: (newOffset: number) => void;
  }
  
  export const Pagination = ({ offset, limit, total, onPageChange }: PaginationProps) => {
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  
    const handlePrev = () => onPageChange(Math.max(offset - limit, 0));
    const handleNext = () =>
      onPageChange(offset + limit >= total ? offset : offset + limit);
  
    return (
      <div className="mt-3 flex items-center justify-between text-[0.78rem] text-slate-300">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-600/80 bg-transparent px-2.5 py-1 text-[0.72rem] text-slate-100 hover:bg-slate-700/40 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrev}
            disabled={offset === 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-600/80 bg-transparent px-2.5 py-1 text-[0.72rem] text-slate-100 hover:bg-slate-700/40 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={offset + limit >= total}
          >
            Next
          </button>
        </div>
      </div>
    );
  };