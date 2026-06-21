WATCHLIST = [
    "QQQ",
    "SPY",
    "SPX",
    "INTC",
    "CRWV",
    "MRVL",
    "HOOD",
    "MSTR",
    "ORCL",
    "PLTR",
    "SPCX",
    "RIVN",
    "IMSR",
    "RDW",
]

# yfinance ticker mapping
YFINANCE_SYMBOL_MAP = {
    "SPX": "^GSPC",
}

CORRELATION_CLUSTERS = {
    "index": ["QQQ", "SPY", "SPX"],
    "momentum": ["PLTR", "HOOD", "MSTR", "RIVN"],
    "semis": ["INTC", "MRVL", "ORCL"],
    "other": ["CRWV", "SPCX", "IMSR", "RDW"],
}

TIMEFRAMES = ["15m", "1h", "4h", "1d"]

# Approximate bars to fetch per timeframe
TIMEFRAME_PERIOD = {
    "15m": "5d",
    "1h": "60d",
    "4h": "120d",
    "1d": "2y",
}

# yfinance interval strings
TIMEFRAME_INTERVAL = {
    "15m": "15m",
    "1h": "1h",
    "4h": "1h",  # resampled from 1h
    "1d": "1d",
}
