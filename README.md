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

- Copy .env.example to .env
- Update with PostgreSQL connection:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
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

<!-- ## Project Structure

```
EventManagementSys/
├── be/                     # Backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── modules/        # Feature modules (events, categories)
│   │   └── scripts/        # Migration and seed scripts
│   ├── schema.sql          # Database schema
│   └── docker-compose.yml  # PostgreSQL container
│
└── fe/                     # Frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── services/       # API client
    │   └── hooks/          # Custom hooks
    └── index.html
``` -->

## Troubleshooting

**Database connection error:**
- Make sure Docker is running: `docker ps`
- Restart the container: `docker-compose down && docker-compose up -d`

**Port already in use:**
- Backend: Change PORT in `.env`
- Frontend: Vite will automatically use next available port

**Tables don't exist:**
- Run `npm run migrate` in the backend folder
