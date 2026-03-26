import { accountRoutes } from "./routes/account";
import { chatRoutes } from "./routes/chats";
import { listingRoutes } from "./routes/posts";
import { userRoutes } from "./routes/users";

console.log("Hello via Bun!");

Bun.serve({
    port: 3000,
    routes: {
        ...listingRoutes,
        ...userRoutes,
        ...accountRoutes,
        ...chatRoutes,
        "/*": () => new Response("Not Found", {status: 404})
    }
});

console.log("App is running on port 3000");