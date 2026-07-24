import "../lib/main.tsp";

namespace Pecans;

interface Account {
  @rpc("account.register")
  @constant(#{ age: true, tos: true })
  register(
    email: string,
    username: string,
    @encodedName("application/json", "password1") @also("password2") password: string,
  ): TCResponse;

  @rpc("account.activate")
  activate(token: string): TCResponse;
}
