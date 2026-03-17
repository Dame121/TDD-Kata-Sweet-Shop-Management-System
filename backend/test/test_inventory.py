"""
Test suite for inventory management (purchase and restock).

Tests cover:
- Purchase operations
- Restock operations
- Inventory tracking
- Stock validation
- Transaction recording
"""

import pytest
from fastapi import status


class TestPurchase:
    """Test sweet purchase functionality."""
    
    def test_purchase_sweet_success(self, client, test_user_token, create_sweets):
        """Test successful sweet purchase."""
        sweet = create_sweets[0]
        original_stock = sweet["quantity_in_stock"]
        purchase_data = {"quantity": 5}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/purchase",
            json=purchase_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["transaction_type"] == "purchase"
        assert data["quantity"] == 5
        assert data["sweet_id"] == sweet["sweet_id"]
        assert data["new_stock"] == original_stock - 5
        assert "message" in data
        assert "Successfully purchased" in data["message"]
    
    def test_purchase_reduces_stock(self, client, test_user_token, create_sweets):
        """Test purchase correctly reduces stock quantity."""
        sweet = create_sweets[0]
        sweet_id = sweet["sweet_id"]
        original_stock = sweet["quantity_in_stock"]
        purchase_quantity = 10
        
        # Make purchase
        client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": purchase_quantity},
            headers=test_user_token["headers"]
        )
        
        # Verify stock reduced
        get_response = client.get(f"/api/sweets/{sweet_id}")
        updated_sweet = get_response.json()
        assert updated_sweet["quantity_in_stock"] == original_stock - purchase_quantity
    
    def test_purchase_insufficient_stock(self, client, test_user_token, create_sweets):
        """Test purchase with insufficient stock fails."""
        sweet = create_sweets[0]
        # Try to purchase more than available
        purchase_data = {"quantity": sweet["quantity_in_stock"] + 100}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/purchase",
            json=purchase_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Insufficient stock" in response.json()["detail"]
    
    def test_purchase_out_of_stock_sweet(self, client, test_user_token, create_sweets):
        """Test purchasing out-of-stock sweet fails."""
        # Find the out-of-stock sweet (quantity = 0)
        out_of_stock_sweet = [s for s in create_sweets if s["quantity_in_stock"] == 0][0]
        purchase_data = {"quantity": 1}
        
        response = client.post(
            f"/api/sweets/{out_of_stock_sweet['sweet_id']}/purchase",
            json=purchase_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Insufficient stock" in response.json()["detail"]
    
    def test_purchase_without_authentication(self, client, create_sweets):
        """Test purchase without authentication fails."""
        sweet = create_sweets[0]
        purchase_data = {"quantity": 1}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/purchase",
            json=purchase_data
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_purchase_nonexistent_sweet(self, client, test_user_token):
        """Test purchasing non-existent sweet fails."""
        purchase_data = {"quantity": 1}
        
        response = client.post(
            "/api/sweets/99999/purchase",
            json=purchase_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_purchase_invalid_quantity_zero(self, client, test_user_token, create_sweets):
        """Test purchase with zero quantity fails."""
        sweet = create_sweets[0]
        purchase_data = {"quantity": 0}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/purchase",
            json=purchase_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_purchase_invalid_quantity_negative(self, client, test_user_token, create_sweets):
        """Test purchase with negative quantity fails."""
        sweet = create_sweets[0]
        purchase_data = {"quantity": -5}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/purchase",
            json=purchase_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_multiple_purchases_same_sweet(self, client, test_user_token, create_sweets):
        """Test multiple purchases of the same sweet."""
        sweet = create_sweets[0]
        sweet_id = sweet["sweet_id"]
        original_stock = sweet["quantity_in_stock"]
        
        # First purchase
        client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": 5},
            headers=test_user_token["headers"]
        )
        
        # Second purchase
        response = client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": 10},
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        
        # Verify total reduction
        get_response = client.get(f"/api/sweets/{sweet_id}")
        updated_sweet = get_response.json()
        assert updated_sweet["quantity_in_stock"] == original_stock - 15


class TestRestock:
    """Test sweet restock functionality."""
    
    def test_restock_sweet_as_admin(self, client, test_admin, create_sweets):
        """Test admin can restock a sweet."""
        sweet = create_sweets[0]
        original_stock = sweet["quantity_in_stock"]
        restock_data = {"quantity": 50}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/restock",
            json=restock_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["transaction_type"] == "restock"
        assert data["quantity"] == 50
        assert data["new_stock"] == original_stock + 50
        assert "Successfully restocked" in data["message"]
    
    def test_restock_increases_stock(self, client, test_admin, create_sweets):
        """Test restock correctly increases stock quantity."""
        sweet = create_sweets[0]
        sweet_id = sweet["sweet_id"]
        original_stock = sweet["quantity_in_stock"]
        restock_quantity = 75
        
        # Make restock
        client.post(
            f"/api/sweets/{sweet_id}/restock",
            json={"quantity": restock_quantity},
            headers=test_admin["headers"]
        )
        
        # Verify stock increased
        get_response = client.get(f"/api/sweets/{sweet_id}")
        updated_sweet = get_response.json()
        assert updated_sweet["quantity_in_stock"] == original_stock + restock_quantity
    
    def test_restock_as_regular_user_fails(self, client, test_user_token, create_sweets):
        """Test regular user cannot restock sweets."""
        sweet = create_sweets[0]
        restock_data = {"quantity": 50}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/restock",
            json=restock_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_restock_out_of_stock_sweet(self, client, test_admin, create_sweets):
        """Test restocking an out-of-stock sweet."""
        # Find the out-of-stock sweet
        out_of_stock_sweet = [s for s in create_sweets if s["quantity_in_stock"] == 0][0]
        restock_data = {"quantity": 100}
        
        response = client.post(
            f"/api/sweets/{out_of_stock_sweet['sweet_id']}/restock",
            json=restock_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        
        # Verify stock is now 100
        get_response = client.get(f"/api/sweets/{out_of_stock_sweet['sweet_id']}")
        updated_sweet = get_response.json()
        assert updated_sweet["quantity_in_stock"] == 100
    
    def test_restock_without_authentication(self, client, create_sweets):
        """Test restock without authentication fails."""
        sweet = create_sweets[0]
        restock_data = {"quantity": 50}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/restock",
            json=restock_data
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_restock_nonexistent_sweet(self, client, test_admin):
        """Test restocking non-existent sweet fails."""
        restock_data = {"quantity": 50}
        
        response = client.post(
            "/api/sweets/99999/restock",
            json=restock_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_restock_invalid_quantity_zero(self, client, test_admin, create_sweets):
        """Test restock with zero quantity fails."""
        sweet = create_sweets[0]
        restock_data = {"quantity": 0}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/restock",
            json=restock_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_restock_invalid_quantity_negative(self, client, test_admin, create_sweets):
        """Test restock with negative quantity fails."""
        sweet = create_sweets[0]
        restock_data = {"quantity": -50}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/restock",
            json=restock_data,
            headers=test_admin["headers"]
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestInventoryWorkflow:
    """Test complete inventory management workflows."""
    
    def test_purchase_and_restock_cycle(self, client, test_user_token, test_admin, create_sweets):
        """Test complete purchase and restock cycle."""
        sweet = create_sweets[0]
        sweet_id = sweet["sweet_id"]
        original_stock = sweet["quantity_in_stock"]
        
        # Purchase reduces stock
        client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": 30},
            headers=test_user_token["headers"]
        )
        
        # Check stock after purchase
        response1 = client.get(f"/api/sweets/{sweet_id}")
        assert response1.json()["quantity_in_stock"] == original_stock - 30
        
        # Restock increases stock
        client.post(
            f"/api/sweets/{sweet_id}/restock",
            json={"quantity": 50},
            headers=test_admin["headers"]
        )
        
        # Check final stock
        response2 = client.get(f"/api/sweets/{sweet_id}")
        assert response2.json()["quantity_in_stock"] == original_stock - 30 + 50
    
    def test_transaction_records_user_info(self, client, test_user_token, create_sweets):
        """Test transaction records include user information."""
        sweet = create_sweets[0]
        purchase_data = {"quantity": 5}
        
        response = client.post(
            f"/api/sweets/{sweet['sweet_id']}/purchase",
            json=purchase_data,
            headers=test_user_token["headers"]
        )
        
        data = response.json()
        assert "user_id" in data
        assert data["user_id"] == test_user_token["user_id"]
        assert "transaction_id" in data
        assert "created_at" in data
        assert "price_at_time" in data
