import os

os.environ.setdefault("JWT_SECRET", "test-secret-for-model-tests")
os.environ.setdefault("DATABASE_URL", "postgresql://unused")

from pydantic import ValidationError
import pytest

from app.main import ArtworkUpdate, JournalUpdate, ProfileUpdate, ReviewInput


def test_review_requires_a_valid_purchase_code():
    valid = ReviewInput(artwork_id="abc", purchase_code="MS-A1B2C3", rating=5, body="Çok güzel.")
    assert valid.rating == 5
    with pytest.raises(ValidationError):
        ReviewInput(artwork_id="abc", purchase_code="wrong", rating=5, body="Çok güzel.")


def test_profile_and_journal_fields_are_validated():
    profile = ProfileUpdate(display_name="Mahmut Saltık", headline="Çizgi, bir izdir.", bio="Yeterince uzun bir biyografi metni.", location="İstanbul / TR")
    journal = JournalUpdate(title="Atölye", body="Bugün yeni bir portre başladı.", published=True)
    assert profile.display_name == "Mahmut Saltık"
    assert journal.published is True


def test_artwork_sort_order_cannot_be_negative():
    assert ArtworkUpdate(sort_order=3).sort_order == 3
    with pytest.raises(ValidationError):
        ArtworkUpdate(sort_order=-1)
