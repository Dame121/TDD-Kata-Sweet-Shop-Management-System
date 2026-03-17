"""
Test suite for sweets management endpoints.

Tests cover:
- CRUD operations for sweets
- Search and filtering
- Authorization checks
- Data validation
- Edge cases
"""

import pytest
from fastapi import status


class TestSweetCreation:
    """Test sweet creation endpoint."""
    
    def test_create_sweet_as_admin(self, client, test_admin):
        """Test admin can create a new sweet."""
        sweet_data = {
            "name": "Caramel Delight",
            "category": "Caramel",
            "price": 3.99,
            "quantity_in_stock": 50
        }
        response = client.post(
            "/api/sweets/",
            data=sweet_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == sweet_data["name"]
        assert data["category"] == sweet_data["category"]
        assert data["price"] == sweet_data["price"]
        assert data["quantity_in_stock"] == sweet_data["quantity_in_stock"]
        assert "sweet_id" in data
    
    def test_create_sweet_as_regular_user_fails(self, client, test_user_token):
        """Test regular user cannot create sweets."""
        sweet_data = {
            "name": "Test Sweet",
            "category": "Test",
            "price": 1.99,
            "quantity_in_stock": 10
        }
        response = client.post(
            "/api/sweets/",
            data=sweet_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_create_duplicate_sweet_name_fails(self, client, test_admin, create_sweets):
        """Test creating sweet with duplicate name fails."""
        duplicate_sweet = {
            "name": "Chocolate Bar",  # Already exists
            "category": "Chocolate",
            "price": 2.99,
            "quantity_in_stock": 20
        }
        response = client.post(
            "/api/sweets/",
            data=duplicate_sweet,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in response.json()["detail"]
    
    def test_create_sweet_without_authentication_fails(self, client):
        """Test creating sweet without authentication fails."""
        sweet_data = {
            "name": "Test Sweet",
            "category": "Test",
            "price": 1.99,
            "quantity_in_stock": 10
        }
        response = client.post("/api/sweets/", data=sweet_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_sweet_with_invalid_data(self, client, test_admin):
        """Test creating sweet with invalid data fails."""
        invalid_sweet = {
            "name": "Test Sweet",
            "category": "Test",
            "price": "not-a-number",  # Invalid price
            "quantity_in_stock": 10
        }
        response = client.post(
            "/api/sweets/",
            json=invalid_sweet,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestSweetRetrieval:
    """Test sweet retrieval endpoints."""
    
    def test_get_all_sweets(self, client, create_sweets):
        """Test retrieving all sweets."""
        response = client.get("/api/sweets/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == len(create_sweets)
    
    def test_get_sweet_by_id(self, client, create_sweets):
        """Test retrieving a specific sweet by ID."""
        sweet_id = create_sweets[0]["sweet_id"]
        response = client.get(f"/api/sweets/{sweet_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["sweet_id"] == sweet_id
        assert data["name"] == create_sweets[0]["name"]
    
    def test_get_nonexistent_sweet(self, client):
        """Test retrieving non-existent sweet returns 404."""
        response = client.get("/api/sweets/99999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "not found" in response.json()["detail"]
    
    def test_get_all_sweets_empty_database(self, client):
        """Test getting sweets from empty database returns empty list."""
        response = client.get("/api/sweets/")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_pagination_with_limit(self, client, create_sweets):
        """Test pagination with limit parameter."""
        response = client.get("/api/sweets/?limit=2")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
    
    def test_pagination_with_skip(self, client, create_sweets):
        """Test pagination with skip parameter."""
        response = client.get("/api/sweets/?skip=2")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == len(create_sweets) - 2


class TestSweetSearch:
    """Test sweet search functionality."""
    
    def test_search_by_name_partial_match(self, client, create_sweets):
        """Test searching sweets by partial name match."""
        response = client.get("/api/sweets/search?name=Chocolate")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2  # "Chocolate Bar" and "Dark Chocolate"
        assert all("chocolate" in sweet["name"].lower() for sweet in data)
    
    def test_search_by_category(self, client, create_sweets):
        """Test searching sweets by category."""
        response = client.get("/api/sweets/search?category=Gummy")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2  # Both gummy candies
        assert all(sweet["category"] == "Gummy" for sweet in data)
    
    def test_search_by_price_range(self, client, create_sweets):
        """Test searching sweets by price range."""
        response = client.get("/api/sweets/search?min_price=2.00&max_price=3.00")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(2.00 <= sweet["price"] <= 3.00 for sweet in data)
    
    def test_search_by_min_price_only(self, client, create_sweets):
        """Test searching sweets with minimum price."""
        response = client.get("/api/sweets/search?min_price=3.00")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(sweet["price"] >= 3.00 for sweet in data)
    
    def test_search_by_max_price_only(self, client, create_sweets):
        """Test searching sweets with maximum price."""
        response = client.get("/api/sweets/search?max_price=2.00")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(sweet["price"] <= 2.00 for sweet in data)
    
    def test_search_combined_filters(self, client, create_sweets):
        """Test searching with multiple filters combined."""
        response = client.get("/api/sweets/search?category=Chocolate&min_price=3.00")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1  # Only "Dark Chocolate"
        assert data[0]["name"] == "Dark Chocolate"
    
    def test_search_no_results(self, client, create_sweets):
        """Test search with no matching results."""
        response = client.get("/api/sweets/search?name=NonexistentSweet")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_search_case_insensitive(self, client, create_sweets):
        """Test search is case-insensitive."""
        response = client.get("/api/sweets/search?name=CHOCOLATE")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) > 0


class TestSweetUpdate:
    """Test sweet update endpoint."""
    
    def test_update_sweet_as_admin(self, client, test_admin, create_sweets):
        """Test admin can update sweet details."""
        sweet_id = create_sweets[0]["sweet_id"]
        update_data = {
            "name": "Updated Chocolate Bar",
            "price": 2.99
        }
        response = client.put(
            f"/api/sweets/{sweet_id}",
            json=update_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["price"] == update_data["price"]
        # Other fields should remain unchanged
        assert data["category"] == create_sweets[0]["category"]
    
    def test_update_sweet_as_regular_user_fails(self, client, test_user_token, create_sweets):
        """Test regular user cannot update sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        update_data = {"price": 1.99}
        response = client.put(
            f"/api/sweets/{sweet_id}",
            json=update_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_update_nonexistent_sweet(self, client, test_admin):
        """Test updating non-existent sweet returns 404."""
        update_data = {"price": 1.99}
        response = client.put(
            "/api/sweets/99999",
            json=update_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_sweet_partial_fields(self, client, test_admin, create_sweets):
        """Test updating only some fields of a sweet."""
        sweet_id = create_sweets[0]["sweet_id"]
        original_name = create_sweets[0]["name"]
        update_data = {"quantity_in_stock": 150}
        
        response = client.put(
            f"/api/sweets/{sweet_id}",
            json=update_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["quantity_in_stock"] == 150
        assert data["name"] == original_name  # Name unchanged


class TestSweetDeletion:
    """Test sweet deletion endpoint."""
    
    def test_delete_sweet_as_admin(self, client, test_admin, create_sweets):
        """Test admin can delete a sweet."""
        sweet_id = create_sweets[0]["sweet_id"]
        response = client.delete(
            f"/api/sweets/{sweet_id}",
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify sweet is deleted
        get_response = client.get(f"/api/sweets/{sweet_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_sweet_as_regular_user_fails(self, client, test_user_token, create_sweets):
        """Test regular user cannot delete sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        response = client.delete(
            f"/api/sweets/{sweet_id}",
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_delete_nonexistent_sweet(self, client, test_admin):
        """Test deleting non-existent sweet returns 404."""
        response = client.delete(
            "/api/sweets/99999",
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_sweet_without_authentication(self, client, create_sweets):
        """Test deleting sweet without authentication fails."""
        sweet_id = create_sweets[0]["sweet_id"]
        response = client.delete(f"/api/sweets/{sweet_id}")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
