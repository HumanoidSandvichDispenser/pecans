from __future__ import annotations

import json
import re
from typing import TYPE_CHECKING, Any, TypeVar, overload

import httpx

from .types import MethodCall

if TYPE_CHECKING:
    from .call import Call

_T1 = TypeVar("_T1")
_T2 = TypeVar("_T2")
_T3 = TypeVar("_T3")
_T4 = TypeVar("_T4")
_T5 = TypeVar("_T5")
_T6 = TypeVar("_T6")
_T7 = TypeVar("_T7")
_T8 = TypeVar("_T8")


class ResponseParseError(Exception):
    """Raised when the API returns a body that is not parseable as JSON."""

    def __init__(self, response_text: str, cause: Exception | None = None) -> None:
        super().__init__("Failed to parse API response as JSON")

        self.response_text = response_text
        self.__cause__ = cause


class BaseClient:
    BASE_URI = "https://api.twocansandstring.com/api"
    VERSION = "1.68"

    def __init__(self, auth: str | None = None) -> None:
        self.auth_token = auth
        self.base_uri = BaseClient.BASE_URI
        self.agent = "pecans"
        self.should_trim_errors = True
        self.profile_cache: dict[str, Any] = {}

    async def send_one(self, call: MethodCall) -> Any:
        res = await self._send([call])

        return self._build(res, 0)

    @overload
    async def batch(self, c1: Call[_T1], /) -> tuple[_T1]: ...
    @overload
    async def batch(self, c1: Call[_T1], c2: Call[_T2], /) -> tuple[_T1, _T2]: ...
    @overload
    async def batch(
        self, c1: Call[_T1], c2: Call[_T2], c3: Call[_T3], /
    ) -> tuple[_T1, _T2, _T3]: ...
    @overload
    async def batch(
        self, c1: Call[_T1], c2: Call[_T2], c3: Call[_T3], c4: Call[_T4], /
    ) -> tuple[_T1, _T2, _T3, _T4]: ...
    @overload
    async def batch(
        self,
        c1: Call[_T1],
        c2: Call[_T2],
        c3: Call[_T3],
        c4: Call[_T4],
        c5: Call[_T5],
        /,
    ) -> tuple[_T1, _T2, _T3, _T4, _T5]: ...
    @overload
    async def batch(
        self,
        c1: Call[_T1],
        c2: Call[_T2],
        c3: Call[_T3],
        c4: Call[_T4],
        c5: Call[_T5],
        c6: Call[_T6],
        /,
    ) -> tuple[_T1, _T2, _T3, _T4, _T5, _T6]: ...
    @overload
    async def batch(
        self,
        c1: Call[_T1],
        c2: Call[_T2],
        c3: Call[_T3],
        c4: Call[_T4],
        c5: Call[_T5],
        c6: Call[_T6],
        c7: Call[_T7],
        /,
    ) -> tuple[_T1, _T2, _T3, _T4, _T5, _T6, _T7]: ...
    @overload
    async def batch(
        self,
        c1: Call[_T1],
        c2: Call[_T2],
        c3: Call[_T3],
        c4: Call[_T4],
        c5: Call[_T5],
        c6: Call[_T6],
        c7: Call[_T7],
        c8: Call[_T8],
        /,
    ) -> tuple[_T1, _T2, _T3, _T4, _T5, _T6, _T7, _T8]: ...
    @overload
    async def batch(self, *calls: Call[Any]) -> tuple[Any, ...]: ...

    async def batch(self, *calls: Call[Any]) -> tuple[Any, ...]:
        """Send several calls as one batched request, decoding each result in place.

        Typed for up to 8 calls (result is a positional ``tuple``); beyond that the
        element types fall back to ``Any``."""
        if not calls:
            return ()

        res = await self._send([call.method_call for call in calls])

        return tuple(call.build(self._build(res, index)) for index, call in enumerate(calls))

    def _build(self, res: dict[str, Any] | None, index: int) -> Any:
        if res is not None:
            for profile in res.get("profiles") or []:
                self.profile_cache[profile["id"]] = profile

        responses = (res or {}).get("responses") or []
        payload = responses[index] if index < len(responses) else {}

        return {
            "ok": (res or {}).get("ok", False),
            **payload,
            "profiles": (res or {}).get("profiles"),
        }

    async def _send(self, requests: list[MethodCall]) -> dict[str, Any] | None:
        headers = {
            "Content-Type": "application/json",
            "User-Agent": self.agent,
        }

        if self.auth_token is not None:
            headers["Cookie"] = "tc_auth_v3=" + self.auth_token

        body = {
            "auth": self.auth_token,
            "requests": [{"fn": call.fn, "payload": call.payload} for call in requests],
        }

        async with httpx.AsyncClient() as http:
            res = await http.post(self.base_uri, headers=headers, json=body)

        res.raise_for_status()

        if self.should_trim_errors:
            text = re.sub(r"^(?:.*\n)*\{", "{", res.text, count=1)

            try:
                return json.loads(text)
            except json.JSONDecodeError as cause:
                raise ResponseParseError(text, cause) from cause

        return res.json()
