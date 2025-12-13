"""
Test configuration and fixtures for Sweet Shop Management System tests.

This module provides shared fixtures for:
- Test database setup and teardown
- Test client for API requests
- Test users (regular and admin)
- Test sweets data
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.app import app
from app.auth_utils import get_password_hash

# Use an in-memory SQLite database for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_sweets.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """
    Create a fresh database for each test.
    This ensures test isolation and prevents test pollution.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """
    Create a test client with a test database session.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(client):
    """
    Create a test user and return user data with credentials.
    """
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "TestPassword123",
        "is_admin": False
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    return {**user_data, "user_id": response.json()["user_id"]}


@pytest.fixture
def test_admin(client, db):
    """
    Create a test admin user using the test database.
    Returns admin data with credentials and auth token.
    """
    from app.database import User
    
    admin_data = {
        "username": "adminuser",
        "email": "admin@example.com",
        "password": "AdminPassword123"
    }
    
    hashed_password = get_password_hash(admin_data["password"])
    admin = User(
        username=admin_data["username"],
        email=admin_data["email"],
        password=hashed_password,
        is_admin=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    # Get auth token
    login_response = client.post("/api/auth/login", json={
        "username": admin_data["username"],
        "password": admin_data["password"]
    })
    
    if login_response.status_code != 200:
        raise Exception(f"Admin login failed: {login_response.json()}")
    
    token = login_response.json()["access_token"]
    
    return {
        **admin_data,
        "user_id": admin.user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }


@pytest.fixture
def test_user_token(client, test_user):
    """
    Get authentication token for test user.
    """
    response = client.post("/api/auth/login", json={
        "username": test_user["username"],
        "password": test_user["password"]
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {
        **test_user,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }


@pytest.fixture
def sample_sweets_data():
    """
    Provide sample sweet data for testing.
    """
    return [
        {
            "name": "Chocolate Bar",
            "category": "Chocolate",
            "price": 2.50,
            "quantity_in_stock": 100
        },
        {
            "name": "Gummy Bears",
            "category": "Gummy",
            "price": 1.99,
            "quantity_in_stock": 50
        },
        {
            "name": "Lollipop",
            "category": "Hard Candy",
            "price": 0.99,
            "quantity_in_stock": 200
        },
        {
            "name": "Dark Chocolate",
            "category": "Chocolate",
            "price": 3.50,
            "quantity_in_stock": 75
        },
        {
            "name": "Sour Gummy Worms",
            "category": "Gummy",
            "price": 2.25,
            "quantity_in_stock": 0  # Out of stock
        }
    ]


@pytest.fixture
def create_sweets(client, test_admin, sample_sweets_data):
    """
    Create multiple sweets in the database for testing.
    Returns list of created sweets with IDs.
    """
    created_sweets = []
    for sweet_data in sample_sweets_data:
        # Send as form data instead of JSON to match new endpoint signature
        response = client.post(
            "/api/sweets/",
            data=sweet_data,
            headers=test_admin["headers"]
        )
        assert response.status_code == 201
        created_sweets.append(response.json())
    return created_sweets
