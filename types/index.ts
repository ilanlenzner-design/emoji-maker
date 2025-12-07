export interface Prediction {
    id: string;
    status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
    output?: string[];
    error?: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
}
