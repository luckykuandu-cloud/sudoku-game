# Sudoku

A classic 9 × 9 Sudoku game with three difficulty levels and a unique solution for each generated puzzle. Games run entirely in the browser without accounts or a backend.

## Run locally

Open `public/index.html` in a browser, or serve `public/` with any static web server. Use the number buttons or keys 1–9 to play. When the board has focus, use the arrow keys to move between cells. Backspace, Delete, and 0 erase an entry.

## Publish to GitHub

Create a new empty repository named `sudoku-game` under `luckykuandu-cloud`. From this project's directory, run:

```sh
git remote add origin https://github.com/luckykuandu-cloud/sudoku-game.git
git push -u origin main
```

## Connect to Cloudflare Workers

1. In Cloudflare, open **Workers & Pages → Create application → Workers** and choose the GitHub import option. Select the new `sudoku-game` repository. If the repository is missing, grant the Cloudflare GitHub app access to it.
2. Create a new Worker named `sudoku-game` and set the production branch to `main`. Keep the repository root as the build root. Leave the build command blank and use `npx wrangler deploy` as the production deploy command.
3. Enable non-production branch builds and use `npx wrangler preview` for the preview deploy command. The committed `wrangler.jsonc` defines the static assets directory and the `previews` block used by that command.
4. Verify the production build and test the URL Cloudflare provides. Open a pull request from a test branch to verify preview builds separately.

To validate the production configuration locally without deploying, run `npx wrangler deploy --dry-run`.
