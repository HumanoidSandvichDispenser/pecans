from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .client import BaseClient


class Module:
    def __init__(self, client: BaseClient) -> None:
        self._client = client

    @property
    def client(self) -> BaseClient:
        return self._client
