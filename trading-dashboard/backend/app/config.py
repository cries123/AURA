from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    scan_interval_minutes: int = 5
    primary_alert_timeframe: str = "5m"
    zerodte_alert_timeframe: str = "5m"
    equal_tolerance_pct: float = 0.15
    min_touches: int = 2
    swing_lookback: int = 5
    proximity_alert_pct: float = 0.15
    alert_cooldown_minutes: int = 30
    min_setup_score: int = 5
    tier_a_min_score: int = 8
    block_first_last_minutes: int = 5
    power_hour_start_et: int = 15

    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    discord_webhook_url: str = ""

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5174,http://127.0.0.1:5174"

    database_path: str = "data/trading_dashboard.db"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
