# Liquidity Dashboard

Options-trader dashboard for monitoring EQL/EQH (Equal Lows / Equal Highs), multi-timeframe confluence, sweep/reclaim events, market structure, and options context — with Telegram/Discord notifications.

## Features

- **Watchlist scanner** for QQQ, SPY, SPX, INTC, CRWV, MRVL, HOOD, MSTR, ORCL, PLTR, SPCX, RIVN, IMSR, RDW
- **Multi-timeframe analysis** (15m, 1H, 4H, D)
- **EQL/EQH detection** with swing pivots and equal-level clustering
- **Setup scoring** (touches, confluence, sweep+reclaim, structure, proximity)
- **Alerts** for proximity, sweep+reclaim, and acceptance beyond levels
- **Options panel** — nearest strike, DTE, IV rank, expected move vs distance
- **Market structure** — bullish / bearish / ranging per timeframe
- **Dealing range** — premium/discount zone
- **Fair Value Gaps** near price
- **Correlation clusters** — index, momentum, semis
- **Notifications** via Telegram and/or Discord webhooks

## Architecture

```
trading-dashboard/
├── backend/     # Python FastAPI + APScheduler scanner
└── frontend/    # React + Vite + Lightweight Charts
```

## Quick Start

### 1. Backend

```bash
cd trading-dashboard/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # optional: add Telegram/Discord credentials
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The scanner runs automatically every 5 minutes and once on startup.

### 2. Frontend

```bash
cd trading-dashboard/frontend
npm install
npm run dev
```

Open http://localhost:5174

### 3. Notifications (optional)

Edit `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/snapshots` | Latest scan per symbol |
| `GET /api/levels` | All detected EQL/EQH levels |
| `GET /api/alerts` | Alert history |
| `GET /api/bars/{symbol}?timeframe=1h` | OHLCV for chart |
| `POST /api/scan` | Trigger manual scan |
| `GET /api/clusters/summary` | Cluster activity summary |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SCAN_INTERVAL_MINUTES` | 5 | How often to scan |
| `PRIMARY_ALERT_TIMEFRAME` | 1h | TF used for alerts |
| `EQUAL_TOLERANCE_PCT` | 0.15 | Equal level tolerance |
| `MIN_TOUCHES` | 2 | Min touches for EQL/EQH |
| `PROXIMITY_ALERT_PCT` | 0.15 | Proximity alert threshold |
| `MIN_SETUP_SCORE` | 5 | Min score to fire alerts |
| `ALERT_COOLDOWN_MINUTES` | 30 | Cooldown per alert key |

## Data Source

Uses **yfinance** (free, delayed). For live intraday options trading, swap to Polygon.io or Alpaca by extending `app/market/market_data.py`.

SPX maps to `^GSPC` in yfinance. Options chain data is pulled for individual equities/ETFs; index symbols show strike estimates only.

## Disclaimer

This tool is for research and education. Not financial advice. Verify all levels manually before trading options.
