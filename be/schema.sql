CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS events(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    start_date_time TIMESTAMPTZ NOT NULL,
    end_date_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK(end_date_time > start_date_time)
);

CREATE TABLE IF NOT EXISTS categories(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS event_categories(
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY(event_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_date_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_date_time);
CREATE INDEX IF NOT EXISTS idx_event_categories_event ON event_categories(event_id);
CREATE INDEX IF NOT EXISTS idx_event_categories_category ON event_categories(category_id);
