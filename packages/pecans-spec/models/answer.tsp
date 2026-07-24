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

model QuestionFetchResponse extends TCResponse {
  id: safeint;
  time: safeint;
  text: string;
  author?: string;
  poll?: Poll;
}

model AnswerQueueQuestionResponse extends TCResponse {
  id: safeint;
  time: safeint;
  text: string;
  author?: string;
  poll?: Poll;
}

interface Answer {
  @rpc("answer.getnext")
  fetchNext(): QuestionFetchResponse;

  @rpc("answer.dismissquestion")
  dismissQuestion(questionId: safeint, action: DismissAction): TCResponse;

  @rpc("answer.pollvote")
  pollVote(questionId: safeint, optionNum: int32): TCResponse;

  @rpc("answer.queuequestion")
  queueQuestion(questionId: safeint): AnswerQueueQuestionResponse;

  @rpc("answer.reply")
  reply(questionId: safeint, text: string): AnswerReplyResponse;
}
