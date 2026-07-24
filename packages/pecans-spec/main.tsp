import "@typespec/json-schema";
import "./lib/main.tsp";
import "./models/common.tsp";
import "./models/forum.tsp";
import "./models/feed.tsp";
import "./models/messages.tsp";
import "./models/drawing.tsp";
import "./models/images.tsp";
import "./models/notify.tsp";
import "./models/auth.tsp";
import "./models/account.tsp";
import "./models/answer.tsp";
import "./models/ask.tsp";

using TypeSpec.JsonSchema;

@@jsonSchema(Pecans);
