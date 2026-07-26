import "../lib/main.tsp";

namespace Pecans;

/**
 * One line of text on a story. The color is normalized to an `Rgb` struct in
 * both directions, though the wire form is asymmetric: a packed 0xRRGGBB
 * integer when creating a story, an `[r, g, b]` tuple when reading one back.
 */
model StoryLine {
  /** The line's text content. */
  value: string;

  /** The line's color. */
  @rgb("packed", "tuple") color: Rgb;
}

/** The three lines of text composing a story. */
model StoryText {
  top: StoryLine;
  middle: StoryLine;
  bottom: StoryLine;
}

/** The background of a story, as sent when creating one. */
model StoryBackgroundInput {
  /** Background kind, e.g. "image". */
  type: string;

  /** Image id, present when `type` is "image". */
  image?: string;
}

/** The background of a story, as returned by the view list. */
model StoryBackground {
  /** True when the background is an image rather than a solid color. */
  isImage: boolean;

  /** Image id, present when `isImage` is true. */
  imageId?: string;
}

/** A story shown in the stories tray. */
model Story {
  /** Id of the user whose story this is. */
  userId: string;

  /** The story's background. */
  background: StoryBackground;

  /** The story's three lines of text. */
  text: StoryText;
}

model StoriesViewListResponse extends TCResponse {
  stories: Story[];
}

model FerrytellCreateResponse extends TCResponse {
  /** Id of the newly created story. */
  storyId: safeint;
}

interface Stories {
  /**
   * List the stories currently visible to you.
   */
  @rpc("stories.viewlist")
  viewList(): StoriesViewListResponse;

  /**
   * Create a new story ("ferrytell").
   *
   * @param text The three lines of text and their colors.
   * @param bg The story background.
   */
  @rpc("ferrytell.create")
  create(text: StoryText, bg: StoryBackgroundInput): FerrytellCreateResponse;
}
