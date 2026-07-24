import "../lib/main.tsp";

namespace Pecans;

model LoginResponse extends TCResponse {
  success: boolean;
  authToken: string;
  yourId: string;
}

interface Auth {
  @rpc("auth.login")
  login(
    @encodedName("application/json", "nameOrEmail") username: string,
    password: string,
    client?: string = "web",
  ): LoginResponse;
}
