"""Unit tests verifying Swagger UI / OpenAPI schema gating across environments."""

from unittest.mock import patch

from src.core.config import Settings
from src.main import create_application


def test_docs_enabled_in_development_and_staging():
    """Verify Swagger UI and OpenAPI schemas are enabled in non-production environments."""
    for env in ["development", "staging", "test"]:
        mock_settings = Settings(ENVIRONMENT=env)
        with patch("src.main.get_settings", return_value=mock_settings):
            app = create_application()
            assert app.docs_url == "/docs"
            assert app.redoc_url == "/redoc"
            assert app.openapi_url == "/openapi.json"


def test_docs_disabled_in_production():
    """Verify Swagger UI and OpenAPI schemas are disabled in production environment."""
    mock_settings = Settings(ENVIRONMENT="production")
    with patch("src.main.get_settings", return_value=mock_settings):
        app = create_application()
        assert app.docs_url is None
        assert app.redoc_url is None
        assert app.openapi_url is None
