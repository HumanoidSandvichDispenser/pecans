import "../lib/main.tsp";

namespace Pecans;

model ImageData {
  id: string;
  data: string;
}

model ImageBatchGetResponse extends TCResponse {
  items: ImageData[];
}

model ImageRef {
  id: string;
}

model ImageGalleryListResponse extends TCResponse {
  images: ImageRef[];
  hasMore: boolean;
}

model ImageInfoResponse extends TCResponse {
  imageId: string;
  owner: string;
  isYours: boolean;
}

interface Images {
  @rpc("images.batchget")
  batchGet(ids: string[]): ImageBatchGetResponse;

  @rpc("images.gallerylist")
  galleryList(page?: safeint = 1, deleted?: boolean = false): ImageGalleryListResponse;

  @rpc("images.info")
  info(imageId: string): ImageInfoResponse;
}
