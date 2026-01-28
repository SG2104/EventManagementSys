import { Request, Response } from "express";
import { pool } from "../../config/db";
import {
  createEventSchema,
  getEventsSchema,
  idParamSchema,
} from "./validation.schema";
import {
  hasEventOverlap,
  getEventWithCategories,
  fetchOverlappingEvents,
} from "./service";
import { z } from "zod";

export const checkOverlap = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { start_date_time, end_date_time, excludeEventId } = req.query;

    if (!start_date_time || !end_date_time) {
      return res.json({
        status: "success",
        data: { hasOverlap: false, conflictingEvents: [] },
      });
    }

    const conflictingEvents = await fetchOverlappingEvents(
      client,
      start_date_time as string,
      end_date_time as string,
      excludeEventId as string,
    );

    return res.json({
      status: "success",
      data: {
        hasOverlap: conflictingEvents.length > 0,
        conflictingEvents,
      },
    });
  } catch (error) {
    console.error("Check Overlap Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to check overlap" });
  } finally {
    client.release();
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { name, description, start_date_time, end_date_time, categoryIds } =
      createEventSchema.parse(req.body);

    await client.query("BEGIN");

    const catCheck = await client.query(
      "SELECT id FROM categories WHERE id = ANY($1)",
      [categoryIds],
    );

    if (catCheck.rows.length !== categoryIds.length) {
      throw new Error("INVALID_CATEGORY_IDS");
    }

    const overlap = await hasEventOverlap(
      client,
      start_date_time,
      end_date_time,
    );

    if (overlap) {
      throw new Error("EVENT_OVERLAP");
    }

    const insertResult = await client.query(
      `
        INSERT INTO events (name, description, start_date_time, end_date_time)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [name, description, start_date_time, end_date_time],
    );

    const newEventId = insertResult.rows[0].id;

    if (categoryIds.length > 0) {
      const values = categoryIds.map((_, i) => `($1, $${i + 2})`).join(", ");

      await client.query(
        `INSERT INTO event_categories (event_id, category_id) VALUES ${values}`,
        [newEventId, ...categoryIds],
      );
    }

    await client.query("COMMIT");

    const event = await getEventWithCategories(client, newEventId);

    return res.status(201).json({
      status: "success",
      message: "Event created",
      data: event,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        data: error.issues,
      });
    }

    if (error.message === "INVALID_CATEGORY_IDS") {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid category IDs provided" });
    }

    if (error.message === "EVENT_OVERLAP") {
      return res.status(400).json({
        status: "error",
        message: "Time slot overlaps with existing event",
      });
    }

    console.error("Create Event Error:", error);

    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id: eventId } = idParamSchema.parse(req.params);
    const { name, description, start_date_time, end_date_time, categoryIds } =
      createEventSchema.parse(req.body);

    await client.query("BEGIN");

    const exists = await client.query("SELECT id FROM events WHERE id = $1", [
      eventId,
    ]);

    if ((exists.rowCount ?? 0) === 0) {
      throw new Error("EVENT_NOT_FOUND");
    }

    const catCheck = await client.query(
      "SELECT id FROM categories WHERE id = ANY($1)",
      [categoryIds],
    );

    if (catCheck.rows.length !== categoryIds.length) {
      throw new Error("INVALID_CATEGORY_IDS");
    }

    const overlap = await hasEventOverlap(
      client,
      start_date_time,
      end_date_time,
      eventId,
    );

    if (overlap) {
      throw new Error("EVENT_OVERLAP");
    }

    await client.query(
      `
        UPDATE events
        SET name = $1,
            description = $2,
            start_date_time = $3,
            end_date_time = $4
        WHERE id = $5
      `,
      [name, description, start_date_time, end_date_time, eventId],
    );

    await client.query("DELETE FROM event_categories WHERE event_id = $1", [
      eventId,
    ]);

    if (categoryIds.length > 0) {
      const values = categoryIds.map((_, i) => `($1, $${i + 2})`).join(", ");

      await client.query(
        `INSERT INTO event_categories (event_id, category_id) VALUES ${values}`,
        [eventId, ...categoryIds],
      );
    }

    await client.query("COMMIT");

    const updated = await getEventWithCategories(client, eventId);

    return res.json({
      status: "success",
      message: "Event updated",
      data: updated,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        data: error.issues,
      });
    }

    if (error.message === "EVENT_NOT_FOUND") {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }

    if (error.message === "INVALID_CATEGORY_IDS") {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid category IDs provided" });
    }

    if (error.message === "EVENT_OVERLAP") {
      return res.status(400).json({
        status: "error",
        message: "Time slot overlaps with existing event",
      });
    }

    console.error("Update Event Error:", error);

    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export const getEvents = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { limit, offset, categoryIds } = getEventsSchema.parse(req.query);

    const filterCategoryIds =
      categoryIds && categoryIds.length > 0 ? categoryIds : null;

    const whereClause = `
      WHERE 
        ($1::uuid[] IS NULL OR EXISTS (
          SELECT 1
          FROM event_categories sub
          WHERE sub.event_id = e.id
            AND sub.category_id = ANY($1)
        ))
    `;

    const dataQuery = `
      SELECT 
        e.id,
        e.name,
        e.description,
        e.start_date_time,
        e.end_date_time,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.name)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories
      FROM events e
      LEFT JOIN event_categories ec ON e.id = ec.event_id
      LEFT JOIN categories c ON ec.category_id = c.id
      ${whereClause}
      GROUP BY e.id
      ORDER BY e.start_date_time ASC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM events e
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      client.query(dataQuery, [filterCategoryIds, limit, offset]),
      client.query(countQuery, [filterCategoryIds]),
    ]);

    const total = parseInt(countResult.rows[0].total || "0", 10);

    return res.json({
      status: "success",
      data: {
        events: dataResult.rows,
        pagination: {
          total,
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Invalid query parameters",
        data: error.issues,
      });
    }

    console.error("Get Events Error:", error);

    return res
      .status(500)
      .json({ status: "error", message: "Something went wrong" });
  } finally {
    client.release();
  }
};

export const getEventById = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = idParamSchema.parse(req.params);

    const event = await getEventWithCategories(client, id);

    if (!event) {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }

    return res.json({ status: "success", data: event });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Invalid event id",
        data: error.issues,
      });
    }

    console.error("Get Event By Id Error:", error);

    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const result = await pool.query("DELETE FROM events WHERE id = $1", [id]);

    if ((result.rowCount ?? 0) === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }

    return res.json({ status: "success", message: "Event deleted" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Invalid event id",
        data: error.issues,
      });
    }

    console.error("Delete Event Error:", error);

    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};
