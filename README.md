# Job Scheduler

A production-grade background job scheduler built with NestJS, Prisma, and PostgreSQL.

## Features

- **Priority Queue** — Min-heap ordering by priority, scheduled time, and creation time
- **DAG Workflows** — Jobs can depend on other jobs; a job only runs when all dependencies complete
- **Timing Wheel** — Alternative scheduling algorithm for future/recurring jobs
- **Retries with Backoff** — Up to 3 retries with exponential backoff and jitter
- **Dead Letter Queue** — Failed jobs land here for inspection and manual retry
- **Recurring Jobs** — Jobs auto-reschedule after completion
- **Starvation Prevention** — Aging boosts effective priority of waiting jobs
- **SSE Live Updates** — UI reflects status changes in real time
- **Swagger Docs** — Full API documentation at `/api-docs`

## Tech Stack

- **Backend** — NestJS, TypeScript, Prisma 7, PostgreSQL (Neon)
- **Frontend** — HTML, CSS, Alpine.js
- **Logging** — Pino (structured JSON)
- **Deployment** — Ubuntu VPS, Nginx, DuckDNS, Let's Encrypt

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (Neon recommended)

### Installation

```bash
git clone https://github.com/clinztouch/job-scheduler
cd job-scheduler
pnpm install
pnpm approve-builds
```

### Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.neon.tech/job_scheduler?sslmode=require"
PORT=3000
NODE_ENV=development
DLQ_ALERT_THRESHOLD=10
AGING_INTERVAL_SECONDS=30
AGING_BOOST_AMOUNT=0.5
WORKER_POLL_INTERVAL_MS=2000
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Run

```bash
# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod

# Worker only (separate process)
WORKER_ONLY=true npx ts-node -r tsconfig-paths/register src/worker/worker.bootstrap.ts
```

### URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | UI |
| `http://localhost:3000/api-docs` | Swagger |
| `http://localhost:3000/sse/jobs` | SSE stream |
| `http://localhost:3000/scheduler/benchmark` | Algorithm benchmark |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/jobs` | Create a job |
| GET | `/jobs` | List all jobs |
| GET | `/jobs/dashboard` | Job counts by status |
| GET | `/jobs/:id` | Get single job |
| PATCH | `/jobs/:id/cancel` | Cancel a job |
| GET | `/dlq` | List DLQ jobs |
| POST | `/dlq/:id/retry` | Manual DLQ retry |
| GET | `/sse/jobs` | SSE stream |
| GET | `/scheduler/benchmark` | Benchmark heap vs timing wheel |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DLQ_ALERT_THRESHOLD` | `10` | DLQ job count that triggers alert email |
| `AGING_INTERVAL_SECONDS` | `30` | How long a job waits before priority boost |
| `AGING_BOOST_AMOUNT` | `0.5` | How much effectivePriority is reduced per aging cycle |
| `WORKER_POLL_INTERVAL_MS` | `2000` | How often the worker polls the heap |