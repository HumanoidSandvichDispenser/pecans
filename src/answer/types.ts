import { TCResponse, TCResponseRaw } from "../types";

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
