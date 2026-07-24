from __future__ import annotations

import json
import re
from typing import TYPE_CHECKING, Any

import httpx

from .types import MethodCall

if TYPE_CHECKING:
    from .call import Call


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
        self.agent = "pecans"
        self.should_trim_errors = True
        self.profile_cache: dict[str, Any] = {}

    async def send_one(self, call: MethodCall) -> Any:
        res = await self._send([call])

        return self._build(res, 0)

    async def batch(self, *calls: Call[Any]) -> list[Any]:
        """Send several calls as one batched request, decoding each result in place."""
        if not calls:
            return []

        res = await self._send([call.method_call for call in calls])

        return [call.build(self._build(res, index)) for index, call in enumerate(calls)]

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
            headers["Cookie"] = "twocansandstring_com_auth2=" + self.auth_token

        body = {
            "auth": self.auth_token,
            "requests": [{"fn": call.fn, "payload": call.payload} for call in requests],
        }

        async with httpx.AsyncClient() as http:
            res = await http.post(BaseClient.BASE_URI, headers=headers, json=body)

        res.raise_for_status()

        if self.should_trim_errors:
            text = re.sub(r"^(?:.*\n)*\{", "{", res.text, count=1)

            try:
                return json.loads(text)
            except json.JSONDecodeError as cause:
                raise ResponseParseError(text, cause) from cause

        return res.json()
