"""
Test suite for admin-specific functionality.

Tests cover:
- Admin creation
- Admin authorization
- Admin-only operations
- Access control
"""

import pytest
from fastapi import status


class TestAdminCreation:
    """Test admin user creation."""
    
    def test_create_admin_by_existing_admin(self, client, test_admin):
        """Test existing admin can create new admin."""
        admin_data = {
            "username": "newadmin",
            "email": "newadmin@example.com",
            "password": "AdminPass123"
        }
        response = client.post(
            "/api/admins/register",
            json=admin_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == admin_data["username"]
        assert data["is_admin"] == True
        assert "password" not in data
    
    def test_create_admin_without_authentication_fails(self, client):
        """Test creating admin without authentication fails."""
        admin_data = {
            "username": "newadmin",
            "email": "newadmin@example.com",
            "password": "AdminPass123"
        }
        response = client.post("/api/admins/register", json=admin_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_admin_as_regular_user_fails(self, client, test_user_token):
        """Test regular user cannot create admin accounts."""
        admin_data = {
            "username": "newadmin",
            "email": "newadmin@example.com",
            "password": "AdminPass123"
        }
        response = client.post(
            "/api/admins/register",
            json=admin_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestAdminOperations:
    """Test admin-only operations."""
    
    def test_admin_can_create_sweets(self, client, test_admin):
        """Test admin can create sweets."""
        sweet_data = {
            "name": "Admin Sweet",
            "category": "Special",
            "price": 5.99,
            "quantity_in_stock": 100
        }
        response = client.post(
            "/api/sweets/",
            data=sweet_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_admin_can_update_sweets(self, client, test_admin, create_sweets):
        """Test admin can update sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        update_data = {"price": 9.99}
        
        response = client.put(
            f"/api/sweets/{sweet_id}",
            json=update_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_admin_can_delete_sweets(self, client, test_admin, create_sweets):
        """Test admin can delete sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        
        response = client.delete(
            f"/api/sweets/{sweet_id}",
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
    
    def test_admin_can_restock_sweets(self, client, test_admin, create_sweets):
        """Test admin can restock sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        restock_data = {"quantity": 100}
        
        response = client.post(
            f"/api/sweets/{sweet_id}/restock",
            json=restock_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_admin_can_purchase_sweets(self, client, test_admin, create_sweets):
        """Test admin can also purchase sweets like regular users."""
        sweet_id = create_sweets[0]["sweet_id"]
        purchase_data = {"quantity": 5}
        
        response = client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json=purchase_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED


class TestAccessControl:
    """Test access control and authorization."""
    
    def test_regular_user_cannot_create_sweets(self, client, test_user_token):
        """Test regular users cannot create sweets."""
        sweet_data = {
            "name": "Unauthorized Sweet",
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
        assert "Admin access required" in response.json()["detail"]
    
    def test_regular_user_cannot_update_sweets(self, client, test_user_token, create_sweets):
        """Test regular users cannot update sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        update_data = {"price": 1.99}
        
        response = client.put(
            f"/api/sweets/{sweet_id}",
            json=update_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_regular_user_cannot_delete_sweets(self, client, test_user_token, create_sweets):
        """Test regular users cannot delete sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        
        response = client.delete(
            f"/api/sweets/{sweet_id}",
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_regular_user_cannot_restock_sweets(self, client, test_user_token, create_sweets):
        """Test regular users cannot restock sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        restock_data = {"quantity": 50}
        
        response = client.post(
            f"/api/sweets/{sweet_id}/restock",
            json=restock_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_regular_user_can_purchase_sweets(self, client, test_user_token, create_sweets):
        """Test regular users can purchase sweets."""
        sweet_id = create_sweets[0]["sweet_id"]
        purchase_data = {"quantity": 5}
        
        response = client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json=purchase_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_regular_user_can_view_sweets(self, client, test_user_token, create_sweets):
        """Test regular users can view sweets."""
        response = client.get(
            "/api/sweets/",
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_unauthenticated_user_can_view_sweets(self, client, create_sweets):
        """Test unauthenticated users can view sweets."""
        response = client.get("/api/sweets/")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == len(create_sweets)
