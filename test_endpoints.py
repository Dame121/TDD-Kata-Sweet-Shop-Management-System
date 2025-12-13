import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(title, response):
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_users():
    print("\n" + "🔐 TESTING USER ENDPOINTS (auth)" + "\n")
    
    # 1. Create users
    print("\n1️⃣  Creating users...")
    users_data = [
        {"username": "john_doe", "email": "john@example.com", "password": "password123", "is_admin": False},
        {"username": "admin_user", "email": "admin@example.com", "password": "admin123", "is_admin": True},
        {"username": "jane_smith", "email": "jane@example.com", "password": "password456", "is_admin": False}
    ]
    
    created_user_ids = []
    for user_data in users_data:
        response = requests.post(f"{BASE_URL}/users/", json=user_data)
        print_response(f"Create User: {user_data['username']}", response)
        if response.status_code == 201:
            created_user_ids.append(response.json()['user_id'])
    
    # 2. Get all users
    print("\n2️⃣  Getting all users...")
    response = requests.get(f"{BASE_URL}/users/")
    print_response("Get All Users", response)
    
    # 3. Get specific user
    if created_user_ids:
        print("\n3️⃣  Getting specific user...")
        response = requests.get(f"{BASE_URL}/users/{created_user_ids[0]}")
        print_response(f"Get User ID: {created_user_ids[0]}", response)
    
    # 4. Update user
    if created_user_ids:
        print("\n4️⃣  Updating user...")
        update_data = {"username": "john_doe_updated", "is_admin": True}
        response = requests.put(f"{BASE_URL}/users/{created_user_ids[0]}", json=update_data)
        print_response(f"Update User ID: {created_user_ids[0]}", response)
    
    # 5. Delete user
    if len(created_user_ids) > 2:
        print("\n5️⃣  Deleting user...")
        response = requests.delete(f"{BASE_URL}/users/{created_user_ids[2]}")
        print_response(f"Delete User ID: {created_user_ids[2]}", response)
    
    return created_user_ids

def test_sweets():
    print("\n" + "🍬 TESTING SWEETS ENDPOINTS" + "\n")
    
    # 1. Create sweets
    print("\n1️⃣  Creating sweets...")
    sweets_data = [
        {"name": "Chocolate Truffle", "category": "Chocolate", "price": 2.50, "quantity_in_stock": 100},
        {"name": "Strawberry Gummy", "category": "Gummy", "price": 1.50, "quantity_in_stock": 200},
        {"name": "Milk Chocolate Bar", "category": "Chocolate", "price": 3.00, "quantity_in_stock": 150},
        {"name": "Lemon Drops", "category": "Hard Candy", "price": 1.00, "quantity_in_stock": 300}
    ]
    
    created_sweet_ids = []
    for sweet_data in sweets_data:
        response = requests.post(f"{BASE_URL}/sweets/", json=sweet_data)
        print_response(f"Create Sweet: {sweet_data['name']}", response)
        if response.status_code == 201:
            created_sweet_ids.append(response.json()['sweet_id'])
    
    # 2. Get all sweets
    print("\n2️⃣  Getting all sweets...")
    response = requests.get(f"{BASE_URL}/sweets/")
    print_response("Get All Sweets", response)
    
    # 3. Get specific sweet
    if created_sweet_ids:
        print("\n3️⃣  Getting specific sweet...")
        response = requests.get(f"{BASE_URL}/sweets/{created_sweet_ids[0]}")
        print_response(f"Get Sweet ID: {created_sweet_ids[0]}", response)
    
    # 4. Get sweets by category
    print("\n4️⃣  Getting sweets by category (Chocolate)...")
    response = requests.get(f"{BASE_URL}/sweets/category/Chocolate")
    print_response("Get Sweets by Category: Chocolate", response)
    
    # 5. Update sweet
    if created_sweet_ids:
        print("\n5️⃣  Updating sweet...")
        update_data = {"price": 2.75, "quantity_in_stock": 120}
        response = requests.put(f"{BASE_URL}/sweets/{created_sweet_ids[0]}", json=update_data)
        print_response(f"Update Sweet ID: {created_sweet_ids[0]}", response)
    
    # 6. Delete sweet
    if len(created_sweet_ids) > 3:
        print("\n6️⃣  Deleting sweet...")
        response = requests.delete(f"{BASE_URL}/sweets/{created_sweet_ids[3]}")
        print_response(f"Delete Sweet ID: {created_sweet_ids[3]}", response)
    
    return created_sweet_ids

def test_health():
    print("\n" + "💚 TESTING HEALTH & ROOT ENDPOINTS" + "\n")
    
    # Root endpoint
    response = requests.get(f"{BASE_URL}/")
    print_response("Root Endpoint", response)
    
    # Health endpoint
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 SWEET SHOP API ENDPOINT TESTING")
    print("="*60)
    
    try:
        # Test health endpoints
        test_health()
        
        # Test user endpoints
        user_ids = test_users()
        
        # Test sweets endpoints
        sweet_ids = test_sweets()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS COMPLETED!")
        print("="*60)
        print(f"\nCreated Users: {user_ids}")
        print(f"Created Sweets: {sweet_ids}")
        print("\n💡 Tip: Visit http://localhost:8000/docs for interactive API documentation")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to the server.")
        print("Please make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
