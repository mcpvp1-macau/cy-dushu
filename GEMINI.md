# GEMINI.md

## Project Overview

This project is a sophisticated front-end application named "ja-dushu-front". It appears to be a command and control system for managing unmanned aerial vehicles (UAVs), and potentially other unmanned equipment. The application provides a rich user interface with features for real-time monitoring and control, including a map-based situational awareness view, video feeds, and detailed device management capabilities.

The project is built on a modern technology stack that includes:

- **Framework:** React v18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with Ant Design for UI components
- **State Management:** Zustand
- ## **Geospatial/Mapping:**
  - MapboxCesium
  - Three.js
- **Routing:** React Router v6
- **Data Fetching:** TanStack Query (React Query)
- **Real-time Communication:** WebSockets (likely via `react-use-websocket`)

## Building and Running

### Prerequisites

- Node.js and pnpm
- Docker (for building and pushing images)

### Development

To run the application in a development environment, use the following command:

```bash
pnpm dev
```

There are also several other `dev` scripts available in `package.json` (e.g., `pnpm dev:82`, `pnpm dev:47`) which likely connect to different backend environments.

### Building for Production

To create a production build of the application, run:

```bash
pnpm build
```

This will compile the TypeScript code, and bundle the assets for deployment.

### Linting

To check the code for any linting errors, use:

```bash
pnpm lint
```

### Type Checking

To perform a static type check with TypeScript, run:

```bash
pnpm ts
```

## Development Conventions

- **Component-Based Architecture:** The application is structured around a modular, component-based architecture. Components are organized by feature and/or route.
- **Styling:** The project uses a combination of Tailwind CSS for utility-first styling and Ant Design for pre-built UI components.
- **State Management:** Global state is managed using Zustand, with a context-based approach for providing stores to different parts of the component tree.
- **Routing:** The application uses `react-router-dom` for declarative, file-system-based routing.
- **Asynchronous Operations:** `TanStack Query` is used for managing asynchronous operations like data fetching, caching, and synchronization.
- **Code Quality:** The project enforces code quality through ESLint and TypeScript.
- **Git:** Git commit message is in Chinese.
