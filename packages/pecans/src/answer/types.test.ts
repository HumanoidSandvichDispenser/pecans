import { describe, expect, it } from "vitest";
import { AnswerQueueQuestionResponse, AnswerReplyResponse } from "./types";
import { TCResponseRaw } from "../types";

describe("answer types", () => {
    it("should parse AnswerReplyResponse", () => {
        const response: TCResponseRaw = {
            ok: true,
            id: 2254111,
            time: 1753856495,
            text: "Hey you, name me a black game character.",
        };

        const constructed = new AnswerReplyResponse(response);

        expect(constructed.ok).toBe(true);
        expect(constructed.id).toBe(2254111);
        expect(constructed.time).toBe(1753856495);
        expect(constructed.text).toBe("Hey you, name me a black game character.");
    });

    it("should parse AnswerQueueQuestionResponse with poll", () => {
        const response: TCResponseRaw = {
            ok: true,
            id: 2266300,
            time: 1775463826,
            text: "[USER SATISFACTION SURVEY]",
            author: "user64837",
            poll: {
                answered: false,
                options: [
                    { text: "1 (terrible)", color: "ff0000" },
                    { text: "5 (great)", color: "ff0000" },
                ],
            },
        };

        const constructed = new AnswerQueueQuestionResponse(response);

        expect(constructed.ok).toBe(true);
        expect(constructed.id).toBe(2266300);
        expect(constructed.time).toBe(1775463826);
        expect(constructed.text).toBe("[USER SATISFACTION SURVEY]");
        expect(constructed.author).toBe("user64837");
        expect(constructed.poll?.answered).toBe(false);
        expect(constructed.poll?.options).toHaveLength(2);
        expect(constructed.poll?.options[0].text).toBe("1 (terrible)");
    });
});
