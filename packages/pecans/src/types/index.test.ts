import { TCResponse, TCResponseRaw } from ".";
import { PollMetadataRaw } from "../ask/types";
import { describe, expect, it } from "vitest";
import { QuestionFetchResponse } from "../answer/types";

describe("types", () => {
    it("should serialize TCResponse into an object", () => {
        const poll = {
            "options": [
                {
                    "text": "forsen forsenSmug",
                    "color": "800080",
                    "votes": 13
                },
                {
                    "text": "NOT FORSEN haHAA",
                    "color": "ffff00",
                    "votes": 3,
                    "yours": true
                }
            ],
            "answered": true
        };

        const rawResponse: TCResponseRaw = {
            "ok": true,
            "id": 2225487,
            "time": 1707421269,
            "text": "Who is the god gamer?",
            "poll": poll,
            "profiles": [],
        };

        const response = new QuestionFetchResponse(rawResponse);
        console.log(response.toObject().poll.options[0].votes);
        expect(response.toObject().poll.options[0].votes).toEqual(13);
        expect(response.toObject().poll.options[1].votes).toEqual(3);
    });
});
