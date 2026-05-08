# Solana Top Traders Wallets & Tokens API

This repository demonstrates how to use Vybe’s Solana Top Traders and Trades APIs to fetch, rank, and explore high-performing wallets by either token mint (token mode) or wallet query (wallet mode). It includes a production-ready Node.js backend and a modern, framework-free frontend that shows how to build a trader leaderboard UI with sorting, filtering, token context, and export-ready data views powered by Vybe.

Try the live demo: https://solana-top-traders-wallets-and-tokens-api.vybenetwork.com

Use this project as a reference implementation or starter kit for building Solana trader discovery tools, wallet intelligence dashboards, and PnL/flow analysis products powered by Vybe’s high-performance Solana data APIs.

![Solana Top Traders Wallets & Tokens API](screenshots/solana-top-traders-wallets-and-tokens-api.png)

<p align="center">
  <img src="screenshots/top-traders-token-mode-solana-api.png" alt="Top traders by token" width="260" style="min-width:260px;max-width:260px;margin-right:10px;" />
  <img src="screenshots/top-traders-wallet-mode-solana-api.png" alt="Top traders by wallet" width="224" style="min-width:224px;max-width:224px;margin-right:10px;" />
  <img src="screenshots/top-traders-solana-leaderboard-api.png" alt="Top traders leaderboard" width="260" style="min-width:260px;max-width:260px;" />
</p>

---

**[Try the LIVE demo →](https://solana-top-traders-wallets-and-tokens-api.vybenetwork.com)**

**[Get your free Vybe API key →](https://vybenetwork.com/pricing)**  

**[Vybe Solana data docs →](https://docs.vybenetwork.com)**

---

## Prerequisites

- **Node.js** ≥ 20 (LTS recommended)
- **npm** ≥ 10 (or equivalent)

## Quick Start

Get from clone to running app in a few commands:

```bash
git clone https://github.com/vybenetwork/solana-top-traders-wallets-and-tokens-api.git
cd solana-top-traders-wallets-and-tokens-api
npm install
cp .env.example .env
# Edit .env and set VYBE_API_KEY=your_api_key_here
npm start
```

Then open **http://localhost:3000**, choose **token mode** or **wallet mode**, and click **Load** to fetch results.

## Environment Variables

| Variable         | Required | Description                                                     | Example                                |
|------------------|----------|-----------------------------------------------------------------|----------------------------------------|
| `VYBE_API_KEY`   | Yes      | Vybe API key used for all Vybe requests                         | `your_api_key_here`                    |
| `SOLANA_RPC_URL` | No       | RPC endpoint for symbol / metadata fallbacks (when enabled)      | `https://api.mainnet-beta.solana.com` |
| `PORT`           | No       | HTTP server port                                                | `3000`                                 |
| `TUNNEL`         | No       | Set to `1` to run behind a Cloudflare Tunnel                     | `1`                                    |

Get your API key at `https://vybenetwork.com/pricing`.

---

## What This Repo Provides

- **Top traders + trades endpoint proxy**
  - Express server that proxies Vybe:
    - `GET /v4/wallets/top-traders` (leaderboard)
    - `GET /v4/trades` (trade stream used for context tables)
    - `GET /v4/programs/labeled-program-accounts` (program labels)
    - `GET /v4/tokens/{mintAddress}` (token metadata for the UI header)
    - `GET /v4/tokens/{mintAddress}/top-holders` (holder context panel)
- **Trader discovery web UI**
  - Single-page GUI (no frameworks) built from `src/frontend/app.ts` into `public/app.js`.
  - Lets you search by **token mint** or by **wallet query** and inspect ranked wallets with sortable metrics.
- **Two discovery modes**
  - **Token mode** — leaderboard scoped to a token via `mintAddress`.
  - **Wallet mode** — search via `ilikeFilter` for wallet address/name/label matching.
- **Context panels and drilldowns**
  - Token metadata header + supporting token panels.
  - Trade context summaries (top programs / markets / quote mints) derived from the latest fetched data.

All of this uses Vybe’s production Solana datasets across major DEX venues and aggregated trading activity.

---

### Solana API docs for these endpoints

- **Top traders (`GET /v4/wallets/top-traders`)**:
  - [https://docs.vybenetwork.com](https://docs.vybenetwork.com)
- **Historical trades (`GET /v4/trades`)**:
  - [https://docs.vybenetwork.com/reference/get_trade_data_program_v4](https://docs.vybenetwork.com/reference/get_trade_data_program_v4)
- **Token details (`GET /v4/tokens/{mintAddress}`)**:
  - [https://docs.vybenetwork.com/reference/get_token_details_v4](https://docs.vybenetwork.com/reference/get_token_details_v4)
- **Top holders (`GET /v4/tokens/{mintAddress}/top-holders`)**:
  - [https://docs.vybenetwork.com](https://docs.vybenetwork.com)
- **Labeled programs (`GET /v4/programs/labeled-program-accounts`)**:
  - [https://docs.vybenetwork.com/reference/get_known_program_accounts_v4](https://docs.vybenetwork.com/reference/get_known_program_accounts_v4)

---

## Why Top Traders Data Matters

Top traders data is useful for:

- **Wallet discovery**: find wallets with sustained realized PnL, strong RoV%, and high activity.
- **Token reconnaissance**: identify who is winning/losing on a mint and how concentrated performance is.
- **Flow + venue analysis**: use trades context to understand which programs/markets dominate recent activity.
- **Research workflows**: move from a leaderboard to wallet drilldowns and token context in one UI.

This repo shows how to build a **practical trader explorer** on top of Vybe’s Top Traders and Trades APIs.

---

## Frontend Overview (Top Traders UI)

The UI is implemented in `src/frontend/app.ts` and compiled to `public/app.js` via `npm start` (which runs `npm run build:frontend` first).

### Sections

- **Token metadata header**
  - Shows symbol, name, mint, decimals, price, market cap, and 24h volumes when available (from `GET /api/tokens/:mint`).
- **Top traders leaderboard**
  - Sorted views for realized PnL, RoV%, trades, and volume depending on mode and selected sort.
  - Token mode uses `mintAddress`; wallet mode uses `ilikeFilter`.
- **Context tables**
  - Derived from the latest fetched data (no extra Vybe calls) to summarize programs, markets, and quote currencies.
- **Token supply + holders context**
  - Optional supporting panels for holder distribution and supply context using the top-holders endpoint.

---

## Filters & Workflow

### Remote filters (Vybe query params)

The top controls in the UI map to request parameters sent to the backend proxy and then forwarded to Vybe:

- **Mode**
  - Token mode: `mintAddress=...`
  - Wallet mode: `ilikeFilter=...`
- **Resolution / timeframe** (when applicable)
- **Pagination**
  - `limit`, `page`
- **Sorting**
  - `sortByAsc` / `sortByDesc`

### Local filters (no refetch)

When data is loaded, several UI refinements are applied client-side (sorting display, formatting, and grouping) without additional requests.

---

## Server Proxy Routes

The Express server in `src/server.ts` exposes:

- **`GET /api/wallets/top-traders`**
  - Proxies to Vybe `GET /v4/wallets/top-traders`.
- **`GET /api/trades`**
  - Proxies to Vybe `GET /v4/trades`.
- **`GET /api/programs/labeled-program-account?programAddress=…`**
  - Proxies to Vybe `GET /v4/programs/labeled-program-accounts?programAddress=…` (cached on disk when enabled).
- **`POST /api/programs/labeled-program-accounts`**
  - Batch variant for multiple program addresses; responses cached on disk when enabled.
- **`GET /api/tokens/:mint`**
  - Proxies to Vybe `GET /v4/tokens/{mintAddress}` for token metadata.
- **`GET /api/tokens/:mint/top-holders`**
  - Proxies to Vybe `GET /v4/tokens/{mintAddress}/top-holders`.
- **`GET /api/health`**
  - Health check.

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/vybenetwork/solana-top-traders-wallets-and-tokens-api.git
cd solana-top-traders-wallets-and-tokens-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set your API key

```bash
cp .env.example .env
# Add your VYBE_API_KEY to .env
```

### 4. Run the server + web app

```bash
npm start
```

Then open **http://localhost:3000** and use token mode or wallet mode to fetch top traders and related context.

### 5. (Optional) Run with Cloudflare Tunnel

To expose the app on a public URL (e.g. for sharing or testing from another device), you can enable a tunnel (requires `cloudflared` installed):

```bash
TUNNEL=1 npm start
```

---

## Project Structure

```text
solana-top-traders-wallets-and-tokens-api/
├── .env.example           # Copy to .env, fill in VYBE_API_KEY (and optional SOLANA_RPC_URL, PORT, TUNNEL)
├── tsconfig.json          # TypeScript config for backend
├── tsconfig.frontend.json # TypeScript config for frontend (builds public/app.js)
├── package.json           # Scripts and dependencies
├── README.md
├── screenshots/           # Screenshots referenced in this README (you update these)
├── public/                # Web GUI (HTML, CSS, built JS)
│   ├── index.html
│   ├── app.js             # Generated by `npm run build:frontend` from src/frontend/app.ts
│   └── app.css
└── src/
    ├── server.ts          # Express server; proxies Vybe API and serves public/
    ├── config.ts          # Env loading, API base URL, timeouts, PUBLIC_DIR
    ├── cache.ts           # On-disk caches in data/ (when enabled)
    ├── types/
    │   └── api.ts         # Interfaces matching Vybe API response shapes
    ├── api/               # Vybe API client wrapper + endpoints
    └── frontend/
        └── app.ts         # Top traders UI → builds to public/app.js
```

---

## Troubleshooting

| Issue                         | What to do |
|------------------------------|------------|
| **403 Forbidden**             | Verify `VYBE_API_KEY` in `.env` is correct and has access to the endpoints you’re calling. |
| **Slow responses / timeouts** | The app uses timeouts and retries for Vybe requests; retry later or narrow the query scope. |
| **Missing env vars**          | Ensure you copied `.env.example` to `.env` and set `VYBE_API_KEY`. |

---

## Support

- **Telegram:** [Vybe community](https://t.me/vybenetwork)
- **Support ticket:** [Submit a ticket](https://vybenetwork.com)

