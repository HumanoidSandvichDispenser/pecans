import "../lib/main.tsp";

namespace Pecans;

model SettingsGetResponse extends TCResponse {
  /** The account's email address. */
  email: string;

  /** Whether to send notifications for new private messages. */
  msgNotify: boolean;

  /** Whether to hide the sender identity on anonymous messages. */
  msgHideAnon: boolean;
}

interface Settings {
  /**
   * Fetch the current account settings.
   *
   * @returns The account's email and message preferences.
   */
  @rpc("legacy.settingsget")
  get(): SettingsGetResponse;

  /**
   * Save account settings. Sends the full settings each time, so pass the current
   * values for anything you're not changing. Leave the password fields empty to
   * keep the current password.
   *
   * @param email Account email address.
   * @param msgNotify Whether to notify on new private messages.
   * @param msgHideAnon Whether to hide sender identity on anonymous messages.
   * @param pwOld Current password, required only when changing it.
   * @param pwNew New password, when changing it.
   */
  @rpc("legacy.settingsset")
  set(
    email: string,
    msgNotify: boolean,
    msgHideAnon: boolean,
    pwOld?: string = "",
    @encodedName("application/json", "pwNew1") @also("pwNew2") pwNew?: string = "",
  ): TCResponse;
}
