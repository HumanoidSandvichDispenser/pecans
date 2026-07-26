"""Generalized value-transform primitives used by generated encoders/decoders.

These are domain-agnostic: ``@rgb`` and any future encoded-scalar decorator
lower to ``bitfield`` / ``tuple`` descriptors that these functions interpret.
"""

from __future__ import annotations

from typing import Any


def bitfield_unpack(value: int, components: list[dict[str, Any]]) -> dict[str, int]:
    """Extract named components from a packed integer into a dict."""
    out: dict[str, int] = {}

    for c in components:
        out[c["name"]] = (value >> c["offset"]) & ((1 << c["width"]) - 1)

    return out


def bitfield_pack(value: dict[str, int], components: list[dict[str, Any]]) -> int:
    """Pack a dict's named components back into a single integer."""
    out = 0

    for c in components:
        out |= (value[c["name"]] & ((1 << c["width"]) - 1)) << c["offset"]

    return out


def tuple_unpack(value: list[Any], fields: list[str]) -> dict[str, Any]:
    """Map a positional list into a dict keyed by ``fields`` in order."""
    return {f: value[i] for i, f in enumerate(fields)}


def tuple_pack(value: dict[str, Any], fields: list[str]) -> list[Any]:
    """Map a dict back into a positional list in ``fields`` order."""
    return [value[f] for f in fields]
