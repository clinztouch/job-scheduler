export declare class CreateJobDto {
    type: string;
    payload: Record<string, any>;
    priority: number;
    scheduledAt?: string;
    interval?: string;
    dependsOn?: string[];
}
