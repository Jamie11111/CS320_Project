import { Glob } from "bun";

export function generatePagesRoutes(baseDir: string = "./pages/") {
    // The "**/*" pattern matches all files in the "pages" directory and its subdirectories
    const glob = new Glob("**/*");
    const routes: {file: string, route: string}[] = [];
    baseDir = baseDir.replace(/\\/g, "/"); // Normalize Windows paths to use forward slashes
    if (!baseDir.endsWith("/")) {
        baseDir += "/";
    }
    
    for (let file of glob.scanSync({cwd: baseDir})) {
        // Skip current file
        if (file === import.meta.file) continue;

        file = baseDir + file.replace(/\\/g, "/"); // Normalize Windows paths to use forward slashes

        // Convert file path to route path
        // let route = file.replace(/index.html$/, "");
        let route = file;
        // Ensure route starts with a "/"
        if (!route.startsWith("/")) {
            route = "/" + route;
        }
        if (route.endsWith("/") && route.length > 1) {
            route = route.slice(0, -1);
        }
        if (route.startsWith("/./")){
            route = route.replace("/./", "/");
        }
        routes.push({file, route});

        // console.log(`Registered route: ${route} -> ${file}`);
    }

    return Object.fromEntries(routes.map(({route, file}) => [route, { GET: async (req: Request) => new Response(Bun.file(file)) }]));
}