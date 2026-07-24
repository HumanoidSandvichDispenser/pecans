import "../lib/main.tsp";

namespace Pecans;

model SaveDrawingResponse extends TCResponse {
  /** Id of the newly-created image, e.g. `img45790`. */
  newImageId: string;
}

model ViewDrawingDataResponse extends TCResponse {
  /** The raw pixel data: a flat hex string, 32×32, RGB, 6 hex chars per pixel, row-major. */
  data: string;
}

interface Drawing {
  /**
   * Save a drawing and return its image id.
   *
   * @param data Flat hex pixel string: 32×32, RGB, 6 hex chars per pixel, row-major
   * (1024 pixels = 6144 chars), left-to-right then top-to-bottom.
   * @param makeActive Set this drawing as your active image immediately on save.
   * @returns The id of the newly-created image.
   */
  @rpc("legacy.drawing")
  @constant(#{ action: "save" })
  saveDrawing(data: string, makeActive?: boolean = false): SaveDrawingResponse;

  /**
   * Fetch the raw pixel data for an existing image, for editing or inspection.
   *
   * @param imageId The image to load, e.g. `img45790`.
   * @returns The image's flat hex pixel data.
   */
  @rpc("legacy.drawing")
  @constant(#{ action: "initial-image-data" })
  viewDrawingData(imageId: string): ViewDrawingDataResponse;

  /**
   * Send one of your drawings to another user.
   *
   * @param imageId The image to send.
   * @param receiver Username of the recipient.
   */
  @rpc("drawing.send")
  sendDrawing(imageId: string, receiver: string): TCResponse;

  /**
   * Set which of your saved images is the active one.
   *
   * @param imageId The image to make active.
   */
  @rpc("drawing.setactive")
  setActive(imageId: string): TCResponse;
}
