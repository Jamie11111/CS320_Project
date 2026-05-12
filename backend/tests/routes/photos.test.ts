import { test, expect, describe } from "bun:test";
import path from "node:path";
import { supabase, supabaseConn } from "./setup";
import { fullCleanUp } from "../database/test_helpers";
import { generateUsers } from "./route_helpers";

// Clear tables before running tests
if (await fullCleanUp(supabase) == false)
    throw new Error("Could not clean up supabase for " + path.basename(import.meta.url));

// Generate users
const users = await generateUsers(supabaseConn, 1);

describe("Photo upload tests", () => {
    const accessToken = users[0]?.session.access_token;
    const refreshToken = users[0]?.session.refresh_token;
    test("Upload listing photo", async () => {
        const response = await fetch('localhost:3000/api/listings/photo-upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken} ${refreshToken}`,
                'File-Metadata': JSON.stringify({"filename": "test.png"})
            },
            body: new Blob(["data"], { type: "image/png" })
        });

        expect(response.status).toBe(201);
        const { filePath, publicUrl } = await response.json() as {[ key: string ]: string};
        expect(publicUrl).toContain("http");
        expect(publicUrl).toContain("supabase.co/storage");
        expect(filePath).toContain("listings");
    });

    test("Upload attachment photo", async () => {
        const response = await fetch('localhost:3000/api/chat/photo-upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken} ${refreshToken}`,
                'File-Metadata': JSON.stringify({"filename": "test.png"})
            },
            body: new Blob(["data again"], { type: "image/png" })
        });

        expect(response.status).toBe(201);
        const { filePath, publicUrl } = await response.json() as {[ key: string ]: string};
        expect(publicUrl).toContain("http");
        expect(publicUrl).toContain("supabase.co/storage");
        expect(filePath).toContain("attachment");
    });

    test("Upload profile photo", async () => {
        const response = await fetch('localhost:3000/api/account/photo-upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken} ${refreshToken}`,
                'File-Metadata': JSON.stringify({"filename": "test.jpeg"})
            },
            body: new Blob(["adfghjklasfhjkldas"], { type: "image/jpeg" })
        });

        expect(response.status).toBe(201);
        const { filePath, publicUrl } = await response.json() as {[ key: string ]: string};
        expect(publicUrl).toContain("http");
        expect(publicUrl).toContain("supabase.co/storage");
        expect(filePath).toContain("profile_photo");
    });
});