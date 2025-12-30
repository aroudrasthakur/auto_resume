"""Tests for encryption utilities."""

import os

import pytest
from shared.app.utils.encryption import decrypt_contact, encrypt_contact


@pytest.fixture
def mock_encryption_key():
    """Set test encryption key."""
    test_key = "0" * 64
    os.environ["ENCRYPTION_KEY"] = test_key
    yield test_key
    os.environ.pop("ENCRYPTION_KEY", None)


def test_encrypt_decrypt_contact(mock_encryption_key):
    """Test encrypting and decrypting contact."""
    plaintext = "user@example.com"
    ciphertext, nonce, auth_tag, key_version = encrypt_contact(plaintext)
    decrypted = decrypt_contact(ciphertext, nonce, auth_tag, key_version)
    assert decrypted == plaintext

