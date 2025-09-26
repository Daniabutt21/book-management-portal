# book-management-portal

Full-stack Book Management Portal built with Next.js, NestJS, Prisma, and SQLite. Features authentication, role-based access, book CRUD operations, feedback system, API docs, and testing.

## Tech Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **Prisma** - Modern database ORM
- **SQLite** - Lightweight database (development)
- **TypeScript** - Type safety
- **Prettier** - Code formatting

### Frontend

- **Next.js** - React framework
- **Material UI** - Component library
- **React Query** - Data fetching
- **React Hook Form + Zod** - Form handling

### DevOps

- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline

## Project Structure

```
book-management-portal/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── main.ts         # Application entry point
│   │   └── app.module.ts   # Main application module
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── dev.db         # SQLite database
│   │   ├── migrations/    # Database migrations
│   │   └── seed.ts        # Database seeding
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # Next.js app
├── package.json           # Root package.json
└── README.md
```

## Database Schema

### Models

- **User** - User accounts with role-based access
- **Role** - User roles (USER, ADMIN)

### Key Features

- Role-based access control with foreign key relationships
- Audit trails with timestamps
- Clean migration history
- Seeded with default roles

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd book-management-portal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**

   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. **Start backend server**
   ```bash
   cd backend
   npm run start:dev
   ```

The backend will be available at `http://localhost:3001`

## Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend (planned)
- `npm run format` - Format code with Prettier

### Backend

- `npm run start:dev` - Start in development mode
- `npm run build` - Build for production
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with initial data
- `npm run prisma:studio` - Open Prisma Studio
- `npm run test` - Run all tests (unit + integration)

**Database:**

- Ensure SQLite file exists: `ls backend/prisma/dev.db`
- Run migrations: `npm run prisma:migrate`

**Port:**

- Backend runs on port 3001
- Prisma Studio runs on port 5555

**Environment variables:**

- Copy `env.example` to `.env`
- Update values as needed

## Testing

### Test Structure

The project follows NestJS testing best practices with co-located tests:

```
backend/src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── __tests__/
│       ├── auth.service.spec.ts        # Unit tests
│       └── auth.integration.spec.ts    # Integration tests
```

### Test Types

- **Unit Tests** (`.spec.ts`) - Test services/controllers in isolation with mocked dependencies
- **Integration Tests** (`.integration.spec.ts`) - Test component interactions with real database

### Running Tests

```bash
# Run all tests (unit + integration)
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

## License

This project is licensed under the MIT License.
