# Solana Top Traders Wallets & Tokens API

This repository fetches Solana top traders ranked by realized PnL, win rate, and volume using Vybe API data. It includes a Node.js backend and browser app focused on discovering high-performing wallets by either token mint or wallet search.

![Solana Top Traders Wallets & Tokens API](screenshots/solana-top-traders-wallets-and-tokens-api.png)

<p align="center">
  <img src="screenshots/top-traders-token-mode-solana-api.png" alt="Top traders by token" width="260" style="min-width:260px;max-width:260px;margin-right:10px;" />
  <img src="screenshots/top-traders-wallet-mode-solana-api.png" alt="Top traders by wallet" width="224" style="min-width:224px;max-width:224px;margin-right:10px;" />
  <img src="screenshots/top-traders-solana-leaderboard-api.png" alt="Top traders leaderboard" width="260" style="min-width:260px;max-width:260px;" />
</p>

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10

## Quick Start

```bash
git clone https://github.com/<your-org>/solana-top-traders-wallets-and-tokens-api.git
cd solana-top-traders-wallets-and-tokens-api
npm install
cp .env.example .env
# Set VYBE_API_KEY in .env
npm start
```

Then open `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VYBE_API_KEY` | Yes | API key for Vybe requests |
| `SOLANA_RPC_URL` | No | RPC for symbol fallback |
| `PORT` | No | Server port (default `3000`) |
| `TUNNEL` | No | Set `1` to run with Cloudflare Tunnel |

## What This Repo Focuses On

- Top traders leaderboard from `GET /v4/wallets/top-traders`
- Search mode switch in UI:
  - **Token mode**: uses `mintAddress`
  - **Wallet mode**: uses `ilikeFilter` for wallet name/address matching
- Last trades context tables (programs, quote mints, markets)
- Token context panels and holder table for supporting token research

## Main Endpoints Used

- `GET /v4/wallets/top-traders`
- `GET /v4/trades`
- `GET /v4/programs/labeled-program-accounts`
- `GET /v4/tokens/{mintAddress}`
- `GET /v4/tokens/{mintAddress}/top-holders`

## Project Structure

```text
solana-top-traders-wallets-and-tokens-api/
├── README.md
├── package.json
├── public/
│   ├── index.html
│   ├── app.css
│   └── app.js
└── src/
    ├── server.ts
    ├── api/
    ├── frontend/
    └── types/
```

## Notes

- Keep screenshot files in `screenshots/` with the placeholder names above.
- Replace GitHub clone URL with your final org/user path.
- Get a key at [vybenetwork.com/pricing](https://vybenetwork.com/pricing).

