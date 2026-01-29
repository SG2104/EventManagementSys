import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { parse, format } from "date-fns";
import {
  eventsApi,
  type Event,
  type Category,
  type EventFormData,
} from "../services/api";

const toIsoString = (localDateTime: string) => {
  if (!localDateTime) return "";
  const date = parse(localDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
  return date.toISOString();
};

const formatForInput = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const eventSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    start_date_time: z.string().min(1, "Start time is required"),
    end_date_time: z.string().min(1, "End time is required"),
    categoryIds: z
      .array(z.string().uuid("Invalid category ID format"))
      .min(1, "At least one category is required"),
  })
  .superRefine((data, ctx) => {
    if (!data.start_date_time || !data.end_date_time) return;
    const startIso = toIsoString(data.start_date_time);
    const endIso = toIsoString(data.end_date_time);
    if (!startIso || !endIso) return;
    const start = new Date(startIso);
    const end = new Date(endIso);
    if (!(start < end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date time must be after start date time",
        path: ["end_date_time"],
      });
    }
  });

type EventFormValues = z.infer<typeof eventSchema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  eventToEdit?: Event | null;
}

export const EventModal = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  eventToEdit,
}: EventModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUpdateMode = !!eventToEdit;
  const minDateTimeLocal = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const [overlapError, setOverlapError] = useState<string | null>(null);
  const [checkingOverlap, setCheckingOverlap] = useState(false);

  const [conflicts, setConflicts] = useState<Event[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date_time: "",
      end_date_time: "",
      categoryIds: [],
    },
  });
  const startValue = watch("start_date_time");
  const endValue = watch("end_date_time");

  const watchedCategoryIds = watch("categoryIds") ?? [];
  useEffect(() => {
    const runOverlapCheck = async () => {
      if (!startValue || !endValue) {
        setOverlapError(null);
        return;
      }

      const startIso = toIsoString(startValue);
      const endIso = toIsoString(endValue);

      if (!startIso || !endIso) return;

      if (new Date(startIso) >= new Date(endIso)) return;

      try {
        setCheckingOverlap(true);

        const excludeId = isUpdateMode ? eventToEdit?.id : undefined;

        const result = await eventsApi.checkEventOverlap(
          startIso,
          endIso,
          excludeId,
        );
        if (result.hasOverlap) {
          setOverlapError("This time slot overlaps with existing events.");
          setConflicts(result.conflictingEvents);
        } else {
          setOverlapError(null);
          setConflicts([]);
        }
      } catch (err) {
        console.error("Overlap check failed:", err);
      } finally {
        setCheckingOverlap(false);
      }
    };

    const debounce = setTimeout(runOverlapCheck, 400);

    return () => clearTimeout(debounce);
  }, [startValue, endValue, isUpdateMode, eventToEdit]);
  useEffect(() => {
    if (isOpen) {
      setError(null);

      setOverlapError(null);
      setConflicts([]);
      setCheckingOverlap(false);

      if (eventToEdit) {
        reset({
          name: eventToEdit.name,
          description: eventToEdit.description || "",
          start_date_time: formatForInput(eventToEdit.start_date_time),
          end_date_time: formatForInput(eventToEdit.end_date_time),
          categoryIds: eventToEdit.categories.map((c) => c.id),
        });
      } else {
        reset({
          name: "",
          description: "",
          start_date_time: "",
          end_date_time: "",
          categoryIds: [],
        });
      }
    }
  }, [isOpen, eventToEdit, reset]);

  const handleCategoryToggle = (id: string) => {
    const current = watchedCategoryIds;
    const exists = current.includes(id);
    const next = exists ? current.filter((c) => c !== id) : [...current, id];
    setValue("categoryIds", next, { shouldValidate: true });
  };

  const onSubmit = async (values: EventFormValues) => {
    setError(null);
    try {
      setIsSubmitting(true);
      const payload: EventFormData = {
        name: values.name,
        description: values.description ?? "",
        start_date_time: toIsoString(values.start_date_time),
        end_date_time: toIsoString(values.end_date_time),
        categoryIds: values.categoryIds,
      };

      if (isUpdateMode && eventToEdit) {
        await eventsApi.updateEvent(eventToEdit.id, payload);
      } else {
        await eventsApi.createEvent(payload);
      }

      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Failed to save event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              {isUpdateMode ? "Update event" : "Create new event"}
            </h2>
            <p className="mt-0.5 text-[0.75rem] text-slate-400">
              {isUpdateMode
                ? "Edit the details and save your changes."
                : "Fill in details to create a new event."}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        <form
          className=" flex flex-col gap-2.5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid gap-2.5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className=" flex flex-col gap-1.5 text-[0.78rem]">
              <label htmlFor="name">
                Event name <span className=" text-rose-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="Team offsite, product launch..."
                {...register("name")}
                className="rounded-xl border border-slate-700/90 bg-slate-950/70 px-3 py-2 text-[0.78rem] text-slate-50 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-500"
              />
              {errors.name && (
                <span className="text-[0.7rem] text-rose-300">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className=" flex flex-col gap-1.5 text-[0.78rem]">
              <label htmlFor="start_date_time">
                Start <span className=" text-rose-400">*</span>
              </label>
              <input
                id="start_date_time"
                type="datetime-local"
                min={minDateTimeLocal}
                {...register("start_date_time")}
                className="rounded-xl border border-slate-700/90 bg-slate-950/70 px-3 py-2 text-[0.78rem] text-slate-50 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
              />
              {errors.start_date_time && (
                <span className="text-[0.7rem] text-rose-300">
                  {errors.start_date_time.message}
                </span>
              )}
            </div>

            <div className=" flex flex-col gap-1.5 text-[0.78rem]">
              <label htmlFor="end_date_time">
                End <span className=" text-rose-400">*</span>
              </label>
              <input
                id="end_date_time"
                type="datetime-local"
                min={minDateTimeLocal}
                {...register("end_date_time")}
                className="rounded-xl border border-slate-700/90 bg-slate-950/70 px-3 py-2 text-[0.78rem] text-slate-50 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
              />
              {errors.end_date_time && (
                <span className="text-[0.7rem] text-rose-300">
                  {errors.end_date_time.message}
                </span>
              )}
            </div>
          </div>

          <div className=" flex flex-col gap-1.5 text-[0.78rem]">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              placeholder="Add context, agenda, or any notes for attendees."
              {...register("description")}
              className="min-h-[70px] max-h-[180px] resize-y rounded-xl border border-slate-700/90 bg-slate-950/70 px-3 py-2 text-[0.78rem] text-slate-50 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-500"
            />
            {errors.description && (
              <span className="text-[0.7rem] text-rose-300">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className=" flex flex-col gap-1.5 text-[0.78rem]">
            <label>Categories</label>
            <div className=" flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const active = watchedCategoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={` rounded-full border px-2.5 py-1 text-[0.72rem] font-medium transition ${active
                      ? "border-sky-400 bg-sky-500 text-slate-900 shadow-sm"
                      : "border-slate-600 bg-slate-950 text-slate-100 hover:border-slate-300 hover:-translate-y-px"
                      }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    {active ? `✓ ${category.name}` : category.name}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <span className=" text-[0.72rem] text-slate-400">
                  No categories yet.
                </span>
              )}
            </div>
            {errors.categoryIds && (
              <span className="text-[0.7rem] text-rose-300">
                {errors.categoryIds.message as string}
              </span>
            )}
          </div>

          {error && (
            <div className=" rounded-xl border border-rose-400/80 bg-rose-500/10 px-3 py-2 text-[0.76rem] text-rose-50">
              {error}
            </div>
          )}

          <div className=" mt-1 flex items-center gap-2">
            <button
              type="submit"
              className=" inline-flex items-center rounded-full border border-sky-900/90 bg-gradient-to-r from-sky-500 to-sky-400 px-4 py-1.5 text-[0.8rem] font-semibold text-slate-950 shadow-[0_10px_25px_rgba(56,189,248,0.45)] transition hover:brightness-105 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              disabled={
                isSubmitting ||
                checkingOverlap ||
                !!overlapError ||
                Object.keys(errors).length > 0
              }
            >
              {isSubmitting
                ? isUpdateMode
                  ? "Saving..."
                  : "Creating..."
                : isUpdateMode
                  ? "Save changes"
                  : "Create event"}
            </button>

            {isUpdateMode && (
              <button
                type="button"
                className=" text-[0.76rem] text-slate-400 underline underline-offset-2 hover:text-slate-100"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel editing
              </button>
            )}
            {overlapError && (
              <div className="mt-2 rounded-xl border border-rose-400/60 bg-rose-500/10 px-3 py-2">
                <p className="text-[0.75rem] font-semibold text-rose-200">
                  {overlapError}
                </p>

                <ul className="mt-2 space-y-1">
                  {conflicts.map((event) => (
                    <li
                      key={event.id}
                      className="rounded-lg border border-rose-400/20 bg-slate-950/40 px-2 py-1 text-[0.72rem] text-slate-200"
                    >
                      <p className="font-medium text-rose-100">{event.name}</p>

                      <p className="text-slate-400">
                        {format(
                          new Date(event.start_date_time),
                          "dd MMM yyyy, hh:mm a",
                        )}
                        {" → "}
                        {format(
                          new Date(event.end_date_time),
                          "dd MMM yyyy, hh:mm a",
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {checkingOverlap && (
              <span className="text-[0.7rem] text-slate-400">
                Checking availability...
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
