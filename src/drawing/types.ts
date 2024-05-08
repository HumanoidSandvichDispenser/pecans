import { TCResponse, TCResponseRaw } from "../types";

export class SaveDrawingResponse extends TCResponse {
    public newImageId: string;

    public constructor(res: TCResponseRaw) {
        super(res);
        this.newImageId = res["newImageId"];
    }
}

export class ViewDrawingDataResponse extends TCResponse {
    public data: string;

    public constructor(res: TCResponseRaw) {
        super(res);
        this.data = res["data"];
    }
}
