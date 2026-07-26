import "./decorators.js";

using TypeSpec.Reflection;

extern dec rpc(target: Operation, name: valueof string);
extern dec constant(target: Operation, values: valueof Record<unknown>);
extern dec also(target: ModelProperty, ...names: valueof string[]);
extern dec join(target: ModelProperty, separator: valueof string);
extern dec zip(target: Operation, config: valueof Record<unknown>);
extern dec fromInput(target: ModelProperty, field?: valueof string);
extern dec fromResult(target: ModelProperty, field: valueof string);

/**
 * Serialize this parameter as a JSON string into the named payload field,
 * rather than emitting it as a top-level field. Used for legacy endpoints
 * that nest a JSON body inside a single string field.
 */
extern dec embed(target: ModelProperty, field: valueof string);

/**
 * Coerce this parameter to its string wire form in the payload. Numbers become
 * `String(x)`, booleans become "1"/"0". Used for legacy endpoints whose
 * positional `arg1/2/3` fields are always sent as strings.
 */
extern dec stringify(target: ModelProperty);

/**
 * Declare that this color field is transported in some encoded form, and
 * should be normalized to/from an `Rgb` struct.
 */
extern dec rgb(target: ModelProperty, encode: valueof string, decode?: valueof string);
