import "../lib/main.tsp";

namespace Pecans;

model NavItem {
  /** Stable id for the destination, e.g. `feed`, `forum`. */
  id: string;

  /** Path the item links to, e.g. `/forum`. */
  url: string;

  /** Human-readable label, e.g. `Home Feed`. */
  label: string;

  /** Image id for the item's icon. */
  icon: string;

  /** Notification feature key to badge this item against, if any. */
  notify?: string;
}

model NavbarGetResponse extends TCResponse {
  /** The navigation items, in display order. */
  nav: NavItem[];
}

interface Navbar {
  /**
   * Fetch the site navigation items for the current user.
   *
   * @returns The navigation items, in display order.
   */
  @rpc("navbar.get")
  get(): NavbarGetResponse;
}
