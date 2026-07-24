from __future__ import annotations

from typing import Callable, TypeVar

TInput = TypeVar("TInput")
TResult = TypeVar("TResult")
TOutput = TypeVar("TOutput")


def join_by(
    inputs: list[TInput],
    results: list[TResult],
    input_key: Callable[[TInput], object],
    result_key: Callable[[TResult], object],
    combine: Callable[[TResult, TInput], TOutput],
) -> list[TOutput]:
    by_key = {input_key(item): item for item in inputs}

    def join(result: TResult) -> TOutput:
        item = by_key.get(result_key(result))

        if item is None:
            raise ValueError(f"join_by: no input matches key {result_key(result)}")

        return combine(result, item)

    return [join(result) for result in results]
