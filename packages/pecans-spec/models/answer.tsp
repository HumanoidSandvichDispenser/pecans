import "../lib/main.tsp";

namespace Pecans;

enum DismissAction {
  SNOOZE: "SNOOZE",
  DISCARD: "DISCARD",
  UNSAVE: "UNSAVE",
}

model PollOption {
  text: string;
  color: string;
  votes?: int32;
  yours?: boolean;
}

model Poll {
  options: PollOption[];
  answered: boolean;
}

model AnswerReplyResponse extends TCResponse {
  id: safeint;
  time: safeint;
  text: string;
}

/**
 * A question on Two Cans & String.
 */
model Question extends TCResponse {
  id: safeint;

  /** Unix time the question was asked. */
  time: safeint;

  /** The question body text (UCP markup). */
  text: string;
}

/**
 * A question viewed on the Answer page.
 */
model AnswerQuestion extends Question {
  /** Username of the asker, present only when the question is public. */
  author?: string;

  /** The attached poll, if this is a poll-type question. */
  poll?: Poll;
}

/**
 * A question the user has saved for later, as shown on the
 * Saved Questions page.
 */
model SavedQuestion {
  /** The question id. */
  id: safeint;

  /** Short preview of the question body. */
  preview: string;
}

model SavedQuestionsResponse extends TCResponse {
  questions: SavedQuestion[];
}

interface Answer {
  /**
   * Get the next question to answer. `error` will `"END_REACHED"` if there are
   * no questions to answer.
   */
  @rpc("answer.getnext")
  fetchNext(): AnswerQuestion;

  /**
   * Get the list of questions the user has saved for later.
   */
  @rpc("answer.listsavedquestions")
  listSavedQuestions(): SavedQuestionsResponse;

  /**
   * Flag a question for review by the moderators.
   */
  @rpc("answer.flagquestion")
  flagQuestion(questionId: safeint): TCResponse;

  /**
   * Dismiss a question from the answer queue. The `action` parameter
   * determines whether the question is snoozed, discarded, or unsaved.
   */
  @rpc("answer.dismissquestion")
  dismissQuestion(questionId: safeint, action: DismissAction): TCResponse;

  /**
    * Vote on a poll question. The `optionNum` parameter is the index of the
    * option to vote for, starting at 0.
    */
  @rpc("answer.pollvote")
  pollVote(questionId: safeint, optionNum: int32): TCResponse;

  /**
   * Queue a question for answering. The question will queued to be answered by
   * the user, and will be returned by the next call to `fetchNext()`.
   */
  @rpc("answer.queuequestion")
  queueQuestion(questionId: safeint): AnswerQuestion;

  /**
   * Reply to a question. The `text` parameter is the reply text (UCP markup).
   */
  @rpc("answer.reply")
  reply(questionId: safeint, text: string): AnswerReplyResponse;
}
