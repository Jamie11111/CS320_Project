// import { createServerClient } from "@supabase/ssr";
// // import { CookieMap } from "bun";

// export function createClient(request: Request, responseHeaders: Headers) {
//   return createServerClient(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           // Bun's way of parsing request cookies
//           const cookieHeader = request.headers.get('Cookie') ?? '';
//           return cookieHeader.split('; ').map(c => {
//             const [name, ...v] = c.split('=');
//             return { name, value: v.join('=') };
//           });
//         },
//         setAll(cookiesToSet) {
//           // Use Bun's Headers API to append Set-Cookie headers
//           cookiesToSet.forEach(({ name, value, options }) => {
//             // Map Supabase options to a Set-Cookie string
//             let cookieStr = `${name}=${value}`;
//             if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
//             if (options.path) cookieStr += `; Path=${options.path}`;
//             if (options.httpOnly) cookieStr += `; HttpOnly`;
//             const a: CookieMap = CookieMap();
//             a.toSetCookieHeaders
//             responseHeaders.append('Set-Cookie', cookieStr);
//           });
//         },
//       },
//     }
//   )
// }

import { createClient as supabaseClient, type SupabaseClient, type SupabaseClientOptions } from "@supabase/supabase-js";

export function createClient(supabaseURL: string, supabaseKey: string, options?: SupabaseClientOptions<"public"> | undefined) {
  return supabaseClient(supabaseURL, supabaseKey, options);
}