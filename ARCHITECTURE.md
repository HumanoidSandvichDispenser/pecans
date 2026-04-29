# Pecans Architecture

## Project Overview

Pecans is a TypeScript API wrapper for [Two Cans & String](https://twocansandstring.com) (API version 1.68). It is compiled with [jsii](https://github.com/aws/jsii) to produce multi-language bindings (TypeScript/Node.js, Python, .NET). All source is in TypeScript under `src/`, and jsii generates the `obj/` (intermediate JS+declarations) and `dist/` (language-specific packages) directories.

- **License**: GPL-3.0-only
- **Stability**: experimental
- **Repository**: https://github.com/humanoidsandvichdispenser/pew

## Directory Structure

```
src/
├── index.ts              # Barrel exports; re-exports all modules and type namespaces
├── client.ts             # Client class — central entry point
├── module.ts             # Module base class
├── cache.ts              # Generic TTL cache (unused in modules currently)
├── queue.ts              # Empty — planned but not implemented
├── types/
│   ├── index.ts           # Core types: TCResponse, TCResponseRaw, TCProfile, etc.
│   └── index.test.ts      # Tests for core types
├── messages/
│   ├── index.ts           # MessagesModule — private messaging API
│   ├── types.ts           # FolderViewResponse, MessageViewResponse, etc.
│   └── (commented-out legacy type classes)
├── ask/
│   ├── index.ts           # AskModule — question listing/fetching API
│   ├── types.ts           # ListDataResponse, QuestionMetadata, QuestionData, etc.
│   └── index.test.ts      # Tests for ask types
├── forum/
│   ├── index.ts           # ForumModule — forum posts, threads, search
│   └── types.ts           # ViewPostsResponse, Post, Thread, SearchResult
├── drawing/
│   ├── index.ts           # DrawingModule — save/view/send drawing API
│   └── types.ts           # SaveDrawingResponse, ViewDrawingDataResponse
├── answer/
│   ├── index.ts           # AnswerModule — answer questions, dismiss, poll vote
│   ├── types.ts           # AnswerReplyResponse, QuestionFetchResponse, DismissAction, Poll
│   └── types.test.ts      # Tests for answer types
├── notify/
│   ├── index.ts           # NotifyModule — sync unread counts, online users
│   ├── types.ts           # NotifySyncResponse, WhosOnlineResponse, Feature enum
│   └── types.test.ts      # Tests for notify types
├── account/
│   └── index.ts           # AccountModule — register, activate
├── auth/
│   ├── index.ts           # AuthModule — login
│   └── types.ts           # LoginResponse
└── legacy/
    └── index.ts           # Empty — not yet implemented
```

Build output:
- `obj/` — jsii intermediate output (JS + `.d.ts`)
- `dist/` — jsii-pacmak language-specific packages
- `.jsii` — jsii assembly manifest (auto-generated, gitignored)

## Core Architecture

### Client/Module Pattern

The `Client` class is the single entry point. It holds:
- `authToken` — the `twocansandstring_com_auth2` cookie value
- `agent` — User-Agent string (default `"pecans"`)
- `profileCache` — map of user ID to `TCProfile`, populated from API responses
- `shouldTrimErrors` — whether to strip non-JSON prefix from error responses (default `true`)
- `_cache` — generic key-value cache (not yet wired into modules)

Each API domain is exposed as a property on `Client`:

| Property   | Module Class      | Source              |
|------------|-------------------|---------------------|
| `messages` | `MessagesModule`  | `src/messages/`     |
| `ask`      | `AskModule`       | `src/ask/`          |
| `forum`    | `ForumModule`     | `src/forum/`        |
| `drawing`  | `DrawingModule`   | `src/drawing/`      |
| `answer`   | `AnswerModule`     | `src/answer/`       |
| `notify`   | `NotifyModule`    | `src/notify/`       |
| `account`  | `AccountModule`   | `src/account/`      |
| `auth`     | `AuthModule`      | `src/auth/`         |

### Request Lifecycle

1. A module method (e.g., `client.messages.folderView()`) calls `this.client._call(ResponseClass, methodName, args)`.
2. `_call` constructs a `MethodCall` object `{ fn: methodName, payload: args }`.
3. **If batching** (`client.isBatching === true`): the call is pushed onto `#requestQueue` and returns a `Promise`. When `client.endBatch()` or `client.processBatch()` is called, all queued calls are sent in a single HTTP request.
4. **If not batching**: a single-request body `{ auth, requests: [methodCall] }` is sent immediately.
5. The HTTP POST targets `https://twocansandstring.com/api` with `Content-Type: application/json` and `Cookie: twocansandstring_com_auth2=<token>` if authenticated.
6. The response is parsed as JSON (with optional error-prefix trimming via `shouldTrimErrors`).
7. The raw response data (`TCResponseRaw`) is unpacked and passed to the `ResponseClass` constructor, which extracts the relevant fields.
8. Any `profiles` in the response are cached into `client.profileCache`.

### Response Type Pattern

All response classes extend `TCResponse` (defined in `src/types/index.ts`):

```typescript
export class TCResponse {
    public ok: boolean;
    public error?: string;
    public profiles?: TCProfile[];
    public constructor(response: TCResponseRaw) { ... }
    public toObject(): {[key: string]: any} { ... }
}
```

Each module's `types.ts` defines subclasses that parse the raw response. For example:

```typescript
export class ListDataResponse extends TCResponse {
    public questions: QuestionMetadata[];
    public constructor(res: TCResponseRaw) {
        super(res);
        this.questions = (res["questions"] ?? []).map(m => new QuestionMetadata(m));
    }
}
```

The module's `index.ts` passes the subclass constructor to `_call`:

```typescript
return await this.client._call(ListDataResponse, "legacy.askapi", { ... });
```

### Batching

The Client supports request batching to reduce HTTP overhead:

```typescript
client.beginBatch();
const p1 = client.messages.folderView();
const p2 = client.notify.sync(Feature.ASK);
client.endBatch(); // sends both requests in one HTTP call
const [r1, r2] = await Promise.all([p1, p2]);
```

### Barrel Exports

`src/index.ts` uses a dual-export pattern for each domain:
- The module class is re-exported directly: `export * from "./messages"`
- The types are re-exported as a namespace: `export * as messages from "./messages/types"`

This gives consumers both `MessagesModule` and `messages.FolderViewResponse` access patterns.

## Module Convention

Each API domain follows this structure:

```
src/<domain>/
├── index.ts     # <Domain>Module extends Module — API methods
└── types.ts     # Response classes (extend TCResponse), request/response interfaces, enums
```

### Adding a New Module

1. Create `src/<domain>/types.ts` with response classes extending `TCResponse`.
2. Create `src/<domain>/index.ts` with a `<Domain>Module extends Module` class. Use `this.client._call()` to make API calls.
3. Add the module as a private field and getter in `Client` (`src/client.ts`), instantiate it in the constructor.
4. Add exports to `src/index.ts`:
   ```typescript
   export * from "./<domain>";
   export * as <domain> from "./<domain>/types";
   ```
5. Run `npm run build` to verify jsii compilation.

## jsii Constraints & Gotchas

Pecans uses [jsii](https://github.com/aws/jsii) for cross-language compilation. This imposes significant constraints on the TypeScript source:

### Allowed Features
- Classes, interfaces, enums (non-const)
- Public properties and methods
- `@internal` JSDoc annotation (excludes from generated docs/bindings)
- Optional properties (`?`)
- `readonly` properties
- Constructor overloads (limited)

### Forbidden / Restricted Features
- **Private identifier syntax (`#field`)**: jsii does not support ECMAScript private fields. Use `private` keyword instead for jsii-compatible code. Note: the current codebase already uses `#field` in `Client` and `Module` — this works because jsii only checks the public API surface, but these fields are inaccessible to language bindings.
- **Arrow functions as exported members**: jsii requires all exported methods to be regular methods.
- **Generic methods on exported classes**: jsii does not support generics on classes.
- **`as const` assertions on enums**: Use regular enums instead.
- **Dynamic imports / `require()`**: Not supported.
- **Mixed default/named exports**: Use only named exports.
- **Namespace merging or declaration merging**: Not supported.
- **`static` blocks in classes**: Not supported.
- **`type` imports for values**: jsii needs to see the value form.

### Test File Handling
- Test files (`*.test.ts`) are excluded from jsii via `package.json`:
  ```json
  "jsii": { "excludeTypescript": ["**/*.test.ts"] }
  ```
- The `tsconfig.json` also excludes `**/*.test.ts`.

### jsii Build Targets
- **Python**: `pecans` (module name), distributed via dist
- **.NET**: `Pecans` namespace and package ID
- Java target is not currently configured but jsii supports it

## Work-in-Progress / Incomplete Areas

### Empty Files
- `src/queue.ts` — Empty. Appears to be planned for request queuing/rate-limiting but not implemented.
- `src/legacy/index.ts` — Empty. Planned for legacy API endpoints.

### Unused Code
- `src/cache.ts` — Defines a generic `Cache<T>` class with TTL support, but no module currently uses it. The `Client._cache` property exists but is never read.
- `src/client.ts` references to `#requestQueue` — The batching system is implemented but uses a simple `QueuedCall[]` array rather than the `Cache` class.

### Commented-Out Code
- `src/messages/types.ts` contains large blocks of commented-out alternative implementations for `Message` and `MessagePreview` classes (lines 78–229). These appear to be older iterations with rich client-aware objects (`this.context = context`).

### TODOs in Source
- `src/forum/index.ts:8` — `fetchType: string` should be an enum (`// TODO: make this an enum`)
- `src/forum/types.ts:43` — `Thread.category` is commented out (`// TODO: add category`)
- `src/types/index.ts:41` — `// TODO: move this to another file` referring to `TCUser` and `TCProfile`

### API Method Names Using Legacy Prefix
- `AskModule` calls `"legacy.askapi"` — this is the actual API method name, not a code smell, but worth noting since other modules use the standard `domain.method` pattern (e.g., `"messages.folderview"`, `"forum.viewposts"`).

## Testing

Tests use [Vitest](https://vitest.dev/) and are colocated next to the source they test:

| Test File                        | Tests                                               |
|----------------------------------|------------------------------------------------------|
| `src/types/index.test.ts`        | TCResponse serialization, poll option parsing        |
| `src/ask/index.test.ts`          | QuestionMetadata parsing, ListDataResponse, fetchQuestions |
| `src/notify/types.test.ts`       | NotifySyncResponse parsing                          |
| `src/answer/types.test.ts`       | AnswerReplyResponse and AnswerQueueQuestionResponse parsing |

Test files are excluded from jsii builds via `excludeTypescript` and `tsconfig.json`.

**Test pattern**: Construct response classes directly with a `TCResponseRaw` object, then assert properties:

```typescript
const raw: TCResponseRaw = { ok: true, count: 6 };
const response = new NotifySyncResponse(raw);
expect(response.count).toBe(6);
```

Note: There are currently no integration/E2E tests — all tests are unit tests for type parsing. The `npm test` script still echoes `"Error: no test specified"` and needs to be updated to run vitest.

## Build & Development Commands

| Command            | Description                                           |
|--------------------|-------------------------------------------------------|
| `npm run build`   | Compile with jsii (`jsii --strict`)                  |
| `npm run dist`    | Build + generate language packages (`jsii-pacmak`)   |
| `npm run clean`    | Remove `dist/` and `obj/`                            |
| `npx vitest run`   | Run unit tests                                        |
| `npx vitest`       | Run tests in watch mode                              |

Build outputs:
- `obj/` — Intermediate JavaScript + TypeScript declarations
- `dist/` — Language-specific packages (Python wheel, .NET package, etc.)
- `.jsii` — jsii assembly manifest (auto-generated)