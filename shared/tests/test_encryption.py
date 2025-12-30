"""Tests for encryption utilities."""

import os

import pytest

from shared.app.utils.encryption import decrypt_contact, encrypt_contact, get_encryption_key


@pytest.fixture
def mock_encryption_key():
    """Set a test encryption key."""
    test_key = "0" * 64  # 32 bytes in hex
    os.environ["ENCRYPTION_KEY"] = test_key
    yield test_key
    os.environ.pop("ENCRYPTION_KEY", None)


def test_get_encryption_key(mock_encryption_key):
    """Test getting encryption key from environment."""
    key = get_encryption_key()
    assert len(key) == 32  # 32 bytes


def test_get_encryption_key_missing():
    """Test error when encryption key is missing."""
    os.environ.pop("ENCRYPTION_KEY", None)
    with pytest.raises(ValueError, match="ENCRYPTION_KEY"):
        get_encryption_key()


def test_get_encryption_key_invalid_length():
    """Test error when encryption key has wrong length."""
    os.environ["ENCRYPTION_KEY"] = "short"
    with pytest.raises(ValueError, match="64 hex characters"):
        get_encryption_key()


def test_encrypt_decrypt_contact(mock_encryption_key):
    """Test encrypting and decrypting contact information."""
    plaintext = "user@example.com"
    ciphertext, nonce, auth_tag, key_version = encrypt_contact(plaintext)

    assert ciphertext != plaintext
    assert len(nonce) == 12
    assert len(auth_tag) == 16
    assert key_version == 1

    decrypted = decrypt_contact(ciphertext, nonce, auth_tag, key_version)
    assert decrypted == plaintext


def test_encrypt_decrypt_empty(mock_encryption_key):
    """Test encrypting empty string."""
    ciphertext, nonce, auth_tag, key_version = encrypt_contact("")
    assert ciphertext == b""
    assert nonce == b""
    assert auth_tag == b""

    decrypted = decrypt_contact(ciphertext, nonce, auth_tag, key_version)
    assert decrypted == ""


def test_decrypt_invalid_data(mock_encryption_key):
    """Test decryption with invalid data."""
    with pytest.raises(ValueError, match="Decryption failed"):
        decrypt_contact(b"invalid", b"invalid", b"invalid", 1)


def test_encrypt_decrypt_special_chars(mock_encryption_key):
    """Test encrypting text with special characters."""
    plaintext = "user+test@example.com (555) 123-4567"
    ciphertext, nonce, auth_tag, key_version = encrypt_contact(plaintext)
    decrypted = decrypt_contact(ciphertext, nonce, auth_tag, key_version)
    assert decrypted == plaintext

