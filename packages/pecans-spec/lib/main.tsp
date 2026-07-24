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
