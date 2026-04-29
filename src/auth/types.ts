import { TCResponse, TCResponseRaw } from "../types";

export class LoginResponse extends TCResponse {
    public success: boolean;
    public authToken: string;
    public yourId: string;

    public constructor(res: TCResponseRaw) {
        super(res);
        this.success = res["success"];
        this.authToken = res["authToken"];
        this.yourId = res["yourId"];
    }
}
