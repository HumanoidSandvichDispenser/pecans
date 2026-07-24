import "../lib/main.tsp";

namespace Pecans;

model PollOptionRaw {
  /** Number of votes this option has received. */
  n: int32;

  /** Option index / choice id. */
  c: int32;
}

model PollMetadataRaw {
  id: safeint;
  options: PollOptionRaw[];
}

/**
 * The header for one question: everything except the question body itself.
 * Returned by `listData`; the body is fetched separately via `qtext`.
 */
model QuestionMetadata {
  id: safeint;

  /** Whether the question is still activate. */
  @encodedName("application/json", "ia") isActive: boolean;

  /** Total number of replies. */
  @encodedName("application/json", "r") replyCount: int32;

  /** Total number of new replies (not yet marked as read). */
  @encodedName("application/json", "nr") newReplyCount: int32;

  /** Unix time at which the question closes. */
  @encodedName("application/json", "it") expireTime: safeint;

  /** Unix time at which the question was asked. */
  @encodedName("application/json", "at") creationTime: safeint;

  /** Whether the question is pinned to the user's profile. */
  @encodedName("application/json", "p") isPinned: boolean;

  /** Whether this is a free-text question or a poll. */
  @encodedName("application/json", "t") questionType: "text" | "poll";
}

model QuestionText {
  id: safeint;

  /** The question's body text. */
  @encodedName("application/json", "b") text: string;
}

model ListDataResponse extends TCResponse {
  /** Question headers, without their body text. */
  questions: QuestionMetadata[];
}

model QuestionTextResponse extends TCResponse {
  /** Question bodies, keyed by id. */
  questions: QuestionText[];
}

/** A fully populated question with metadata and  body text. */
model QuestionData {
  /** The question's body text. */
  @fromResult("text") body: string;

  /** The question's header metadata. */
  @fromInput header: QuestionMetadata;
}

interface Ask {
  /**
   * List all question headers without body text.
   *
   * Use `fetchQuestions` to also pull the bodies in one step.
   *
   * @returns The question headers.
   */
  @rpc("legacy.askapi")
  @constant(#{
    name: "listdata",
    arg1: "0",
    arg2: "none",
    arg3: "0",
    rawEmbeddedJsonLolInternalTechDebt: null,
  })
  listData(): ListDataResponse;

  /**
   * Fetch the body text for a batch of questions by id.
   *
   * @param ids Question ids to fetch bodies for.
   * @returns The requested question bodies.
   */
  @rpc("legacy.askapi")
  @constant(#{
    name: "qtext",
    arg2: "0",
    arg3: "0",
    rawEmbeddedJsonLolInternalTechDebt: null,
  })
  qtext(
    @encodedName("application/json", "arg1")
    @join("x")
    ids: safeint[],
  ): QuestionTextResponse;

  /**
   * Fetch each question's body and zip it onto its header, keyed by id.
   *
   * A convenience method for fetching a batch of questions in one step, rather
   * than calling `listData` and then `qtext` separately.
   *
   * @param metadata Question headers to hydrate, e.g. from `listData`.
   * @returns Each header paired with its body text.
   */
  @zip(#{ call: "qtext", input: "metadata", project: "id", key: "id", results: "questions" })
  fetchQuestions(metadata: QuestionMetadata[]): QuestionData[];
}
