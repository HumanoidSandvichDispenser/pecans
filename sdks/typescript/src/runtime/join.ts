export function joinBy<I, R, O>(
    inputs: I[],
    results: R[],
    inputKey: (input: I) => unknown,
    resultKey: (result: R) => unknown,
    combine: (result: R, input: I) => O,
): O[] {
    const byKey = new Map(inputs.map((input) => [inputKey(input), input]));

    return results.map((result) => {
        const input = byKey.get(resultKey(result));

        if (input === undefined) {
            throw new Error(`joinBy: no input matches key ${resultKey(result)}`);
        }

        return combine(result, input);
    });
}
