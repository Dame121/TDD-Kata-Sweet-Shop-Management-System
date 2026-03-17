import pytest
from fastapi import status


class TestSweetRating:
    """Test suite for sweet rating functionality."""

    def test_user_can_rate_a_sweet(self, client, test_user_token, create_sweets):
        """Test that authenticated user can rate a sweet."""
        sweet_id = create_sweets[0]["sweet_id"]
        
        response = client.post(
            f"/api/sweets/{sweet_id}/rate",
            json={"rating": 4},
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["rating"] == 4
        assert data["sweet_id"] == sweet_id

    '''def test_rating_must_be_between_1_and_5(self, client, test_user_token, create_sweets):
        """Test that rating must be valid (1-5)."""
        sweet_id = create_sweets[0]["sweet_id"]
        
        # Test invalid rating (6)
        response = client.post(
            f"/api/sweets/{sweet_id}/rate",
            json={"rating": 6},
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_unauthenticated_user_cannot_rate(self, client, create_sweets):
        """Test that unauthenticated users cannot rate."""
        sweet_id = create_sweets[0]["sweet_id"]
        
        response = client.post(
            f"/api/sweets/{sweet_id}/rate",
            json={"rating": 4}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_sweet_includes_average_rating(self, client, create_sweets):
        """Test that sweet details include average rating."""
        sweet_id = create_sweets[0]["sweet_id"]
        
        response = client.get(f"/api/sweets/{sweet_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "average_rating" in data'''