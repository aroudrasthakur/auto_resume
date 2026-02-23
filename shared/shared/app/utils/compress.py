"""Compression utilities for resume snapshots."""

import base64
import gzip
import json
from typing import Any, Dict


def compress_json(obj: Dict[str, Any]) -> str:
    """Compress a JSON-serializable dict to a base64 gzip string."""
    raw = json.dumps(obj, default=str).encode("utf-8")
    compressed = gzip.compress(raw, compresslevel=6)
    return base64.b64encode(compressed).decode("ascii")


def decompress_json(compressed_b64: str) -> Dict[str, Any]:
    """Decompress a base64 gzip string back to a dict."""
    compressed = base64.b64decode(compressed_b64.encode("ascii"))
    raw = gzip.decompress(compressed).decode("utf-8")
    return json.loads(raw)


def compress_text(text: str) -> str:
    """Compress text to gz64:base64 format for storage."""
    compressed = gzip.compress(text.encode("utf-8"), compresslevel=6)
    return "gz64:" + base64.b64encode(compressed).decode("ascii")


def decompress_text(stored: str) -> str:
    """Decompress gz64:base64 text or return as-is if not compressed."""
    if stored.startswith("gz64:"):
        compressed = base64.b64decode(stored[5:].encode("ascii"))
        return gzip.decompress(compressed).decode("utf-8")
    return stored


def pack_profile_snapshot(obj: Dict[str, Any]) -> str:
    """Pack profile snapshot for storage (compressed). Returns JSON string."""
    packed = {"_compressed": compress_json(obj)}
    return json.dumps(packed)


def unpack_profile_snapshot(stored: Any) -> Dict[str, Any]:
    """Unpack profile snapshot from storage. Handles both compressed and legacy."""
    if isinstance(stored, str):
        data = json.loads(stored)
    else:
        data = stored
    if isinstance(data, dict) and "_compressed" in data:
        return decompress_json(data["_compressed"])
    return data if isinstance(data, dict) else json.loads(stored)
