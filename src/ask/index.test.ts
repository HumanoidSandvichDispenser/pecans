import { assert, describe, expect, it } from "vitest";
import { ListDataResponse, QuestionData, QuestionMetadata, QuestionMetadataRaw, QuestionTextResponse, QuestionType } from "./types";
import { TCResponseRaw } from "../types";

describe("ask module", () => {
    it("should parse QuestionMetadataRaw into QuestionMetadata", () => {
        const raw: QuestionMetadataRaw = {
            "id": 2219026,
            "ia": true,
            "r": 1,
            "nr": 0,
            "it": 1697785844,
            "la": 13548862,
            "at": 1697526644,
            "p": false,
            "pn": false,
            "t": "text"
        };

        const constructed = new QuestionMetadata(raw);

        expect(constructed).toEqual({
            id: 2219026,
            isActive: true,
            replyCount: 1,
            newReplyCount: 0,
            expireTime: 1697785844,
            creationTime: 1697526644,
            isPinned: false,
            questionType: QuestionType.TEXT,
        });
    });

    it("should parse raw ListDataResponse", () => {
        const response: TCResponseRaw = {
            "questions": [
                {
                    "id": 2200000,
                    "ia": true,
                    "r": 1,
                    "nr": 0,
                    "it": 1697785844,
                    "la": 13548862,
                    "at": 1697526644,
                    "p": false,
                    "pn": false,
                    "t": "text"
                },
                {
                    "id": 2200001,
                    "ia": false,
                    "r": 12,
                    "nr": 0,
                    "it": 1697731297,
                    "la": 13549378,
                    "at": 1697472097,
                    "p": false,
                    "pn": false,
                    "t": "text"
                },
            ]
        };

        const constructed = new ListDataResponse(response);

        expect(constructed.questions).toBeTruthy();
        expect(constructed.questions).toHaveLength(2);
        expect(constructed.questions[0]).toBeTruthy();
        expect(constructed.questions[0].id).toBe(2200000);
        expect(constructed.questions[1].id).toBe(2200001);
    });
});

describe("fetchQuestions method", () => {
    it("should create question data from metadata and text", () => {
        const listData: TCResponseRaw = {
            "questions": [
                {
                    "id": 2219000,
                    "ia": true,
                    "r": 1,
                    "nr": 0,
                    "it": 1697785844,
                    "la": 13548862,
                    "at": 1697526644,
                    "p": false,
                    "pn": false,
                    "t": "text"
                },
            ],
        };

        const questionText: TCResponseRaw = {
            "questions": [
                {
                    "id": 2219000,
                    "b": "among us"
                },
            ]
        };

        const metadata = new ListDataResponse(listData).questions;
        const metadataMap = new Map(metadata.map((u) => [u.id, u]));
        const questions = new QuestionTextResponse(questionText).questions;

        const data = QuestionData._mapFrom(metadataMap, questions);

        assert(metadata.length > 0);
        assert(data.length > 0);
        expect(data[0].body).toEqual("among us");
        expect(data[0].header).toEqual(metadata[0]);
    });
});
