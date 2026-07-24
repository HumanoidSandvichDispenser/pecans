import "../lib/main.tsp";

namespace Pecans;

model SaveDrawingResponse extends TCResponse {
  newImageId: string;
}

model ViewDrawingDataResponse extends TCResponse {
  data: string;
}

interface Drawing {
  @rpc("legacy.drawing")
  @constant(#{ action: "save" })
  saveDrawing(data: string, makeActive?: boolean = false): SaveDrawingResponse;

  @rpc("legacy.drawing")
  @constant(#{ action: "initial-image-data" })
  viewDrawingData(imageId: string): ViewDrawingDataResponse;

  @rpc("drawing.send")
  sendDrawing(imageId: string, receiver: string): TCResponse;

  @rpc("drawing.setactive")
  setActive(imageId: string): TCResponse;
}
