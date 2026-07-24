# pecans

Pretty easy Two Cans & String API wrapper.

```sh
npm install @sandvichxyz/pecans
```

## Quick start

```ts
import { Client } from "@sandvichxyz/pecans";

const client = new Client(process.env.TC_AUTH);

const res = await client.messages.folderView();
for (const msg of res.messages) {
    console.log(msg.preview);
}
```

## Batching

The Two Cans & String HTTP API accepts several RPC calls in one HTTP request.
`client.batch` replicates this behavior with individually typed responses. For
example, the following sends two requests in one HTTP call:

```ts
const [inbox, hits] = await client.batch(
    client.messages.folderView(),
    client.forum.search("hello"),
);
// inbox: FolderViewResponse, hits: ForumSearchResponse
```
