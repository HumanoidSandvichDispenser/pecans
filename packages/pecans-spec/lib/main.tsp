import "./decorators.js";

using TypeSpec.Reflection;

extern dec rpc(target: Operation, name: valueof string);
extern dec constant(target: Operation, values: valueof Record<unknown>);
extern dec also(target: ModelProperty, ...names: valueof string[]);
extern dec join(target: ModelProperty, separator: valueof string);
