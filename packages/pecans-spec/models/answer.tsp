import "../lib/main.tsp";

namespace Pecans;

enum DismissAction {
  SNOOZE: "SNOOZE",
  DISCARD: "DISCARD",
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

interface Answer {
  @rpc("answer.getnext")
  fetchNext(): AnswerQuestion;

  @rpc("answer.dismissquestion")
  dismissQuestion(questionId: safeint, action: DismissAction): TCResponse;

  @rpc("answer.pollvote")
  pollVote(questionId: safeint, optionNum: int32): TCResponse;

  @rpc("answer.queuequestion")
  queueQuestion(questionId: safeint): AnswerQuestion;

  @rpc("answer.reply")
  reply(questionId: safeint, text: string): AnswerReplyResponse;
}
