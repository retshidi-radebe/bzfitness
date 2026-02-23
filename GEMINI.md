# Project Overview

This is a Next.js 16 web application for a fitness and wellness business called BZ Fitness. It serves as a promotional website and a management tool for the business.

**Key Technologies:**

*   **Framework:** Next.js 16
*   **Language:** TypeScript 5
*   **Styling:** Tailwind CSS 4, shadcn/ui
*   **Database:** SQLite with Prisma ORM
*   **Authentication:** NextAuth.js
*   **State Management:** Zustand, TanStack Query
*   **Form Handling:** React Hook Form, Zod

**Architecture:**

The project follows a standard Next.js App Router structure.

*   `src/app`: Contains the pages and API routes.
*   `src/components`: Contains reusable React components.
*   `src/lib`: Contains utility functions and configurations.
*   `prisma`: Contains the database schema and client.
*   `public`: Contains static assets.

# Building and Running

*   **Install dependencies:**
    ```bash
    bun install
    ```

*   **Run the development server:**
    ```bash
    bun run dev
    ```

*   **Build the project:**
    ```bash
    bun run build
    ```

*   **Start the production server:**
    ```bash
    bun start
    ```

*   **Database commands:**
    ```bash
    # Apply schema changes to the database
    bun run db:push

    # Generate Prisma client
    bun run db:generate

    # Create and apply a new migration
    bun run db:migrate

    # Reset the database
    bun run db:reset
    ```

# Development Conventions

*   **Coding Style:** The project uses ESLint to enforce a consistent coding style.
*   **Testing:** There are no explicit testing practices found in the project.
*   **Commits:** There are no commit message conventions found in the project.
