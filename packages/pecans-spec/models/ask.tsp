import "../lib/main.tsp";

namespace Pecans;

const ASKAPI_NULL = #{ rawEmbeddedJsonLolInternalTechDebt: null };

const ASKAPI_ARG1 = #{ arg2: "0", arg3: "0", rawEmbeddedJsonLolInternalTechDebt: null };

model PollOptionRaw {
  /** Number of votes this option has received. */
  n: int32;

  /** Option index or choice id. */
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

/** A single question as seen on its public view page. */
model ViewQuestionResponse extends Question {
  /** Whether the question was asked publicly (non-anonymously). */
  isPublic: boolean;

  /** Number of responses the question has received. */
  @encodedName("application/json", "responses") responseCount: int32;

  /** Username of the asker, present only when the question is public. */
  user?: string;

  /** Whether the current user is the asker. */
  isYours: boolean;
}

/** One answer to a question you asked, as returned by `getAnswers`. */
model QuestionAnswer {
  id: safeint;

  /** The answer body text (UCP markup). */
  @encodedName("application/json", "b") body: string;

  /** Unix time the answer was posted. */
  @encodedName("application/json", "t") time: safeint;

  /** Id of the question this answers. */
  @encodedName("application/json", "q") questionId: safeint;

  /** Id of the conversation spawned from this answer, or 0 if none. */
  @encodedName("application/json", "mc") convoId: safeint;

  /** Whether the answer is unread. */
  @encodedName("application/json", "in") unread: boolean;
}

/** A page of answers to a question you asked. */
model AnswersResponse extends TCResponse {
  answers: QuestionAnswer[];

  /** Whether more answers exist beyond this page. */
  hasMore: boolean;

  /** Cursor id for fetching the next page. */
  nextId: safeint;
}

/** The result of pinning or unpinning a question. */
model PinToggleResponse extends TCResponse {
  /** The question's new pinned state. */
  status: boolean;
}

/** The result of bumping a question. */
model BumpQuestionResponse extends TCResponse {
  /** The question's new expiry (inactive) time. */
  @encodedName("application/json", "it") expireTime: safeint;
}

/** One answer/response, fetched by its answer id. */
model GetResponseResponse extends TCResponse {
  /** Id of the question this answers. */
  questionId: safeint;

  /** The answer body text (UCP markup). */
  text: string;

  /** Id of the conversation spawned from this answer, if any. */
  convoHeaderId?: safeint;
}

/** A fully populated question with metadata and body text. */
model QuestionData {
  /** The question's body text. */
  @fromResult("text") body: string;

  /** The question's header metadata. */
  @fromInput header: QuestionMetadata;
}

/** One choice in a new poll question. */
model NewPollChoice {
  /** Display label for the choice. */
  label: string;

  /** 6-digit hex color (no leading `#`), e.g. "ff0000", or the name of a color. */
  color: string;
}

/** The poll attached to a new poll-type question. */
model NewPoll {
  choices: NewPollChoice[];
}

/**
 * The body of a new question, serialized as JSON into the legacy askapi's
 * `rawEmbeddedJsonLolInternalTechDebt` field.
 */
model PostQuestionBody {
  /** The question text. */
  text: string;

  /** Whether the question was asked publicly (non-anonymously). */
  isPublic: boolean;

  /** Whether the question carries a poll. */
  hasPoll: boolean;

  /** The poll definition, present only when `hasPoll` is true. */
  poll?: NewPoll;
}

interface Ask {
  /**
   * Ask a new question, optionally with a poll.
   *
   * @param body The question text, visibility, and optional poll.
   */
  @rpc("legacy.askapi")
  @constant(#{
    name: "postquestion",
    arg1: "undefined",
    arg2: "undefined",
    arg3: "undefined",
  })
  postQuestion(@embed("rawEmbeddedJsonLolInternalTechDebt") body: PostQuestionBody): TCResponse;

  /**
   * View a single question by id (its public view page).
   *
   * @param questionId Id of the question to view.
   */
  @rpc("ask.viewquestion")
  viewQuestion(questionId: safeint): ViewQuestionResponse;

  /**
   * Fetch a single answer/response by its answer id.
   *
   * @param answerId Id of the answer to fetch.
   */
  @rpc("ask.getresponse")
  getResponse(answerId: safeint): GetResponseResponse;

  /**
   * Reply to an answer, creating a new conversation/direct message thread.
   *
   * @param answerId Id of the answer being replied to.
   * @param content Body text of the reply.
   * @param unanonymize Reveal your identity in the conversation.
   */
  @rpc("ask.startconversation")
  startConversation(
    answerId: safeint,
    content: string,
    unanonymize?: boolean = false,
  ): TCResponse;

  /**
   * Fetch a page of answers to a question you asked.
   *
   * @param questionId Id of the question whose answers to fetch.
   * @param mode Paging mode: "expand" (initial), "expandmore" (older), or
   *   "inject" (newer than `refId`).
   * @param refId Cursor answer id the mode pages relative to (0 for none).
   */
  @rpc("legacy.askapi")
  @constant(#{ ...ASKAPI_NULL, name: "getanswers" })
  getAnswers(
    @encodedName("application/json", "arg1") @stringify questionId: safeint,
    @encodedName("application/json", "arg2") mode: string,
    @encodedName("application/json", "arg3") @stringify refId: safeint,
  ): AnswersResponse;

  /**
   * Pin or unpin a publicly-asked question to your profile.
   *
   * @param questionId Id of the question to pin/unpin.
   * @param pinned True to pin, false to unpin.
   */
  @rpc("legacy.askapi")
  @constant(#{ ...ASKAPI_NULL, name: "pintoggle", arg3: "0" })
  pinToggle(
    @encodedName("application/json", "arg1") @stringify questionId: safeint,
    @encodedName("application/json", "arg2") @stringify pinned: boolean,
  ): PinToggleResponse;

  /**
   * Bump a question from inactive to active.
   *
   * @param questionId Id of the question to bump.
   */
  @rpc("legacy.askapi")
  @constant(#{ ...ASKAPI_ARG1, name: "bumpquestion" })
  bumpQuestion(
    @encodedName("application/json", "arg1") @stringify questionId: safeint,
  ): BumpQuestionResponse;

  /**
   * Delete a question.
   *
   * @param questionId Id of the question to delete.
   */
  @rpc("legacy.askapi")
  @constant(#{ ...ASKAPI_ARG1, name: "deleteques" })
  deleteQuestion(
    @encodedName("application/json", "arg1") @stringify questionId: safeint,
  ): TCResponse;

  /**
   * Delete an answer to a question.
   *
   * @param answerId Id of the answer to delete.
   */
  @rpc("legacy.askapi")
  @constant(#{ ...ASKAPI_ARG1, name: "deleteanswer" })
  deleteAnswer(
    @encodedName("application/json", "arg1") @stringify answerId: safeint,
  ): TCResponse;

  /**
   * Mark an answer as read.
   *
   * @param answerId Id of the answer to mark read.
   */
  @rpc("legacy.askapi")
  @constant(#{ ...ASKAPI_ARG1, name: "markanswerread" })
  markAnswerRead(
    @encodedName("application/json", "arg1") @stringify answerId: safeint,
  ): TCResponse;

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
