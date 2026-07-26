# SupplyFlow

SupplyFlow is a multi-tenant SaaS platform for **Inventory Management**, **Warehouse Operations**, and **AI-assisted Procurement**.

It helps companies monitor inventory in real time and automatically assists procurement teams using **Retrieval-Augmented Generation (RAG)** over supplier contracts.

SupplyFlow is **not** an ERP replacement. It is a focused **Procurement Intelligence Platform** that sits alongside existing inventory/warehouse systems and turns inventory events into actionable, AI-backed purchasing decisions.

## Core Idea

Inventory events trigger AI-powered procurement recommendations. The MVP is intentionally scoped around a single end-to-end business workflow rather than broad ERP-style feature coverage.

## The Core Workflow

```
Inventory decreases
        ↓
Inventory falls below safety threshold
        ↓
System generates a Low Stock event
        ↓
Real-time notification appears
        ↓
Procurement manager reviews inventory
        ↓
AI searches supplier contracts using RAG
        ↓
AI recommends the best supplier
        ↓
Purchase Order draft is generated
        ↓
Manager reviews and approves
        ↓
Purchase Order stored
```

Every feature in the MVP exists to support this single loop: **stock drops → event fires → AI recommends a supplier from contract data → a PO gets drafted and approved.**

## Key Concepts

- **Multi-tenant** — the platform serves multiple companies, each with isolated data.
- **Low Stock Event** — triggered automatically when inventory falls below a configured safety threshold.
- **Real-time Notifications** — procurement managers are alerted as soon as a low stock event occurs.
- **RAG over Supplier Contracts** — supplier contracts are indexed so the AI can ground its supplier recommendations in actual contract terms (pricing, lead times, minimums, etc.) rather than guessing.
- **AI Supplier Recommendation** — given a low stock event, the AI proposes the best-fit supplier based on retrieved contract context.
- **Purchase Order (PO) Draft** — the AI-recommended supplier and item details are assembled into a draft PO for human review.
- **Human-in-the-loop Approval** — a manager reviews and approves the draft before it becomes a stored, official Purchase Order.

## Multi-Tenancy & Data Isolation

- Each company using SupplyFlow is an **Organization**.
- Organizations have **Users**.
- Every **Product**, **Supplier**, **Purchase Order**, and **Document** belongs to exactly one Organization.
- Organization data is completely isolated — users can never access another organization's data.

## Authentication

- Authentication uses **JWT**.
- Each JWT contains:
  - `userId`
  - `organizationId`
  - `role`

## MVP Scope

**In scope**

- Authentication (login)
- Organization creation
- Inventory CRUD
- Supplier CRUD
- Document upload
- Real-time inventory updates
- Low stock notifications
- Activity feed
- Purchase Order generation
- RAG over supplier contracts
- Dashboard

**Out of scope**

- Billing
- Payments
- Email sending
- External vendor APIs
- Manufacturing module
- Finance module
- HR module

## Tech Stack

**Frontend**

- Next.js
- TypeScript
- TailwindCSS
- Shadcn UI
- TanStack Query
- Zustand
- Socket.IO Client

**Backend**

- Fastify
- TypeScript
- Prisma
- PostgreSQL
- Socket.IO
- JWT
- Zod
- Pino

**AI**

- LangChain
- LangGraph
- Gemini
- pgvector

**Infrastructure**

- Docker Compose
- Redis (later)

## AI Philosophy

- AI should **not** make business decisions.
- The backend determines the recommended supplier using **structured business rules**.
- The LLM **explains** the recommendation using supplier contracts.
- RAG exists to retrieve contract clauses, summarize information, and draft purchase orders.
- Business logic remains **deterministic**.

## Coding Standards

- Always use TypeScript.
- Never use `any`.
- Prefer composition.
- Avoid duplicated code.
- Write readable code.
- Document complex logic.
- Keep files under a reasonable size.
- Prefer many small modules over one large file.

## Project Status

This project is in the **MVP planning stage**. Scope is deliberately limited to the single workflow above, built to production-quality standards rather than as a broad feature set.

## Repository Structure

```
SupplyFlow/
├── backend/    # API and business logic (inventory, events, RAG, procurement)
├── frontend/   # Web application for procurement managers and warehouse staff
└── docs/       # Design and product documentation
```

## Getting Started

### Option 1: Docker Compose (recommended)

Runs Postgres (with `pgvector`), the backend, and the frontend together, with hot reload on both services.

```bash
cp .env.example .env
docker compose up
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

On first run, apply the Prisma schema against the containerized database:

```bash
docker compose exec backend npx prisma migrate dev
```

### Option 2: Run services locally

Requires a local PostgreSQL instance with the `pgvector` extension available.

```bash
# Backend
cd backend
cp .env.example .env   # point DATABASE_URL at your local Postgres
npm install
npx prisma migrate dev
npm run dev             # http://localhost:4000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:3000
```

## License

TBD
