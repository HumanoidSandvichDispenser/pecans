import {
    compile,
    getDoc,
    getReturnsDoc,
    NodeHost,
    resolveEncodedName,
    serializeValueAsJson,
} from "@typespec/compiler";
import { join } from "node:path";

const RPC = Symbol.for("pecans.rpc");
const CONSTANT = Symbol.for("pecans.constant");
const ALSO = Symbol.for("pecans.also");
const JOIN = Symbol.for("pecans.join");
const ZIP = Symbol.for("pecans.zip");
const FROM_INPUT = Symbol.for("pecans.fromInput");
const FROM_RESULT = Symbol.for("pecans.fromResult");

const FLOAT = new Set(["float", "float32", "float64", "numeric", "decimal", "decimal128"]);
const INT = new Set([
    "int8",
    "int16",
    "int32",
    "int64",
    "integer",
    "safeint",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
]);

/**
 * A language-neutral type. Backends map these to their own type syntax
 * (e.g. `int` and `float` both collapse to `number` in TypeScript).
 */
export type IrType =
    | { kind: "int" }
    | { kind: "float" }
    | { kind: "bool" }
    | { kind: "string" }
    | { kind: "enum"; name: string }
    | { kind: "model"; name: string }
    | { kind: "array"; element: IrType }
    | { kind: "nullable"; inner: IrType }
    | { kind: "dict" }
    | { kind: "unknown" };

export interface IrField {
    name: string;
    wireName: string;
    type: IrType;
    optional: boolean;
    doc?: string;
}

export interface IrModel {
    name: string;
    fields: IrField[];
    doc?: string;
}

export interface IrEnumMember {
    name: string;
    value: string | number;
}

export interface IrEnum {
    name: string;
    members: IrEnumMember[];
}

export interface IrParam {
    name: string;
    type: IrType;
    optional: boolean;
    hasDefault: boolean;
    default?: unknown;
    wireName: string;
    also: string[];
    joinSep?: string;
    doc?: string;
}

export interface IrZipField {
    name: string;
    from: "result" | "input" | "inputSelf";
    field?: string;
}

export interface IrZip {
    callMethod: string;
    input: string;
    project: string;
    key: string;
    results: string;
    element: string;
    fields: IrZipField[];
}

export interface IrOp {
    method: string;
    fn: string;
    params: IrParam[];
    constants: Record<string, unknown>;
    response: string;
    decodeModel?: string;
    zip?: IrZip;
    doc?: string;
    returnsDoc?: string;
}

export interface IrModule {
    name: string;
    interfaceName: string;
    ops: IrOp[];
    responses: string[];
    enums: string[];
    decoderModels: string[];
}

export interface IrDecodeField {
    name: string;
    wireName: string;
    decodeModel?: string;
    isArray: boolean;
}

export interface IrDecoder {
    model: string;
    fields: IrDecodeField[];
}

export interface IrProgram {
    modules: IrModule[];
    models: IrModel[];
    enums: IrEnum[];
    decoders: IrDecoder[];
    hasDecoders: boolean;
}

function jsValue(program: any, value: any): unknown {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === "object" && "valueKind" in value) {
        return serializeValueAsJson(program, value, value.type);
    }

    return value;
}

function irType(type: any, enumsUsed: Set<string>): IrType {
    switch (type.kind) {
        case "Scalar":
            if (FLOAT.has(type.name)) {
                return { kind: "float" };
            }

            if (INT.has(type.name)) {
                return { kind: "int" };
            }

            if (type.name === "boolean") {
                return { kind: "bool" };
            }

            return { kind: "string" };

        case "Enum":
            enumsUsed.add(type.name);
            return { kind: "enum", name: type.name };

        case "Union": {
            const variants = [...type.variants.values()];
            const isNull = (v: any) => v.type.kind === "Intrinsic" && v.type.name === "null";
            const nonNull = variants.filter((v: any) => !isNull(v));
            const hasNull = nonNull.length !== variants.length;
            const wrap = (t: IrType): IrType => (hasNull ? { kind: "nullable", inner: t } : t);

            // A union of string literals (used as an inline enum) collapses to string.
            if (nonNull.every((v: any) => v.type.kind === "String")) {
                return wrap({ kind: "string" });
            }

            // `T | null` (a single underlying type, optionally nullable) unwraps to T.
            if (nonNull.length === 1) {
                return wrap(irType(nonNull[0].type, enumsUsed));
            }

            return { kind: "unknown" };
        }

        case "String":
            return { kind: "string" };

        case "Boolean":
            return { kind: "bool" };

        case "Number":
            return { kind: "float" };

        case "Model":
            if (type.name === "Array" && type.indexer) {
                return { kind: "array", element: irType(type.indexer.value, enumsUsed) };
            }

            if (!type.name) {
                return { kind: "dict" };
            }

            return { kind: "model", name: type.name };

        default:
            return { kind: "unknown" };
    }
}

/** Names of every named model referenced by a type, recursing arrays/nullables. */
function modelNamesIn(type: IrType, out: Set<string>): void {
    if (type.kind === "model") {
        out.add(type.name);
    } else if (type.kind === "array") {
        modelNamesIn(type.element, out);
    } else if (type.kind === "nullable") {
        modelNamesIn(type.inner, out);
    }
}

/** All properties of a model, own plus inherited, base-first. */
function collectProps(model: any): any[] {
    const props: any[] = [];

    if (model.baseModel) {
        props.push(...collectProps(model.baseModel));
    }

    for (const p of model.properties.values()) {
        props.push(p);
    }

    return props;
}

/** The named Pecans model a property carries (unwrapping arrays), if any. */
function propModel(type: any): { model: any | undefined; isArray: boolean } {
    if (type?.kind === "Model" && type.name === "Array" && type.indexer) {
        const el = type.indexer.value;
        const named = el?.kind === "Model" && el.name && el.name !== "Array" ? el : undefined;

        return {
            model: named,
            isArray: true,
        };
    }

    if (type?.kind === "Model" && type.name && type.name !== "Array") {
        return {
            model: type,
            isArray: false,
        };
    }

    return {
        model: undefined,
        isArray: false,
    };
}

/** A model needs a decoder if any field is renamed on the wire, transitively. */
function needsDecode(program: any, model: any, memo: Map<any, boolean>): boolean {
    if (memo.has(model)) {
        return memo.get(model)!;
    }

    memo.set(model, false);

    let result = false;

    for (const p of collectProps(model)) {
        if (resolveEncodedName(program, p, "application/json") !== p.name) {
            result = true;
            break;
        }

        const { model: m } = propModel(p.type);

        if (m && needsDecode(program, m, memo)) {
            result = true;
            break;
        }
    }

    memo.set(model, result);
    return result;
}

/** Compile the spec and lift it into the language-neutral IR both backends render. */
export async function buildIr(specPath: string): Promise<IrProgram> {
    const program = await compile(NodeHost, specPath, {});
    const errors = program.diagnostics.filter((d) => d.severity === "error");

    if (errors.length) {
        for (const d of errors) {
            console.error(d.code, d.message);
        }

        throw new Error("spec has errors");
    }

    const rpcMap = program.stateMap(RPC);
    const constMap = program.stateMap(CONSTANT);
    const alsoMap = program.stateMap(ALSO);
    const joinMap = program.stateMap(JOIN);
    const zipMap = program.stateMap(ZIP);
    const fromInputMap = program.stateMap(FROM_INPUT);
    const fromResultMap = program.stateMap(FROM_RESULT);

    const ns = program.getGlobalNamespaceType().namespaces.get("Pecans");

    if (!ns) {
        throw new Error("namespace Pecans not found");
    }

    const modules: IrModule[] = [];
    const responseTypes = new Set<any>();
    const scratch = new Set<string>();

    for (const iface of ns.interfaces.values()) {
        const mod: IrModule = {
            name: iface.name.toLowerCase(),
            interfaceName: iface.name,
            ops: [],
            responses: [],
            enums: [],
            decoderModels: [],
        };

        const responses = new Set<string>();
        const enums = new Set<string>();

        for (const op of iface.operations.values()) {
            const zipCfg = zipMap.get(op);
            const fn = rpcMap.get(op);

            if (!fn && !zipCfg) {
                continue;
            }

            const params: IrParam[] = [...op.parameters.properties.values()].map((prm: any) => {
                const type = irType(prm.type, enums);
                const wireName = resolveEncodedName(program, prm, "application/json");
                const also = (alsoMap.get(prm) as string[] | undefined) ?? [];
                const joinSep = joinMap.get(prm) as string | undefined;

                return {
                    name: prm.name,
                    type,
                    optional: prm.optional,
                    hasDefault: prm.defaultValue !== undefined,
                    default: prm.defaultValue ? jsValue(program, prm.defaultValue) : undefined,
                    wireName,
                    also,
                    joinSep,
                    doc: getDoc(program, prm),
                };
            });

            // Param model types must be imported by the generated module too.
            for (const prm of params) {
                modelNamesIn(prm.type, responses);
            }

            if (zipCfg) {
                const cfg = jsValue(program, zipCfg) as Record<string, string>;
                const element = (op.returnType as any).indexer.value;

                responses.add(element.name);

                for (const prm of op.parameters.properties.values()) {
                    const { model } = propModel((prm as any).type);

                    if (model) {
                        responses.add(model.name);
                    }
                }

                const fields: IrZipField[] = [...element.properties.values()].map((pr: any) => {
                    const fromResult = fromResultMap.get(pr) as string | undefined;

                    if (fromResult !== undefined) {
                        return { name: pr.name, from: "result", field: fromResult };
                    }

                    const fromInput = fromInputMap.get(pr) as string | null | undefined;

                    if (fromInput) {
                        return { name: pr.name, from: "input", field: fromInput };
                    }

                    return { name: pr.name, from: "inputSelf" };
                });

                mod.ops.push({
                    method: op.name,
                    fn: "",
                    params,
                    constants: {},
                    response: element.name,
                    zip: {
                        callMethod: cfg.call,
                        input: cfg.input,
                        project: cfg.project,
                        key: cfg.key,
                        results: cfg.results,
                        element: element.name,
                        fields,
                    },
                    doc: getDoc(program, op),
                    returnsDoc: getReturnsDoc(program, op),
                });
                continue;
            }

            const response = (op.returnType as any).name ?? "TCResponse";
            responses.add(response);

            if ((op.returnType as any).kind === "Model") {
                responseTypes.add(op.returnType);
            }

            const rawConst = constMap.get(op);
            const constants = (rawConst ? jsValue(program, rawConst) : {}) as Record<
                string,
                unknown
            >;

            mod.ops.push({
                method: op.name,
                fn: fn as string,
                params,
                constants,
                response,
                doc: getDoc(program, op),
                returnsDoc: getReturnsDoc(program, op),
            });
        }

        if (mod.ops.length > 0) {
            mod.responses = [...responses];
            mod.enums = [...enums];
            modules.push(mod);
        }
    }

    modules.sort((a, b) => a.name.localeCompare(b.name));

    const memo = new Map<any, boolean>();
    const decoders: IrDecoder[] = [];
    const decodable = new Set<string>();
    const seen = new Set<any>();
    const queue = [...responseTypes];

    while (queue.length) {
        const model = queue.pop();

        if (!model || seen.has(model)) {
            continue;
        }

        seen.add(model);

        if (!needsDecode(program, model, memo)) {
            continue;
        }

        decodable.add(model.name);

        const fields: IrDecodeField[] = collectProps(model).map((p: any) => {
            const wireName = resolveEncodedName(program, p, "application/json");
            const { model: m, isArray } = propModel(p.type);
            const decodeModel = m && needsDecode(program, m, memo) ? m.name : undefined;

            return { name: p.name, wireName, decodeModel, isArray };
        });

        decoders.push({ model: model.name, fields });

        for (const p of collectProps(model)) {
            const { model: m } = propModel(p.type);

            if (m) {
                queue.push(m);
            }
        }
    }

    for (const mod of modules) {
        const used = new Set<string>();

        for (const op of mod.ops) {
            if (decodable.has(op.response)) {
                op.decodeModel = op.response;
                used.add(op.response);
            }
        }

        mod.decoderModels = [...used];
    }

    const models: IrModel[] = [...ns.models.values()].map((model: any) => ({
        name: model.name,
        doc: getDoc(program, model),
        fields: collectProps(model).map((p: any) => ({
            name: p.name,
            wireName: resolveEncodedName(program, p, "application/json"),
            type: irType(p.type, scratch),
            optional: p.optional,
            doc: getDoc(program, p),
        })),
    }));

    const enums: IrEnum[] = [...ns.enums.values()].map((en: any) => ({
        name: en.name,
        members: [...en.members.values()].map((m: any) => ({
            name: m.name,
            value: jsValue(program, m.value ?? m.name) as string | number,
        })),
    }));

    return {
        modules,
        models,
        enums,
        decoders,
        hasDecoders: decoders.length > 0,
    };
}
