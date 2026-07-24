import {
    AnswerDismissResponse,
    AnswerPollVoteResponse,
    AnswerQueueQuestionResponse,
    AnswerReplyResponse,
    DismissAction,
    QuestionFetchResponse,
} from "./types";
import { Module } from "../module";

export class AnswerModule extends Module {
    /**
     * Fetches the next unanswered question.
     */
    public async fetchNext() {
        return await this.client._call(
            QuestionFetchResponse,
            "answer.getnext",
            { }
        );
    }

    /**
     * Dismisses a question with the provided action.
     */
    public async dismissQuestion(questionId: number, action: DismissAction) {
        return await this.client._call(
            AnswerDismissResponse,
            "answer.dismissquestion",
            {
                questionId,
                action: action as string,
            }
        );
    }

    /**
     * Submits a poll vote for a question.
     */
    public async pollVote(questionId: number, optionNum: number) {
        return await this.client._call(
            AnswerPollVoteResponse,
            "answer.pollvote",
            {
                questionId,
                optionNum,
            }
        );
    }

    /**
     * Queues a question to be asked later.
     */
    public async queueQuestion(questionId: number) {
        return await this.client._call(
            AnswerQueueQuestionResponse,
            "answer.queuequestion",
            {
                questionId,
            }
        );
    }

    /**
     * Replies to a question.
     */
    public async reply(questionId: number, text: string) {
        return await this.client._call(
            AnswerReplyResponse,
            "answer.reply",
            {
                questionId,
                text,
            }
        );
    }
}
