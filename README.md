# Event Management System

A full-stack event management application with React frontend and Node.js/Express backend.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Validation**: Zod

## Prerequisites

- [Node.js] (v18 or higher)
- [PostgreSQL] (v15 or higher)
- [Docker]
- npm or yarn package

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SG2104/EventManagementSys
cd EventManagementSys
```

### 2. Set Up the Database

Navigate to the backend folder and start PostgreSQL using Docker:

```bash
cd be
docker-compose up -d
```

This starts a PostgreSQL container with:
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: postgres

### 3. Configure Environment Variables

In the backend folder (`be`), copy `.env.example` to `.env`:

The `.env.example` contains:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
``` 

### 4. Install Dependencies

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd be
npm install
```

**Terminal 2 - Frontend:**
```bash
cd fe
npm install
```

### 5. Run Database Migrations

In the backend terminal, run:

```bash
npm run migrate
```

This executes the `schema.sql` file which creates the required tables:
- `events` - Stores event details (name, description, dates)
- `categories` - Stores category names
- `event_categories` - Links events to their categories

### 6. Seed the Database (Optional)

To add sample categories:

```bash
npm run seed
```

### 7. Start the Servers

**Terminal 1 - Start Backend (runs on port 8000):**
```bash
cd be
npm run dev
```

**Terminal 2 - Start Frontend (runs on port 3000):**
```bash
cd fe
npm run dev
```

### 8. Open the Application

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Backend (`/be`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed categories data |

### Frontend (`/fe`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/get` | Get all events (with pagination) |
| GET | `/events/get/:id` | Get event by ID |
| POST | `/events/create` | Create new event |
| PATCH | `/events/update/:id` | Update event |
| DELETE | `/events/delete/:id` | Delete event |
| GET | `/events/check-overlap` | Check for time conflicts |
| GET | `/categories/get` | Get all categories |


## Troubleshooting

**Database connection error:**
- Make sure Docker is running: `docker ps`
- Restart the container: `docker-compose down && docker-compose up -d`

**Port already in use:**
- Backend: Change PORT in `.env`
- Frontend: Vite will automatically use next available port

**Tables don't exist:**
- Run `npm run migrate` in the backend folder


## Areas of Focus

### 1. Event CRUD with Transactions
- Implemented full event CRUD.
- Used PostgreSQL transactions to safely create/update events with multiple categories and avoid partial writes.

### 2. Many-to-Many Relationships
- Designed `event_categories` junction table.
- Managed category mappings in a single transaction.
- Fetched events with categories using joins and aggregation.

### 3. Pagination & Filtering
- Added server-side pagination using `LIMIT` and `OFFSET`.
- Implemented category-based filtering with dynamic SQL.
- Returned `total` and `hasMore` for frontend pagination.

### 4. Form Handling (Create/Edit)
- Built a reusable form supporting create and edit modes.
- Pre-populated fields during edit and handled reset/cancel cleanly.

### 5. UI & UX
- Built responsive event cards with Tailwind CSS.
- Added edit/delete actions, confirmation modal, and toast notifications.

---

## Problems Solved

### 1. Event Time Overlap Prevention
- Implemented event overlap checks at the service layer.
- Added a validation endpoint `/events/check-overlap` to detect conflicts before creation.
- Blocked overlapping events with clear error responses.

### 2. Category Validation
- Verified all category IDs before event creation.
- Rejected invalid requests with a clear validation message.

### 3. Database Schema Migration System
- Created `migrate.ts` script that reads and executes `schema.sql`.
- Added seeding for initial category data.
- Enabled repeatable database setup via npm scripts.

### 4. Cascading Deletes for Data Integrity
- Configured cascading deletes on junction tables.
- Automatically cleaned up category mappings when events are removed.

---

## Trade-offs Made

### 1. Junction Table vs PostgreSQL Array for Categories
- **Decision:** Used a junction table (`event_categories`) instead of storing category IDs as an array.
- **Reason:** Maintains normalization, supports foreign keys with cascading deletes, and enables efficient JOIN-based filtering.
- **Trade-off:** Slightly more complex queries, but stronger data integrity and scalability.

---

### 2. In-Memory Cache vs No Caching
- **Decision:** Implemented simple in-memory caching for categories.
- **Reason:** Categories change infrequently, so caching reduces repeated database queries.
- **Trade-off:** Cache is not shared across instances, but sufficient for a single-server setup.

---

### 3. Synchronous Overlap Check vs Separate Validation Endpoint
- **Decision:** Validated event time conflicts synchronously during create/update.
- **Reason:** Ensures atomic operations and prevents race conditions.
- **Trade-off:** Slightly increased request latency, but guarantees data consistency.

---

## Weakest Parts & Improvements

### 1. No Authentication/Authorization
- **Weakness:** Any user can create, edit, or delete any event. No user ownership or access control.
- **Improvement:** Add JWT-based authentication, user registration/login. Implement role-based access control (admin vs regular user).

### 2. Missing Rate Limiting & Validation
- **Weakness:** No rate limiting or request-level validation beyond parameterized queries.
- **Improvement:** Add rate limiting, request validation middleware, and basic security logging.


### 3. No Unit/Integration Tests
- **Weakness:** No test coverage for API endpoints or frontend components.
- **Improvement:** Add Jest + Supertest for backend API testing, React Testing Library for frontend.

---

## Time Spent
Approximately **6–7 hours** to build and integrate both the backend API and frontend application, including implementing real-time overlap detection and ensuring end-to-end functionality.

---

## Libraries & Tools Used

### Backend
- Express – Lightweight framework for building REST APIs
- pg (node-postgres) – PostgreSQL client for running raw SQL queries
- Zod – Schema-based request validation with TypeScript support
- dotenv – Loads environment variables from `.env`
- cors – Enables frontend–backend cross-origin requests
- TypeScript – Adds static type checking
- ts-node – Runs TypeScript files directly (used for scripts)
- nodemon – Auto-restarts server during development
- @types/* – Type definitions for Node.js libraries

### Frontend
- React – Component-based UI library
- Axios – Promise-based HTTP client
- Vite – Fast development server and build tool
- TypeScript – Type safety in frontend code
- Tailwind CSS – Utility-first CSS framework
- @tailwindcss/postcss – Tailwind v4 PostCSS integration

### Infrastructure
- Docker Compose – Local database setup with one command
- PostgreSQL 15 – Relational database with strong type support

---

## Code Attribution
- No code was copied from external sources.
- Used standard npm packages (Express, pg, Zod, React, TailwindCSS, etc.).
- AI assistance used for TailwindCSS styling and form setup boilerplate.

---

## Scalability Considerations

1. **Database Connection Pooling**
   - Used `pg.Pool` instead of single connections.
   - Pool manages multiple concurrent database connections.
   - Connections are reused, reducing overhead.

2. **Database Indexing**
   - Added indexes on event time and junction table columns.
   - Improved query performance for filtering, joins, and overlap checks.

3. **Server-Side Pagination**
   - Used `LIMIT` and `OFFSET`.
   - Fetched only required records per request.
   - Reduced memory usage and response payload size.

4. **In-Memory Caching for Static Data**
   - Cached category data in memory.
   - Reduced repeated queries for rarely changing data.

5. **Stateless API Design**
   - No server-side sessions stored.
   - Enabled horizontal scaling with multiple instances.

6. **Efficient Query Design**
   - Used single queries with JOINs instead of N+1 queries.
   - Fetched events and categories in single queries.

7. **Separation of Concerns (Modular Architecture)**
   - Separated routes, controllers, and services by feature.
   - Improved maintainability and scalability.

8. **Transaction Management**
   - Used `BEGIN`, `COMMIT`, `ROLLBACK` for atomic operations.
   - Prevented partial writes under concurrent requests.

9. **Cascading Deletes at Database Level**
   - Used `ON DELETE CASCADE`.
   - Ensured automatic cleanup of related records.

---

## UI / UX Design Approach

Focused on creating a dark-themed, modern interface using a slate color palette with TailwindCSS.

**Key decisions:**
- Visual hierarchy with clear headings and accent colors:
  - Sky blue for actions
  - Emerald for filters
  - Rose for errors
- Component isolation with reusable components:
  - `EventModal`
  - `CategoryFilter`
  - `Pagination`
  - `EventCards`
- Responsive grid-based layout
- Form UX:
  - Toggle-button category selection
  - Inline validation
  - Conflict preview before submission

---

## Database Schema

### events
- `id` – UUID (Primary Key)
- `name` – TEXT
- `description` – TEXT
- `start_date_time` – TIMESTAMPTZ
- `end_date_time` – TIMESTAMPTZ
- `created_at` – TIMESTAMPTZ

### categories
- `id` – UUID (Primary Key)
- `name` – TEXT (Unique)

### event_categories
- `event_id` – UUID (Foreign Key → events)
- `category_id` – UUID (Foreign Key → categories)
- **Primary Key:** (`event_id`, `category_id`)

