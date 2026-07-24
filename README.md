# Pecans

Pretty Easy Two Cans & String API wrapper for version 1.68.

API spec written in [TypeSpec](https://typespec.io) with custom codegen
emitters for different languages.

## TypeScript

```ts
import { Client } from "pecans";

const client = new Client("AUTH COOKIE HERE");
const res = await client.messages.folderView();
for (const msg of res.messages) {
    console.log(msg.preview);
}
```

You can also use TwoCans's call batching to batch several calls together in one
request:

```ts
const [inbox, search] = await client.batch(
    client.messages.folderView(),
    client.forum.search("hello"),
);
```

## Python

Requires Python 3.11+ and `httpx`.

```py
import asyncio
from pecans import Client

async def main():
    client = Client("AUTH COOKIE HERE")
    res = await client.messages.folderView()
    for msg in res["messages"]:
        print(msg["preview"])

asyncio.run(main())
```

Batching:

```py
inbox, search = await client.batch(
    client.messages.folderView(),
    client.forum.search("hello"),
)
```
