from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class MethodCall:
    fn: str
    payload: dict[str, Any]
