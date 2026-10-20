"""Structured Logging Configuration for Chennai Flood Prediction System.

Configures application logging handlers to write formatted logs to
both console and rotating file (/var/log/chennai-flood/app.log or local fallback).
Format adheres to Logstash Grok pattern:
YYYY-MM-DD HH:MM:SS,mmm [LOGLEVEL] [logger_name] [request_id=xxx] - message
"""

import os
import sys
import logging
from logging.handlers import RotatingFileHandler

LOG_DIR = os.getenv("LOG_DIR", "/var/log/chennai-flood")
LOG_FILE = os.path.join(LOG_DIR, "app.log")
FALLBACK_LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "logs")
FALLBACK_LOG_FILE = os.path.join(FALLBACK_LOG_DIR, "app.log")

LOG_FORMAT = "%(asctime)s [%(levelname)s] [%(name)s] - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(level: int = logging.INFO) -> logging.Logger:
    """Initialize root and application loggers with console and file handlers."""
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers if called multiple times
    if root_logger.handlers:
        return root_logger

    formatter = logging.Formatter(fmt=LOG_FORMAT, datefmt=DATE_FORMAT)

    # 1. Console (Stdout) Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(level)
    root_logger.addHandler(console_handler)

    # 2. File Handler (Target directory or fallback)
    target_path = None
    try:
        os.makedirs(LOG_DIR, exist_ok=True)
        # Test write permission
        test_file = os.path.join(LOG_DIR, ".write_test")
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
        target_path = LOG_FILE
    except (PermissionError, OSError):
        try:
            os.makedirs(FALLBACK_LOG_DIR, exist_ok=True)
            target_path = FALLBACK_LOG_FILE
        except OSError:
            target_path = None

    if target_path:
        file_handler = RotatingFileHandler(
            target_path,
            maxBytes=10 * 1024 * 1024,  # 10 MB per file
            backupCount=5,
            encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(level)
        root_logger.addHandler(file_handler)

    return root_logger
