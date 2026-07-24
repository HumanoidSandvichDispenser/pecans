import "../lib/main.tsp";

namespace Pecans;

model ImageData {
  /** Image id, e.g. `img45788`. */
  id: string;

  /** Base64-encoded PNG, prefixed with the literal string `B64`. */
  data: string;
}

model ImageBatchGetResponse extends TCResponse {
  /** The requested images, in no guaranteed order. */
  items: ImageData[];
}

model ImageRef {
  /** Image id, e.g. `img45788`. */
  id: string;
}

model ImageGalleryListResponse extends TCResponse {
  /** Ids of the images on this page. */
  images: ImageRef[];

  /** Whether further pages exist beyond this one. */
  hasMore: boolean;
}

model ImageInfoResponse extends TCResponse {
  imageId: string;

  /** Username of the image's owner. */
  owner: string;

  /** Whether the active account owns this image. */
  isYours: boolean;
}

interface Images {
  /**
   * Fetch one or more images by id as base64-encoded PNGs.
   *
   * @param ids Image ids to fetch, e.g. `["img45788"]`.
   * @returns The matching images with their base64 PNG data.
   */
  @rpc("images.batchget")
  batchGet(ids: string[]): ImageBatchGetResponse;

  /**
   * List the active account's own saved images, most-recent first.
   *
   * @param page 1-based page number.
   * @param deleted Whether to list deleted images instead of live ones.
   * @returns A page of image ids and a flag for whether more pages remain.
   */
  @rpc("images.gallerylist")
  galleryList(page?: safeint = 1, deleted?: boolean = false): ImageGalleryListResponse;

  /**
   * Look up ownership metadata for a single image.
   *
   * @param imageId The image to inspect.
   * @returns The image's owner and whether the active account owns it.
   */
  @rpc("images.info")
  info(imageId: string): ImageInfoResponse;
}
