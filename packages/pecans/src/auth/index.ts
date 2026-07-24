import { Module } from "../module";
import { LoginResponse } from "./types";

export class AuthModule extends Module {
    public async login(username: string, password: string, client = "web") {
        return await this.client._call(
            LoginResponse,
            "auth.login",
            {
                client,
                nameOrEmail: username,
                password,
            }
        );
    }
} 
