import "../lib/main.tsp";

namespace Pecans;

model LoginResponse extends TCResponse {
  success: boolean;
  authToken: string;
  yourId: string;
}

model ExistingCookieResponse extends TCResponse {
  success: boolean;
  yourId: string;
}

model LogoutResponse extends TCResponse {
  success: boolean;

  @fromResult("RIPtoken") ripToken: string;

  @fromResult("usr") user: string;
}

interface Auth {
  /**
   * Log in to the Two Cans & String service.
   *
   * @param username The username or email address of the user.
   * @param password The password of the user.
   * @param client The client type, defaulting to "web".
   * @returns A LoginResponse object containing the result of the login attempt.
   */
  @rpc("auth.login")
  login(
    @encodedName("application/json", "nameOrEmail") username: string,
    password: string,
    client?: string = "web",
  ): LoginResponse;

  /**
   * Check if an existing authentication cookie is valid and refresh it if
   * necessary.
   *
   * @param cookie The authentication cookie to check.
   * @returns An ExistingCookieResponse object indicating whether the cookie is valid.
   */
  @rpc("auth.existingcookie")
  existingCookie(cookie: string): ExistingCookieResponse;

  /**
   * Log out of the Two Cans & String service.
   *
   * @returns A LogoutResponse object indicating the result of the logout attempt.
   */
  @rpc("auth.logout")
  logout(): LogoutResponse;
}
