import os

os.environ.setdefault("JWT_SECRET", "test-secret-for-unit-tests")

from app.auth import create_token, hash_password, verify_password


def test_password_hash_roundtrip():
    encoded = hash_password("strong-password")
    assert encoded != "strong-password"
    assert verify_password("strong-password", encoded)
    assert not verify_password("wrong-password", encoded)


def test_token_contains_role():
    token = create_token({"id": "user-1", "email": "test@example.com", "name": "Test", "role": "user"})
    assert isinstance(token, str)
    assert len(token.split(".")) == 3
