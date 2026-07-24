import { Module } from "../module";
import { ListDataResponse, QuestionData, QuestionMetadata, QuestionTextResponse } from "./types";

export class AskModule extends Module {
    //#questionCache: Cache<QuestionData> = new Cache<QuestionData>();

    /**
     * Lists the metadata of all questions. This does nothing by itself.
     */
    public async listData() {
        return await this.client._call(
            ListDataResponse,
            "legacy.askapi",
            {
                arg1: "0",
                arg2: "none",
                arg3: "0",
                name: "listdata",
                rawEmbeddedJsonLolInternalTechDebt: null,
            },
        );
    }

    public async fetchQuestions(metadata: QuestionMetadata[]) {
        const metadataMap = new Map(metadata.map((u) => [u.id, u]));
        const text = await this.fetchQuestionsText(metadata);
        //return text.questions
        //    .map((body) => new QuestionData(body, metadataMap.get(body.id)));
        return QuestionData._mapFrom(metadataMap, text.questions);
    }

    /**
     * Fetches question content given list of question metadata. Does nothing
     * by itself.
     */
    public async fetchQuestionsText(metadata: QuestionMetadata[]) {
        const ids = metadata.map((q) => q.id);
        return await this.client._call(
            QuestionTextResponse,
            "legacy.askapi",
            {
                arg1: ids.join("x"),
                arg2: "0",
                arg3: "0",
                name: "qtext",
                rawEmbeddedJsonLolInternalTechDebt: null,
            }
        );
    }
}
