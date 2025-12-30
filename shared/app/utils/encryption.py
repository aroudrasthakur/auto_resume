"""Encryption utilities for sensitive contact fields."""

import os
from typing import Tuple

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def get_encryption_key() -> bytes:
    """
    Get encryption key from environment variable.

    Returns:
        32-byte key for AES-256-GCM

    Raises:
        ValueError: If ENCRYPTION_KEY is not set or invalid
    """
    key_hex = os.getenv("ENCRYPTION_KEY")
    if not key_hex:
        raise ValueError("ENCRYPTION_KEY environment variable is required")

    if len(key_hex) != 64:  # 32 bytes = 64 hex chars
        raise ValueError("ENCRYPTION_KEY must be 64 hex characters (32 bytes)")

    try:
        return bytes.fromhex(key_hex)
    except ValueError as e:
        raise ValueError(f"ENCRYPTION_KEY must be valid hex: {e}") from e


def encrypt_contact(plaintext: str, key_version: int = 1) -> Tuple[bytes, bytes, bytes, int]:
    """
    Encrypt contact field using AES-256-GCM.

    Args:
        plaintext: Text to encrypt
        key_version: Version of encryption key (for key rotation)

    Returns:
        Tuple of (ciphertext, nonce, auth_tag, key_version)
    """
    if not plaintext:
        return b"", b"", b"", key_version

    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce for GCM

    plaintext_bytes = plaintext.encode("utf-8")
    ciphertext = aesgcm.encrypt(nonce, plaintext_bytes, None)

    # GCM auth tag is appended to ciphertext
    # Split it out for storage
    auth_tag = ciphertext[-16:]
    ciphertext_only = ciphertext[:-16]

    return ciphertext_only, nonce, auth_tag, key_version


def decrypt_contact(
    ciphertext: bytes, nonce: bytes, auth_tag: bytes, key_version: int
) -> str:
    """
    Decrypt contact field using AES-256-GCM.

    Args:
        ciphertext: Encrypted data
        nonce: Nonce used for encryption
        auth_tag: Authentication tag
        key_version: Version of encryption key

    Returns:
        Decrypted plaintext

    Raises:
        ValueError: If decryption fails (invalid key, tampered data, etc.)
    """
    if not ciphertext or not nonce or not auth_tag:
        return ""

    key = get_encryption_key()
    aesgcm = AESGCM(key)

    # Reconstruct full ciphertext with auth tag
    full_ciphertext = ciphertext + auth_tag

    try:
        plaintext_bytes = aesgcm.decrypt(nonce, full_ciphertext, None)
        return plaintext_bytes.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Decryption failed: {e}") from e

