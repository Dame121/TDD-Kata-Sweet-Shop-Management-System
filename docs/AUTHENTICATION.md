# JWT Authentication Documentation

## Overview
The Sweet Shop Management System now includes secure JWT (JSON Web Token) authentication with bcrypt password hashing for both users and admins.

## Installation

First, install the new dependencies:

```bash
pip install -r requirements.txt
```

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. **IMPORTANT**: Update the `SECRET_KEY` in `.env` with a secure random string:
   ```bash
   # Generate a secure secret key (on Linux/Mac):
   openssl rand -hex 32
   
   # On Windows PowerShell:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

## API Endpoints

### User Endpoints

#### 1. Register New User
**POST** `/users/register`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "is_admin": false
}
```

**Response:**
```json
{
  "user_id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_admin": false
}
```

#### 2. User Login
**POST** `/users/login`

```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "is_admin": false
  }
}
```

#### 3. Get Current User
**GET** `/users/me`

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Response:**
```json
{
  "user_id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_admin": false
}
```

### Admin Endpoints

#### 1. Admin Login
**POST** `/admins/login`

```json
{
  "username": "admin",
  "password": "adminpassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 2,
    "username": "admin",
    "email": "admin@example.com",
    "is_admin": true,
    "is_active": true
  }
}
```

#### 2. Create New Admin (Requires Admin Token)
**POST** `/admins/register`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Body:**
```json
{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "securepassword",
  "is_active": true
}
```

#### 3. Get Current Admin
**GET** `/admins/me`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

### Protected Routes

The following routes now require admin authentication:

- **GET** `/users/` - Get all users
- **GET** `/users/{user_id}` - Get specific user
- **PUT** `/users/{user_id}` - Update user
- **DELETE** `/users/{user_id}` - Delete user
- **GET** `/admins/` - Get all admins
- **GET** `/admins/{admin_id}` - Get specific admin
- **PUT** `/admins/{admin_id}` - Update admin
- **DELETE** `/admins/{admin_id}` - Delete admin

## Using Authentication in API Clients

### Python Requests Example

```python
import requests

# 1. Login
login_response = requests.post(
    "http://localhost:8000/users/login",
    json={"username": "johndoe", "password": "securepassword123"}
)
token_data = login_response.json()
access_token = token_data["access_token"]

# 2. Use token for authenticated requests
headers = {"Authorization": f"Bearer {access_token}"}

# Get current user info
me_response = requests.get(
    "http://localhost:8000/users/me",
    headers=headers
)
print(me_response.json())
```

### JavaScript/Fetch Example

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:8000/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'securepassword123'
  })
});

const { access_token } = await loginResponse.json();

// 2. Use token for authenticated requests
const meResponse = await fetch('http://localhost:8000/users/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

const userData = await meResponse.json();
console.log(userData);
```

### cURL Example

```bash
# 1. Login
curl -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"securepassword123"}'

# 2. Use token (replace YOUR_TOKEN with actual token)
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Features

✅ **Password Hashing**: All passwords are hashed using bcrypt before storage
✅ **JWT Tokens**: Secure token-based authentication
✅ **Token Expiration**: Tokens expire after 30 minutes (configurable)
✅ **Admin Protection**: Admin-only routes require admin privileges
✅ **Active User Check**: Inactive users cannot authenticate

## Creating the First Admin

Since creating an admin requires admin authentication, you need to create the first admin manually:

```python
# Create first_admin.py
from backend.database import SessionLocal, User
from backend.auth_utils import get_password_hash

db = SessionLocal()

# Create first admin
first_admin = User(
    username="admin",
    email="admin@example.com",
    password=get_password_hash("changeme123"),
    is_admin=True,
    is_active=True
)

db.add(first_admin)
db.commit()
print("First admin created! Username: admin, Password: changeme123")
db.close()
```

Run it:
```bash
python first_admin.py
```

## Testing with Swagger UI

1. Start the server:
   ```bash
   python main.py
   ```

2. Open browser to: `http://localhost:8000/docs`

3. Test the authentication:
   - Use `/users/register` to create a user
   - Use `/users/login` to get a token
   - Click "Authorize" button at the top
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Now you can access protected endpoints

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions. Admin access required."
}
```

### 400 Bad Request
```json
{
  "detail": "Email already registered"
}
```

## Token Expiration

- Default: 30 minutes
- Configurable in `.env` via `ACCESS_TOKEN_EXPIRE_MINUTES`
- After expiration, users must login again to get a new token

## Best Practices

1. **Never commit `.env`** - Add it to `.gitignore`
2. **Use strong SECRET_KEY** - Generate random 32+ character string
3. **Change default admin password** - After first login
4. **Use HTTPS in production** - JWT tokens should be sent over secure connections
5. **Store tokens securely** - Use httpOnly cookies or secure storage in clients
6. **Implement token refresh** - For better UX (future enhancement)
