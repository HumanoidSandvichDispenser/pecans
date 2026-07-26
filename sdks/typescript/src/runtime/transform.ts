/**
 * Generalized value-transform primitives used by generated encoders/decoders.
 * These are domain-agnostic: `@rgb` and any future encoded-scalar decorator
 * lower to `bitfield` / `tuple` descriptors that these functions interpret.
 */

export interface BitfieldComponent {
    name: string;
    offset: number;
    width: number;
}

/** Extract named components from a packed integer into a struct. */
export function bitfieldUnpack(
    value: number,
    components: BitfieldComponent[],
): Record<string, number> {
    const out: Record<string, number> = {};

    for (const c of components) {
        out[c.name] = (value >>> c.offset) & ((1 << c.width) - 1);
    }

    return out;
}

/** Pack a struct's named components back into a single integer. */
export function bitfieldPack(value: any, components: BitfieldComponent[]): number {
    let out = 0;

    for (const c of components) {
        out |= (value[c.name] & ((1 << c.width) - 1)) << c.offset;
    }

    return out >>> 0;
}

/** Map a positional array into a struct keyed by `fields` in order. */
export function tupleUnpack(value: unknown[], fields: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    fields.forEach((f, i) => {
        out[f] = value[i];
    });

    return out;
}

/** Map a struct back into a positional array in `fields` order. */
export function tuplePack(value: any, fields: string[]): unknown[] {
    return fields.map((f) => value[f]);
}
