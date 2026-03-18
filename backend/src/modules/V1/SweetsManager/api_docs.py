"""
API documentation for Sweets Management endpoints.
Contains manual documentation for all sweets inventory and transaction routes.
"""

# Create Sweet Handler
create_sweet_handler = {
    "POST": {
        "summary": "Add New Sweet",
        "description": (
            "**🍬 Create Sweet Product**\n\n"
            "Adds a new sweet to the inventory. Requires admin authentication.\n\n"
            "**Fields accepted:**\n"
            "- `name` (required) - Sweet product name\n"
            "- `category` (required) - Product category\n"
            "- `price` (required) - Product price (must be >= 0)\n"
            "- `quantity_in_stock` (optional) - Initial quantity (default: 0)\n"
            "- `description` (optional) - Product description\n"
            "- `image` (optional) - Product image file (ImageKit upload)\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** Created sweet object with `sweet_id`.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "multipart/form-data": {
                        "example": {
                            "name": "Chocolate Truffle",
                            "category": "Chocolate",
                            "price": 5.99,
                            "quantity_in_stock": 50,
                            "description": "Premium Belgian chocolate truffle"
                        }
                    }
                }
            }
        },
    },
}

# Get All Sweets Handler
all_sweets_handler = {
    "GET": {
        "summary": "List All Sweets",
        "description": (
            "**🍭 Fetch All Sweets**\n\n"
            "Retrieves a paginated list of all sweets in inventory.\n\n"
            "**Query Parameters:**\n"
            "- `skip` (optional) - Number of records to skip (default: 0)\n"
            "- `limit` (optional) - Maximum records to return (default: 100)\n\n"
            "**Authentication:** Not required (public)\n\n"
            "**Returns:** List of sweet objects with pagination.\n"
        ),
        "openapi_extra": {},
    },
}

# Search Sweets Handler
search_sweets_handler = {
    "GET": {
        "summary": "Search & Filter Sweets",
        "description": (
            "**🔍 Search Sweets**\n\n"
            "Search and filter sweets by name, category, or price range.\n\n"
            "**Query Parameters:**\n"
            "- `query` (optional) - Search by sweet name (partial match)\n"
            "- `category` (optional) - Filter by category\n"
            "- `min_price` (optional) - Minimum price filter\n"
            "- `max_price` (optional) - Maximum price filter\n"
            "- `skip` (optional) - Pagination offset (default: 0)\n"
            "- `limit` (optional) - Max results per page (default: 100)\n\n"
            "**Authentication:** Not required (public)\n\n"
            "**Returns:** List of matching sweet objects.\n"
        ),
        "openapi_extra": {},
    },
}

# Get Sweets by Category Handler
category_sweets_handler = {
    "GET": {
        "summary": "Get Sweets by Category",
        "description": (
            "**📂 Fetch Category Sweets**\n\n"
            "Retrieves all sweets in a specific category.\n\n"
            "**Path Parameter:**\n"
            "- `category` (required) - Category name\n\n"
            "**Authentication:** Not required (public)\n\n"
            "**Returns:** List of sweets in the specified category.\n"
        ),
        "openapi_extra": {},
    },
}

# Get Sweet by ID Handler
sweet_by_id_handler = {
    "GET": {
        "summary": "Get Sweet Details",
        "description": (
            "**🍫 Fetch Sweet by ID**\n\n"
            "Retrieves detailed information about a specific sweet.\n\n"
            "**Path Parameter:**\n"
            "- `sweet_id` (required) - ID of the sweet to retrieve\n\n"
            "**Authentication:** Not required (public)\n\n"
            "**Returns:** Sweet object with full details.\n"
        ),
        "openapi_extra": {},
    },
    "PUT": {
        "summary": "Update Sweet Details",
        "description": (
            "**🔧 Update Sweet**\n\n"
            "Updates an existing sweet's information. Requires admin authentication.\n\n"
            "**Path Parameter:**\n"
            "- `sweet_id` (required) - ID of the sweet to update\n\n"
            "**Fields that can be updated:**\n"
            "- `name` (optional)\n"
            "- `category` (optional)\n"
            "- `price` (optional)\n"
            "- `quantity_in_stock` (optional)\n"
            "- `description` (optional)\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** Updated sweet object.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": {
                            "price": 6.99,
                            "quantity_in_stock": 45,
                            "description": "Updated description"
                        }
                    }
                }
            }
        },
    },
    "DELETE": {
        "summary": "Delete Sweet",
        "description": (
            "**🗑️ Delete Sweet**\n\n"
            "Permanently removes a sweet from inventory. Requires admin authentication.\n\n"
            "**Path Parameter:**\n"
            "- `sweet_id` (required) - ID of the sweet to delete\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** No content (204 status).\n"
        ),
        "openapi_extra": {},
    },
}

# Update Sweet Image Handler
update_sweet_image_handler = {
    "PUT": {
        "summary": "Update Sweet Image",
        "description": (
            "**🖼️ Upload/Update Sweet Image**\n\n"
            "Uploads or updates the product image using ImageKit. Requires admin authentication.\n\n"
            "**Path Parameter:**\n"
            "- `sweet_id` (required) - ID of the sweet\n\n"
            "**Fields accepted:**\n"
            "- `image` (required) - Image file to upload\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** Updated sweet object with new image URL.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "multipart/form-data": {
                        "example": {
                            "image": "(binary file)"
                        }
                    }
                }
            }
        },
    },
    "DELETE": {
        "summary": "Delete Sweet Image",
        "description": (
            "**🚫 Remove Sweet Image**\n\n"
            "Removes the image from a sweet product. Requires admin authentication.\n\n"
            "**Path Parameter:**\n"
            "- `sweet_id` (required) - ID of the sweet\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** No content (204 status).\n"
        ),
        "openapi_extra": {},
    },
}

# Purchase Sweet Handler
purchase_sweet_handler = {
    "POST": {
        "summary": "Purchase Sweet",
        "description": (
            "**🛒 Purchase Sweet Product**\n\n"
            "Records a purchase transaction and decreases inventory. Requires authentication.\n\n"
            "**Path Parameter:**\n"
            "- `sweet_id` (required) - ID of the sweet to purchase\n\n"
            "**Fields accepted:**\n"
            "- `quantity` (required) - Number of units to purchase\n\n"
            "**Authentication:** User required\n\n"
            "**Returns:** Transaction record with details.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": {
                            "quantity": 3
                        }
                    }
                }
            }
        },
    },
}

# Restock Sweet Handler
restock_sweet_handler = {
    "POST": {
        "summary": "Restock Sweet",
        "description": (
            "**📦 Restock Inventory**\n\n"
            "Records a restock transaction and increases inventory. Requires admin authentication.\n\n"
            "**Path Parameter:**\n"
            "- `sweet_id` (required) - ID of the sweet to restock\n\n"
            "**Fields accepted:**\n"
            "- `quantity` (required) - Number of units to add to inventory\n\n"
            "**Authentication:** Admin required\n\n"
            "**Returns:** Transaction record with restock details.\n"
        ),
        "openapi_extra": {
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": {
                            "quantity": 100
                        }
                    }
                }
            }
        },
    },
}
