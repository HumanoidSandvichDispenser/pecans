namespace Pecans;

model QuestionMetadataRaw {
  id: safeint;
  ia: boolean;
  r: int32;
  nr: int32;
  it: safeint;
  la: safeint;
  at: safeint;
  p: boolean;
  pn: boolean;
  t: string;
}

model QuestionTextRaw {
  id: safeint;
  b: string;
}

model PollOptionRaw {
  n: int32;
  c: int32;
}

model PollMetadataRaw {
  id: safeint;
  options: PollOptionRaw[];
}

model ListDataResponse extends TCResponse {
  questions: QuestionMetadataRaw[];
}

model QuestionTextResponse extends TCResponse {
  questions: QuestionTextRaw[];
}

model QuestionMetadata {
  id: safeint;
  isActive: boolean;
  replyCount: int32;
  newReplyCount: int32;
  expireTime: safeint;
  creationTime: safeint;
  isPinned: boolean;
  questionType: "text" | "poll";
}

model QuestionText {
  id: safeint;
  text: string;
}
