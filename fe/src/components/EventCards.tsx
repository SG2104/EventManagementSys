import React from 'react';
import type { Event } from '../services/api';



interface EventItemProps {
  event: Event;
  isSubmitting?: boolean;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export const EventItem: React.FC<EventItemProps> = ({
  event,
  isSubmitting = false,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
  };

  return (
    <li className="flex rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5">
      <div className=" flex w-full flex-col gap-1">
        
        <div className=" flex items-center justify-between gap-3">
          <h3 className="text-[0.9rem] font-semibold text-slate-50">
            {event.name}
          </h3>
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(event)}
              disabled={isSubmitting}
              className=" rounded-full border border-slate-600/80 bg-transparent px-2.5 py-1 text-[0.72rem] text-slate-100 hover:bg-slate-700/40 disabled:opacity-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              disabled={isSubmitting}
              className=" rounded-full border border-rose-500/80 bg-transparent px-2.5 py-1 text-[0.72rem] text-rose-100 hover:bg-rose-600/30 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>

        <p className=" text-[0.76rem] text-slate-400">
          {formatDate(event.start_date_time)} – {formatDate(event.end_date_time)}
        </p>

        {event.description && (
          <p className=" text-[0.78rem] text-slate-200">
            {event.description}
          </p>
        )}

        <div className=" mt-1 flex flex-wrap gap-1">
          {event.categories.map((category) => (
            <span
              key={category.id}
              className="rounded-full border border-blue-500/80 bg-blue-500/25 px-2 py-0.5 text-[0.7rem] text-blue-50"
            >
              {category.name}
            </span>
          ))}
          
          {event.categories.length === 0 && (
            <span className=" text-[0.72rem] text-slate-400">
              No categories
            </span>
          )}
        </div>

      </div>
    </li>
  );
};