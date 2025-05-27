# Print Management Interface

This is a modern web application for managing MQTT connections and printer jobs, built with React, TypeScript, Vite, and Tailwind CSS for the Freemelt ONE printer.  
It features an interactive sidebar for managing MQTT connections, real-time message handling, and a tabbed interface for switching between client and controller views.

## Features

- **MQTT Broker Management:**  
  Connect to, subscribe, and manage multiple MQTT brokers. View connection status and handle subscriptions dynamically.

- **Real-Time Messaging:**  
  Receive, store, and display incoming MQTT messages in real-time.  
  Filter messages by topic, and interact with message logs.

- **Printer Job Overview:**  
  Manage and monitor printer jobs via MQTT topics.  
  Switch between client and controller tabs for distinct views.

- **Modern UI:**  
  Built with React, Vite, and Tailwind CSS.  
  Uses shadcn/ui and Radix UI for accessible and flexible components.  
  Styled with the "new-york" theme.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for development and build
- **Tailwind CSS** for styling
- **Radix UI** and **shadcn/ui** for UI components
- **Jotai** for state management
- **MQTT.js** for MQTT connectivity
- **Zod** for schema validation
- **Lucide** for icons

## Project Structure

```
src/
  App.tsx              # Main application logic (MQTT handling, tabs, sidebar)
  components/          # Reusable React components, e.g. MQTT sidebar, printer jobs overview
  hooks/               # Custom React hooks (e.g., use-mqtt-client)
  lib/                 # Utility functions, state atoms, MQTT helpers
  ui/                  # UI primitives and design system components
  index.css            # Tailwind and global styles
  main.tsx             # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (for package management)
- MQTT brokers for testing (local or remote)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```
The app will be available at `http://localhost:5173` by default.

### Build

```bash
pnpm build
```

### Linting & Type Checking

```bash
pnpm lint         # Run ESLint
pnpm check-types  # Run TypeScript type checks
```

## Configuration

- Copy `.env.example` to `.env` and fill in environment variables as needed.
- Tailwind CSS is configured via `src/index.css`.
- UI theme and component aliases are managed in `components.json`.

## Scripts

Common scripts from `package.json`:
- `dev` – Start development server
- `build` – Build for production
- `lint` – Lint the codebase
- `test` – Run tests
- `check-types` – TypeScript type checks
- `preview` – Preview built app

## License

This project is for educational and research purposes.
