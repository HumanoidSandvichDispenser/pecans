import "./decorators.js";

using TypeSpec.Reflection;

extern dec rpc(target: Operation, name: valueof string);
extern dec constant(target: Operation, values: valueof Record<unknown>);
extern dec also(target: ModelProperty, ...names: valueof string[]);
extern dec join(target: ModelProperty, separator: valueof string);
extern dec zip(target: Operation, config: valueof Record<unknown>);
extern dec fromInput(target: ModelProperty, field?: valueof string);
extern dec fromResult(target: ModelProperty, field: valueof string);
