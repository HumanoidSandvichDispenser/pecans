import { describe, expect, it } from "vitest";
import { NotifySyncResponse } from "./types";
import { TCResponseRaw } from "../types";

describe("notify types", () => {
    it("should parse NotifySyncResponse", () => {
        const response: TCResponseRaw = {
            ok: true,
            count: 6,
        };

        const constructed = new NotifySyncResponse(response);

        expect(constructed.ok).toBe(true);
        expect(constructed.count).toBe(6);
    });
});
