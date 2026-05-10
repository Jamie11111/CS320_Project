# CS320 Project - UMarket

Complete codebase for the project. 

## Setup Instructions
Prerequisites:
- Install `bun.js`
- Install an iOS or Android emulator

From the `./backend` folder, do the following:
- Run `bun install`
- Create a `.env` file containing `SUPABASE_URL` and `SUPABASE_ANON_KEY` database connection keys
- Run `bun run index.ts` to start the backend server

From the `./frontend` folder, do the following:
- Run `bun install`
- Run `bun expo start` to start the frontend
- Note: depending on what emulator you're using, you may need to change the `backendURL` variable inside of [`scripts/authFetch.ts`](https://github.com/Jamie11111/CS320_Project/blob/clear-main/frontend/scripts/authFetch.ts)

To test the code, switch to the `./backend` folder and do the following:
- Create a `.env.test` file containing `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY` database connection keys
- Do `bun test ./test/database/[file].test.ts` to run database tests
- Do `bun test ./test/routes/[file].test.ts` to run backend route tests

## Updating code in this branch

`/frontend` and `/backend` are set up as git subtrees, so any changes are made to `backend-main` or `frontend-patch-1` after this branch gets merged into `main`, you can still easily update main by running `git subtree pull --prefix=<directory> <repository_url> <branch>`:
```
git subtree pull --prefix=backend https://github.com/Jamie11111/CS320_Project.git backend-main
git subtree pull --prefix=frontend https://github.com/Jamie11111/CS320_Project.git frontend-patch-1
```
