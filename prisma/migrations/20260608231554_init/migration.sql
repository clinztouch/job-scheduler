-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "priority" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "scheduled_at" TIMESTAMP(3),
    "interval" TEXT,
    "next_run_at" TIMESTAMP(3),
    "error_message" TEXT,
    "is_dlq" BOOLEAN NOT NULL DEFAULT false,
    "effective_priority" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_dependencies" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "depends_on_id" TEXT NOT NULL,

    CONSTRAINT "job_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_dependencies_job_id_depends_on_id_key" ON "job_dependencies"("job_id", "depends_on_id");

-- AddForeignKey
ALTER TABLE "job_dependencies" ADD CONSTRAINT "job_dependencies_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_dependencies" ADD CONSTRAINT "job_dependencies_depends_on_id_fkey" FOREIGN KEY ("depends_on_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
