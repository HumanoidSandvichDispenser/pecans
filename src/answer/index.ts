import { DismissAction, QuestionFetchResponse } from "./types";
import { Module } from "../module";
import { TCResponse } from "../types";

export class AnswerModule extends Module {
    public async fetchNext() {
        return await this.client._call(
            QuestionFetchResponse,
            "answer.getnext",
            { }
        );
    }

    public async dismissQuestion(questionId: number, action: DismissAction) {
        return await this.client._call(
            TCResponse,
            "answer.dismissquestion",
            {
                questionId,
                action: action as string,
            }
        )
    }
}
