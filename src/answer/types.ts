import { TCResponse, TCResponseRaw } from "../types";

/**
 * Response for answer.reply.
 */
export class AnswerReplyResponse extends TCResponse {
    public id: number;
    public time: number;
    public text: string;

    public constructor(res: TCResponseRaw) {
        super(res);
        this.id = res["id"];
        this.time = res["time"];
        this.text = res["text"];
    }
}

/**
 * Response for answer.queuequestion.
 */
export class AnswerQueueQuestionResponse extends TCResponse {
    public id: number;
    public time: number;
    public text: string;
    public author?: string;
    public poll?: Poll;

    public constructor(res: TCResponseRaw) {
        super(res);
        this.id = res["id"];
        this.time = res["time"];
        this.text = res["text"];
        this.author = res["author"];
        this.poll = res["poll"];
    }
}

/**
 * Response for answer.dismissquestion.
 */
export class AnswerDismissResponse extends TCResponse {
    public constructor(res: TCResponseRaw) {
        super(res);
    }
}

/**
 * Response for answer.pollvote.
 */
export class AnswerPollVoteResponse extends TCResponse {
    public constructor(res: TCResponseRaw) {
        super(res);
    }
}

export class QuestionFetchResponse extends TCResponse {
    id: number;
    time: number;
    text: string;
    author?: string;
    poll?: Poll;

    public constructor(res: TCResponseRaw) {
        super(res);

        this.id = res["id"];
        this.time = res["time"];
        this.text = res["text"];

        this.poll = res["poll"];
        this.author = res["author"];
    }
}

export interface Poll {
    readonly options: PollOption[];
    readonly answered: boolean;
}

export interface PollOption {
    readonly text: string;
    readonly color: string;
    readonly votes?: number;
    readonly yours?: boolean;
}

export enum DismissAction {
    SNOOZE = "SNOOZE",
    DISCARD = "DISCARD",
}
