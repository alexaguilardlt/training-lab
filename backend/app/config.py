from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    strava_client_id: str
    strava_client_secret: str
    database_url: str = "postgresql+psycopg://traininglab:admin1234@db:5432/traininglab"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()