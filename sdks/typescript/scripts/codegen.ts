#!/usr/bin/env bun
import { compile } from "json-schema-to-typescript";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const SCHEMA = join(
    import.meta.dir,
    "../../../packages/pecans-spec/dist/@typespec/json-schema/pecans.json",
);
const OUT = join(import.meta.dir, "../src/generated/types.ts");

function normalize(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(normalize);
    if (node && typeof node === "object") {
        const out: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(node)) {
            if (key === "$id" || key === "$schema") continue;
            if (key === "$ref" && typeof value === "string" && value.endsWith(".json")) {
                out.$ref = `#/$defs/${value.slice(0, -".json".length)}`;
                continue;
            }
            out[key] = normalize(value);
        }
        return out;
    }
    return node;
}

const bundle = normalize(await Bun.file(SCHEMA).json()) as {
    $defs: Record<string, unknown>;
};

// HACK: reference every def so json2ts emits all of them
const root = {
    title: "PecansSchemaRoot",
    type: "object",
    additionalProperties: false,
    properties: Object.fromEntries(
        Object.keys(bundle.$defs).map((name) => [name, { $ref: `#/$defs/${name}` }]),
    ),
    $defs: bundle.$defs,
};

let ts = await compile(root as never, "PecansSchemaRoot", {
    bannerComment: "/* Generated with Typespec. Do not edit. */",
    additionalProperties: false,
    declareExternallyReferenced: true,
    enableConstEnums: false,
});

ts = ts.replace(/export interface PecansSchemaRoot \{[\s\S]*?\n\}\n?/, "");

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, ts);
console.log(`wrote ${OUT}`);
