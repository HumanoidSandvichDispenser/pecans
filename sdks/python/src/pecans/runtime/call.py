from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Generator, Generic, TypeVar

from .types import MethodCall

if TYPE_CHECKING:
    from .client import BaseClient

T = TypeVar("T")


class Call(Generic[T]):
    """A lazy, awaitable API call. Awaiting it sends the call on its own; passing it
    to :meth:`BaseClient.batch` bundles it into one request with typed results."""

    def __init__(
        self,
        client: BaseClient,
        method_call: MethodCall,
        decode: Callable[[Any], T] | None = None,
    ) -> None:
        self.client = client
        self.method_call = method_call
        self.decode = decode

    def build(self, raw: Any) -> T:
        """Turn a built response envelope into the typed value for this call."""
        if self.decode is not None:
            return self.decode(raw)

        return raw

    async def _send(self) -> T:
        raw = await self.client.send_one(self.method_call)

        return self.build(raw)

    def __await__(self) -> Generator[Any, None, T]:
        return self._send().__await__()
