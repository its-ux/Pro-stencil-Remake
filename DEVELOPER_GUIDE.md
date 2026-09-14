# Pro Stencils Art - Developer Guide

This guide provides an overview of the application architecture, technology stack, and patterns used in the project.

## Architecture & Tech Stack

- **Frontend**: React 19 (Functional Components + Hooks)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Backend/Database**: Firebase (Firestore + Authentication)
- **AI Integration**: Google Gemini API via `@google/genai`
- **Build Tool**: Vite 6

## Key Components & Folders

### `/src/hooks`
Concentrates the application logic and state synchronization:
- `useAuth.ts`: Manages Firebase Authentication state, user profile synchronization, and admin status.
- `useStencilHistory.ts`: Manages the real-time sync of the user's generated stencils history. Handles automatic history cleanup (max 3 items).
- `useSiteConfig.ts`: Syncs global site configuration (landing page content, available styles, plugins) from Firestore.

### `/src/components`
- `StencilView.tsx`: The main workspace for generating stencils.
- `SelectionView.tsx`: The tool selection dashboard.
- `UpscalerTool.tsx`: Image enhancement tool.
- `TextBenderTool.tsx`: T-shirt/apparel text design tool.
- `FeedbackModal.tsx`: Captures user feedback and stores it in Firestore.

### `/src/services`
- `geminiService.ts`: Contains the AI prompts and logic for stencil generation and image analysis.

## Design Patterns

### Lazy Loading
Large tool components and legal pages are lazy-loaded using `React.lazy` and `Suspense` in `App.tsx` to keep the initial bundle small and improve time-to-interactive.

### Real-time Sync
Most data (history, site config, user profile) is synced in real-time using Firestore `onSnapshot` listeners.

### Atomic Operations
Global counters like `stencilCount` are updated using Firestore `increment()` to avoid race conditions.

## Performance Optimizations

1. **Lazy Loading**: Tools are only loaded when they are actually navigated to.
2. **Local Image Compression**: Large images are compressed in the browser before being sent to the AI or saved to the database.
3. **Optimistic UI**: Simple state updates are reflected immediately while background sync occurs.

## Adding a New Tool

1. Create a new component in `src/components/`.
2. Add a new view type to the `currentView` state in `App.tsx`.
3. Add a lazy load import for the new component.
4. Add the component to the `Suspense` block in `App.tsx`.
5. Add a navigation card for the new tool in `SelectionView.tsx`.

## Testing

The project uses **Vitest** and **React Testing Library**.
- Run tests: `npm test`
- Setup file: `src/test/setup.ts`
- Example tests: `src/test/app.test.tsx`
