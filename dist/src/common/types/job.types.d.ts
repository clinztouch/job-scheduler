import { Job, JobDependency } from '@prisma/client';
export type JobWithDependencies = Job & {
    dependencies?: JobDependency[];
    dependents?: JobDependency[];
};
export type JobFailedPayload = {
    job: Job;
    error: string;
};
