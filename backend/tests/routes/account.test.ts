import { test, expect, describe } from "bun:test";
import { supabase, testApp } from "./setup";
import { fullCleanUp } from "../database/test_helpers";

// Clear tables before running tests
if (await fullCleanUp(supabase) == false)
    throw new Error("Could not clean up supabase for account.test.ts");

describe("Account tests", () => {
    let accessToken: string;
    let refreshToken: string;
    let createdAccount: boolean = false;

    test("Create an account", async () => {
        const response = await fetch("http://localhost:3000/api/account/signup", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: "johndoe@umass.edu",
                password: "123456",
                name: "John Doe"
            })
        });
        expect(response.status).toBe(201);
        const sessionTokens = response.headers.get("Set-Session-Tokens")
        expect(sessionTokens).not.toBeNull();
        const tokens: string[] = (sessionTokens as string).split(" ", 2);
        expect(tokens.length).toBe(2);
        [ accessToken, refreshToken ] = tokens as [string, string];
        createdAccount = true;
    });

    test("Get account", async () => {
        const response = await fetch('localhost:3000/api/account', {
        method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken} ${refreshToken}`
            }
        });

        expect(response.status).toBe(200);
    });

    test("Login fail", async () => {
        const response = await fetch("http://localhost:3000/api/account/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: "johndoe@umass.edu",
                password: "654321",
            })
        });
        expect(response.status).toBe(400);
        expect(response.headers.keys()).not.toContain("Set-Session-Tokens");
    });

    test("Login success", async () => {
        const response = await fetch("http://localhost:3000/api/account/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: "johndoe@umass.edu",
                password: "123456",
            })
        });
        expect(response.status).toBe(201);
        const sessionTokens = response.headers.get("Set-Session-Tokens")
        expect(sessionTokens).not.toBeNull();
        const tokens: string[] = (sessionTokens as string).split(" ", 2);
        expect(tokens.length).toBe(2);
        [ accessToken, refreshToken ] = tokens as [string, string];
        createdAccount = true;
    });

    test("Delete account", async () => {
        const response = await fetch("http://localhost:3000/api/account", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken} ${refreshToken}`
            },
        });
        expect(response.status).toBe(204);
    });

    test("Get deleted user", async () => {
        const response = await fetch("http://localhost:3000/api/user", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken} ${refreshToken}`
            },
        });
        expect(response.status).toBeGreaterThanOrEqual(400);
    });
});