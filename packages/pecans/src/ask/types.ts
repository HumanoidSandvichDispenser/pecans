import { TCResponse, TCResponseRaw } from "../types";

//export class FetchQuestionsResponse extends TCResponse {
//    public constructor(response: TCResponseRaw) {
//
//    }
//}

export class ListDataResponse extends TCResponse {
    public questions: QuestionMetadata[];

    public constructor(res: TCResponseRaw) {
        super(res);
        const data = res["questions"] as QuestionMetadataRaw[] ?? [];
        this.questions = data.map((meta) => new QuestionMetadata(meta));
    }
}

export class QuestionTextResponse extends TCResponse {
    public questions: QuestionText[];

    public constructor(res: TCResponseRaw) {
        super(res);
        const data = (res.questions ?? []) as QuestionTextRaw[];
        this.questions = data.map((c) => new QuestionText(c));
    }
}

export interface QuestionMetadataRaw {
    readonly id: number;
    readonly ia: boolean; // is active
    readonly r: number; // replies
    readonly nr: number; // new replies
    readonly it: number; // time expires
    readonly la: number; // ???
    readonly at: number; // time asked
    readonly p: boolean; // pinned
    readonly pn: boolean; // pinned???
    readonly t: string; // "text" or "poll"
}

export enum QuestionType {
    TEXT,
    POLL,
}

export class QuestionMetadata {
    public id: number;
    public isActive: boolean;
    public replyCount: number;
    public newReplyCount: number;
    public expireTime: number;
    public creationTime: number;
    public isPinned: boolean;
    public questionType: QuestionType;

    public constructor(metadata: QuestionMetadataRaw) {
        this.id = metadata.id;
        this.isActive = metadata.ia;
        this.replyCount = metadata.r;
        this.newReplyCount = metadata.nr;
        this.expireTime = metadata.it;
        this.creationTime = metadata.at;
        this.isPinned = metadata.p;
        this.questionType = metadata.t == "poll" ?
            QuestionType.POLL : QuestionType.TEXT;
    }
}

export class QuestionText {
    public id: number;
    public text: string;

    public constructor(content: QuestionTextRaw) {
        this.id = content.id;
        this.text = content.b;
    }
}

export interface QuestionTextRaw {
    readonly id: number;
    readonly b: string;
}

export interface PollMetadataRaw {
    readonly id: number;
    readonly options: PollOptionRaw[];
}

export interface PollOptionRaw {
    readonly n: number;
    readonly c: number;
}

export class QuestionData {
    public body: string;
    public header: QuestionMetadata;

    public constructor(c: QuestionText, m: QuestionMetadata | undefined) {
        if (!m) {
            throw "No metadata associated";
        }

        if (c.id != m.id) {
            throw "QuestionContent does not share ID with QuestionMetadata";
        }

        this.body = c.text;
        this.header = m;
    }

    /** @internal */
    static _mapFrom(
        metadata: Map<number, QuestionMetadata>,
        questions: QuestionText[]
    ) {
        return questions
            .map((t) => new QuestionData(t, metadata.get(t.id)));
    }
}
