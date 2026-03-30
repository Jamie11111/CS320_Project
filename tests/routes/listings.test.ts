import { test, expect } from "bun:test";
import { supabase, testApp } from "./setup";

// Clear listings table before running tests run
const { data, error } = await supabase.from('listings').delete().neq('id', 0);

test("get listing by ID", async () => {
    const response = await testApp.fetch(new Request("http://localhost:3000/api/listing/123"));
    expect(response.status).toBe(200);
});