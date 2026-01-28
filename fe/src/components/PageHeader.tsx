interface PageHeaderProps {
    totalEvents: number;
    onNewEvent: () => void;
    disabled?: boolean;
  }
  
  export const PageHeader = ({ totalEvents, onNewEvent, disabled }: PageHeaderProps) => {
    return (
      <header className="flex flex-col gap-4 pb-5 mb-5 border-b border-slate-700 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Event Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create and manage events with smart overlap detection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-[0.78rem] text-slate-400 md:block">
            <span className="font-medium text-slate-100">{totalEvents}</span> total events
          </div>
          <button
            type="button"
            className=" inline-flex items-center gap-1.5 rounded-full border border-slate-500/70 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800 hover:border-slate-300 transition-colors"
            onClick={onNewEvent}
            disabled={disabled}
          >
            New Event
          </button>
        </div>
      </header>
    );
  };