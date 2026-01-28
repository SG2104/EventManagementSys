import { z } from "zod";

const eventShape = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  start_date_time: z.iso.datetime({
    message: "Invalid start date time format",
  }),
  end_date_time: z.iso.datetime({ message: "Invalid end date time format" }),
  categoryIds: z
    .array(z.uuid({ message: "Invalid category ID format" }))
    .min(1, "At least one category is required"),
});

export const createEventSchema = eventShape.refine(
  (data) => {
    const start = new Date(data.start_date_time);
    const end = new Date(data.end_date_time);
    return start < end;
  },
  {
    message: "End date time must be after start date time",
    path: ["end_date_time"],
  },
);

export const updateEventSchema = createEventSchema;

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const getEventsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  categoryIds: z.string()
    .transform((val) => val.split(','))
    .pipe(z.array(z.uuid()))
    .optional(),
});

export const idParamSchema = z.object({
  id: z.uuid({ message: "Invalid event ID format" }),
});
