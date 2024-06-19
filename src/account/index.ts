import { Module } from "../module";
import { TCResponse } from "../types";

export class AccountModule extends Module {
    public async register(email: string, username: string, password: string) {
        return await this.client._call(
            TCResponse,
            "account.register",
            {
                age: true,
                email,
                password1: password,
                password2: password,
                tos: true,
                username,
            }
        );
    }

    public async activate(token: string) {
        return await this.client._call(
            TCResponse,
            "account.activate",
            {
                token,
            }
        );
    }
} 
