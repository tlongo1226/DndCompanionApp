# D&D Companion Application

A dynamic web application designed to help Dungeon Masters and players manage their D&D campaigns with comprehensive digital tools for world-building and campaign management.

## Features

- User authentication and account management
- Campaign entity management (NPCs, locations, organizations)
- Relationship tracking between entities
- Campaign journal system
- Customizable theme settings
- Responsive design for various screen sizes

## Application Architecture

### Frontend (React + TypeScript)

The frontend is built with React and TypeScript, utilizing modern patterns and practices:

- **State Management**: Uses TanStack Query (React Query) for server state management
- **Routing**: Uses Wouter for lightweight client-side routing
- **Forms**: Leverages React Hook Form with Zod validation
- **UI Components**: Built on shadcn/ui component library with Tailwind CSS

### Backend (Express + TypeScript)

The backend is built with Express.js and TypeScript:

- **Storage**: Uses in-memory storage with a flexible interface that can be extended for database integration
- **Authentication**: Implements Passport.js with local strategy
- **Session Management**: Uses Express session with memory store
- **API Routes**: RESTful endpoints for entities and journals

## Authentication Flow

1. User registers/logs in through the `/auth` page
2. Credentials are validated against the storage system
3. Session is created and maintained using Express session
4. Protected routes check authentication status before rendering
5. Auth context (`useAuth` hook) provides authentication state throughout the app

## Data Models

### User
- Username and password
- Created timestamp
- Manages own entities and journals

### Entity
- Types: NPC, Creature, Location, Organization
- Properties specific to each type
- Relationships with other entities
- Tags for organization

### Journal
- Title and content
- Associated tags
- Linked to specific user
- Timestamps for creation

## Component Structure

### Core Components
- `AuthProvider`: Manages authentication state
- `ProtectedRoute`: Route wrapper for authentication
- `Header`: Navigation and user controls

### Pages
- `AuthPage`: Login/Registration
- `Home`: Dashboard view
- `EntityPage`: Entity creation/editing
- `CategoryView`: List view for entity types
- `EntityView`: Detailed entity view
- `AccountSettings`: User preferences

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and setup
│   │   └── pages/         # Page components
├── server/
│   ├── auth.ts           # Authentication setup
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage implementation
└── shared/
    └── schema.ts         # Shared types and schemas
```

## Key Technologies

- React 18
- TypeScript
- Express.js
- TanStack Query
- Wouter
- shadcn/ui
- Tailwind CSS
- Zod
- React Hook Form
- Passport.js
