import "../lib/main.tsp";

namespace Pecans;

model PollOptionRaw {
  n: int32;
  c: int32;
}

model PollMetadataRaw {
  id: safeint;
  options: PollOptionRaw[];
}

model QuestionMetadata {
  id: safeint;
  @encodedName("application/json", "ia") isActive: boolean;
  @encodedName("application/json", "r") replyCount: int32;
  @encodedName("application/json", "nr") newReplyCount: int32;
  @encodedName("application/json", "it") expireTime: safeint;
  @encodedName("application/json", "at") creationTime: safeint;
  @encodedName("application/json", "p") isPinned: boolean;
  @encodedName("application/json", "t") questionType: "text" | "poll";
}

model QuestionText {
  id: safeint;
  @encodedName("application/json", "b") text: string;
}

model ListDataResponse extends TCResponse {
  questions: QuestionMetadata[];
}

model QuestionTextResponse extends TCResponse {
  questions: QuestionText[];
}

// join product of QuestionText body + its QuestionMetadata header
model QuestionData {
  body: string;
  header: QuestionMetadata;
}

interface Ask {
  @rpc("legacy.askapi")
  @constant(#{
    name: "listdata",
    arg1: "0",
    arg2: "none",
    arg3: "0",
    rawEmbeddedJsonLolInternalTechDebt: null,
  })
  listData(): ListDataResponse;

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
}
