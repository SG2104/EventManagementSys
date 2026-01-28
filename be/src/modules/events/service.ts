import { PoolClient } from "pg";

export const fetchOverlappingEvents = async (
  client: PoolClient,
  start: string,
  end: string,
  excludeEventId?: string
) => {
  const params: string[] = [start, end];

  let query = `
    SELECT id, name, start_date_time, end_date_time
    FROM events
    WHERE start_date_time < $2
      AND end_date_time > $1
  `;

  if (excludeEventId) {
    params.push(excludeEventId);
    query += ` AND id != $${params.length}`;
  }

  query += ` ORDER BY start_date_time ASC`;

  const { rows } = await client.query(query, params);
  return rows;
};

export const hasEventOverlap = async (
  client: PoolClient,
  start: string,
  end: string,
  excludeEventId?: string
): Promise<boolean> => {
  const params: string[] = [start, end];

  let query = `
    SELECT 1
    FROM events
    WHERE start_date_time < $2
      AND end_date_time > $1
  `;

  if (excludeEventId) {
    params.push(excludeEventId);
    query += ` AND id != $${params.length}`;
  }

  query += ` LIMIT 1`;

  const result = await client.query(query, params);

  return (result.rowCount ?? 0) > 0;
};

export const getEventWithCategories = async (client: PoolClient, eventId: string) => {
    const eventQuery = `
        SELECT e.id, e.name, e.description, e.start_date_time, e.end_date_time
        FROM events e
        WHERE e.id = $1
    `;
    const eventResult = await client.query(eventQuery, [eventId]);

    if (eventResult.rows.length === 0) {
        return null;
    }

    const categoriesQuery = `
        SELECT c.id, c.name
        FROM categories c
        INNER JOIN event_categories ec ON ec.category_id = c.id
        WHERE ec.event_id = $1
    `;
    const categoriesResult = await client.query(categoriesQuery, [eventId]);

    return {
        ...eventResult.rows[0],
        categories: categoriesResult.rows
    };
};
