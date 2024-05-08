import { Module } from "../module";
import { TCResponse } from "../types";
import { SaveDrawingResponse, ViewDrawingDataResponse } from "./types";

export class DrawingModule extends Module {
    public async saveDrawing(data: string, makeActive = false) {
        this.client._call(
            // newImageId: string
            SaveDrawingResponse,
            "legacy.drawing",
            {
                action: "save",
                data,
                makeActive,
            }
        );
    }

    public async viewDrawingData(imageId: string) {
        // response { ok: boolean , pixelData: string }
        this.client._call(
            // newImageId: string
            ViewDrawingDataResponse,
            "legacy.drawing",
            {
                action: "initial-image-data",
                imageId,
            }
        );
    }

    public async sendDrawing(imageId: string, receiver: string) {
        this.client._call(
            TCResponse,
            "drawing.send",
            {
                imageId,
                receiver,
            }
        );
    }
}
