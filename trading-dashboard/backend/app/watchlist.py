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

ZERODTE_SYMBOLS = ["SPY", "QQQ", "SPX"]

INDEX_SYMBOLS = ["SPY", "QQQ", "SPX"]

# yfinance ticker mapping
YFINANCE_SYMBOL_MAP = {
    "SPX": "^GSPC",
}

BREADTH_SYMBOLS = {
    "TICK": "^NYA",  # proxy; true $TICK needs paid feed
    "ADD": "^NYA",
    "VOLD": "^VIX",
}

CORRELATION_CLUSTERS = {
    "index": ["QQQ", "SPY", "SPX"],
    "momentum": ["PLTR", "HOOD", "MSTR", "RIVN"],
    "semis": ["INTC", "MRVL", "ORCL"],
    "other": ["CRWV", "SPCX", "IMSR", "RDW"],
}

TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"]

TIMEFRAME_PERIOD = {
    "1m": "1d",
    "5m": "5d",
    "15m": "5d",
    "1h": "60d",
    "4h": "120d",
    "1d": "2y",
}

TIMEFRAME_INTERVAL = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "1h": "1h",
    "4h": "1h",
    "1d": "1d",
}

ZERODTE_PRIMARY_TIMEFRAMES = ["1m", "5m", "15m"]
