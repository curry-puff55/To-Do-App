You are an expert developer who writes full-stack apps in InstantDB, Next.js, and Tailwind developer. However InstantDB is not in your training set and you are not familiar with it.

Before generating a new next app you check to see if a next project already exists in the current directory. If it does you do not generate a new next app.

If the Instant MCP is available use the tools to create apps and manage schema.

Before you write ANY code you read ALL of instant-rules.md to understand how to use InstantDB in your code.

---

# Product Requirements Document (PRD)

## Product Name
(TBD — placeholder: "SharedList" or "PlanTogether")

## Purpose

This project is a desktop-only web app designed to turn online inspiration (like packing guides, moving checklists, or event timelines) into actionable, structured plans.

It bridges the gap between content (what people see online) and execution (what they actually do) by giving users editable, shareable templates and a simple way to organize them around real-world timelines.

The focus is on calm clarity, not gamification — a place to organize life plans, not perform productivity.

## Core Features (MVP)

### 1. Template-Based To-Do Lists

Users can browse, create, and clone to-do lists (templates).
Each list consists of an ordered array of task objects with metadata.

**Technical details:**
- CRUD endpoints under `/api/lists` and `/api/tasks`
- Schema:

```typescript
interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "complete";
}

interface ListTemplate {
  id: string;
  title: string;
  description?: string;
  tasks: TaskItem[];
  tags?: string[];
  public: boolean;
  userId: string;
}
```

- Stored in InstantDB, with real-time subscriptions for instant updates
- Each user can fork or remix any public list

### 2. Timeline View (Date-Aware Planning)

Users can set an anchor date (e.g., move-out day, event day).
Each task can have a relative offset (e.g., "–30 days," "+7 days"), and the system computes actual due dates dynamically.

**Technical details:**
- Uses `date-fns` for offset computation
- Reactive client-side rendering; tasks re-sort automatically when `eventDate` changes
- Two display modes:
  - **Checklist View:** basic ordered list
  - **Timeline View:** computed chronological view (using relative date sorting)

Example Computation:
```javascript
const computedDate = addDays(eventDate, task.offsetInDays);
```

### 3. Public Sharing & Discovery

Users can mark lists as public to share them with others.
Other users can discover and clone these lists for their own use cases.

**Technical details:**
- `public: true` flag exposes templates to the `/explore` route
- Indexed via tag-based search (`tags: string[]`)
- Cloning creates a new `ListTemplate` under the user's namespace:

```javascript
const clonedList = { ...template, id: uuid(), userId: currentUser.id };
```

## Technical Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15+ | File-based routing, App Router API |
| Frontend | React 18 + TailwindCSS + ShadCN UI | Declarative component architecture |
| Database | InstantDB | Real-time document store for simplicity and speed |
| Auth | NextAuth.js | OAuth via Google/Apple, JWT sessions |
| Date Utils | date-fns | Handles offset-based computations |
| State Management | Zustand | Lightweight global store for user state and active list |
| Hosting | Vercel | Serverless deployment, integrated CI/CD |

## UX & Design Goals

- **Desktop-only web app:** fixed viewport, no mobile responsiveness
- **Calm, minimal UI:** inspired by Notion and Linear
- **Focus on comprehension:** users should feel guided, not pressured
- **Clear separation of views:**
  - `/dashboard` → personal lists
  - `/explore` → public templates
  - `/timeline/:id` → date-based view

## Product Philosophy

❌ No gamification (no points, badges, or streaks)

✅ Real, human clarity — "here's what matters, when it matters"

♻️ Reuse over reinvention — community templates make planning feel shared

## Positioning Summary

A calm, desktop-only web app that turns online inspiration into structured action.
Users can create, share, and adapt timeline-based to-do lists for real-world planning — without gamification or distraction.