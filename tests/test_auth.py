"""
Test suite for authentication endpoints.

Tests cover:
- User registration
- User login
- Token generation
- Authentication failures
- Duplicate user prevention
"""

import pytest
from fastapi import status


class TestUserRegistration:
    """Test user registration endpoint."""
    
    def test_register_new_user_success(self, client):
        """Test successful user registration."""
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "SecurePassword123"
        }
        response = client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert data["is_admin"] == False
        assert "user_id" in data
        assert "password" not in data  # Password should not be returned
    
    def test_register_duplicate_username(self, client, test_user):
        """Test registration with duplicate username fails."""
        duplicate_data = {
            "username": test_user["username"],
            "email": "different@example.com",
            "password": "Password123"
        }
        response = client.post("/api/auth/register", json=duplicate_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Username already registered" in response.json()["detail"]
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email fails."""
        duplicate_data = {
            "username": "differentuser",
            "email": test_user["email"],
            "password": "Password123"
        }
        response = client.post("/api/auth/register", json=duplicate_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email format fails."""
        invalid_data = {
            "username": "testuser",
            "email": "not-an-email",
            "password": "Password123"
        }
        response = client.post("/api/auth/register", json=invalid_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields fails."""
        incomplete_data = {
            "username": "testuser"
        }
        response = client.post("/api/auth/register", json=incomplete_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestUserLogin:
    """Test user login endpoint."""
    
    def test_login_success(self, client, test_user):
        """Test successful user login."""
        login_data = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["username"] == test_user["username"]
    
    def test_login_wrong_password(self, client, test_user):
        """Test login with incorrect password fails."""
        login_data = {
            "username": test_user["username"],
            "password": "WrongPassword123"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent username fails."""
        login_data = {
            "username": "nonexistent",
            "password": "Password123"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_missing_credentials(self, client):
        """Test login with missing credentials fails."""
        response = client.post("/api/auth/login", json={})
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestTokenAuthentication:
    """Test token-based authentication."""
    
    def test_access_protected_endpoint_with_valid_token(self, client, test_user_token):
        """Test accessing protected endpoint with valid token."""
        response = client.get(
            "/api/sweets/",
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_access_protected_endpoint_without_token(self, client):
        """Test accessing protected endpoint without token fails."""
        response = client.post("/api/sweets/1/purchase", json={"quantity": 1})
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_access_protected_endpoint_with_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token fails."""
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = client.post(
            "/api/sweets/1/purchase",
            json={"quantity": 1},
            headers=headers
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_oauth2_token_endpoint(self, client, test_user):
        """Test OAuth2 compatible token endpoint."""
        form_data = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        response = client.post("/api/auth/token", data=form_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"


class TestAdminAuthentication:
    """Test admin-specific authentication."""
    
    def test_admin_login_success(self, client, test_admin):
        """Test successful admin login."""
        login_data = {
            "username": test_admin["username"],
            "password": test_admin["password"]
        }
        response = client.post("/api/admins/login", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["user"]["is_admin"] == True
    
    def test_regular_user_cannot_access_admin_endpoints(self, client, test_user_token):
        """Test that regular users cannot access admin-only endpoints."""
        sweet_data = {
            "name": "Test Sweet",
            "category": "Test",
            "price": 1.99,
            "quantity_in_stock": 10
        }
        response = client.post(
            "/api/sweets/",
            json=sweet_data,
            headers=test_user_token["headers"]
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "Admin access required" in response.json()["detail"]
