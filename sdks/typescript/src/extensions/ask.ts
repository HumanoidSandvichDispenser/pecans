import type { Client } from "../generated/client";
import type { QuestionData, QuestionMetadata } from "../generated/types";

/** List all question metadata. */
export async function listQuestions(client: Client): Promise<QuestionMetadata[]> {
    const res = await client.ask.listData();
    return res.questions ?? [];
}

/**
 * Fetch question bodies for the given metadata and join each to its header by
 * id. Throws if the API returns a body without matching metadata.
 */
export async function fetchQuestions(
    client: Client,
    metadata: QuestionMetadata[],
): Promise<QuestionData[]> {
    const byId = new Map(metadata.map((m) => [m.id, m]));
    const res = await client.ask.qtext(metadata.map((m) => m.id));
    return (res.questions ?? []).map((q) => {
        const header = byId.get(q.id);
        if (!header) {
            throw new Error(`no metadata for question ${q.id}`);
        }
        return { body: q.text, header };
    });
}
