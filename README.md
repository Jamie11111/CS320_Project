# CS320_Project
Repo for the CS320 project.

# Installation
1. `git clone` the entire repository somewhere onto the computer, separate from where the frontend code is stored. 
2. `git checkout backend-main` to switch to the backend code in the new copy of the repository you just cloned. 
3. `bun install` to install dependencies
4. Create `.env` and `.env.test` files for database connection strings in the root directory of the project
5. `bun run index.ts` to run, or `bun test ./tests/routes/filename.test.ts` to test