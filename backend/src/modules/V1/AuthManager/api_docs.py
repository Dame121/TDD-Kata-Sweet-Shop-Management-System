"""
API documentation for Authentication & Users endpoints.
Contains manual documentation for all auth-related routes.
"""

# User Registration Handler
user_register_handler = {
    "POST": {
        "summary": "Register New User",
        "description": (
            "**📝 Register User Account**\n\n"
            "Creates a new user account in the system. Each user can have a unique "
            "username and email address.\n\n"
            "**Fields accepted:**\n"
            "- `username` (required, unique) - Username for login\n"
            "- `email` (required, unique) - Email address\n"
            "- `password` (required) - Password (will be hashed)\n\n"
            "**Returns:** User details with `user_id` and status.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": {
                            "username": "johndoe",
                            "email": "john@example.com",
                            "password": "securePassword123"
                        }
                    }
                }
            }
        },
    },
}

# User Login Handler
user_login_handler = {
    "POST": {
        "summary": "User Login",
        "description": (
            "**🔐 Authenticate User**\n\n"
            "Authenticates a user and returns a JWT access token. Use username/email and password.\n\n"
            "**Fields accepted:**\n"
            "- `username` (required) - Username or email\n"
            "- `password` (required) - User password\n\n"
            "**Returns:** JWT access token and token type.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": {
                            "username": "johndoe",
                            "password": "securePassword123"
                        }
                    }
                }
            }
        },
    },
}

# Current User Handler
current_user_handler = {
    "GET": {
        "summary": "Get Current User Info",
        "description": (
            "**👤 Fetch Current User**\n\n"
            "Returns information about the currently authenticated user. Requires valid JWT token.\n\n"
            "**Authentication:** Required (JWT Bearer Token)\n\n"
            "**Returns:** Current user details including username, email, and admin status.\n"
        ),
        "openapi_extra": {},
    },
}

# Get All Users Handler
all_users_handler = {
    "GET": {
        "summary": "List All Users",
        "description": (
            "**👥 Fetch All Users**\n\n"
            "Retrieves a paginated list of all users in the system. "
            "Requires admin authentication.\n\n"
            "**Query Parameters:**\n"
            "- `skip` (optional) - Number of records to skip (default: 0)\n"
            "- `limit` (optional) - Maximum records to return (default: 100)\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** List of user objects with pagination.\n"
        ),
        "openapi_extra": {},
    },
}

# Get User by ID Handler
user_by_id_handler = {
    "GET": {
        "summary": "Get User by ID",
        "description": (
            "**🔍 Fetch Specific User**\n\n"
            "Retrieves a specific user's information by their user ID. "
            "Requires admin authentication.\n\n"
            "**Path Parameter:**\n"
            "- `user_id` (required) - ID of the user to retrieve\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** User object with all details.\n"
        ),
        "openapi_extra": {},
    },
    "PUT": {
        "summary": "Update User",
        "description": (
            "**🔧 Update User Details**\n\n"
            "Updates an existing user's information. Requires admin authentication.\n\n"
            "**Path Parameter:**\n"
            "- `user_id` (required) - ID of the user to update\n\n"
            "**Fields that can be updated:**\n"
            "- `username` (optional)\n"
            "- `email` (optional)\n"
            "- `password` (optional)\n"
            "- `is_admin` (optional)\n"
            "- `is_active` (optional)\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** Updated user object.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": {
                            "username": "johndoe_updated",
                            "email": "newemail@example.com"
                        }
                    }
                }
            }
        },
    },
    "DELETE": {
        "summary": "Delete User",
        "description": (
            "**🗑️ Delete User Account**\n\n"
            "Permanently deletes a user from the system. Requires admin authentication.\n\n"
            "**Path Parameter:**\n"
            "- `user_id` (required) - ID of the user to delete\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** No content (204 status).\n"
        ),
        "openapi_extra": {},
    },
}

# Admin Registration Handler
admin_register_handler = {
    "POST": {
        "summary": "Create Admin Account",
        "description": (
            "**👨‍💼 Register Admin**\n\n"
            "Creates a new admin account in the system. Only existing admins can create new admins.\n\n"
            "**Fields accepted:**\n"
            "- `username` (required, unique) - Admin username\n"
            "- `email` (required, unique) - Admin email\n"
            "- `password` (required) - Admin password\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** Admin details with status.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": {
                            "username": "admin_user",
                            "email": "admin@example.com",
                            "password": "adminPassword123"
                        }
                    }
                }
            }
        },
    },
}
