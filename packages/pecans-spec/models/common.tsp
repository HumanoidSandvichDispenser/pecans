namespace Pecans;

model TCFollowInfo {
  in: int32;
  out: int32;
}

model TCProfile {
  id: string;
  name: string;
  online: int32;
  avatar: string;
  subs: TCFollowInfo;

  /** Only present on moderator/admin accounts. */
  admin?: boolean;
}

model TCResponse {
  ok: boolean;
  error?: string;
  profiles?: TCProfile[];
}

model TCUser {
  id?: string;
  anon?: boolean;
}

/**
 * An RGB color, normalized from whatever encoded form the Twocans API uses.
 */
model Rgb {
  r: int32;
  g: int32;
  b: int32;
}
