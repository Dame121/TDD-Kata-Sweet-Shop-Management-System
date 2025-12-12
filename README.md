# Sweet Shop Management System API

A FastAPI-based REST API for managing a sweet shop, including products, customers, and orders.

## Features

- **Products Management**: Create, read, update, and delete products
- **Customer Management**: Manage customer information
- **Order Processing**: Create orders, track status, and manage inventory
- **Automatic Stock Management**: Stock is automatically adjusted when orders are placed
- **Order Status Tracking**: Track orders through pending, processing, completed, and cancelled states

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

Start the server:
```bash
python main.py
```

The API will be available at:
- Main API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative API docs: http://localhost:8000/redoc

## API Endpoints

### Products
- `GET /api/products/` - Get all products
- `GET /api/products/{id}` - Get specific product
- `POST /api/products/` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `PATCH /api/products/{id}/stock` - Update stock quantity

### Customers
- `GET /api/customers/` - Get all customers
- `GET /api/customers/{id}` - Get specific customer
- `POST /api/customers/` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Orders
- `GET /api/orders/` - Get all orders
- `GET /api/orders/{id}` - Get specific order
- `GET /api/orders/customer/{customer_id}` - Get customer's orders
- `POST /api/orders/` - Create new order
- `PATCH /api/orders/{id}/status` - Update order status
- `DELETE /api/orders/{id}` - Cancel order

## Example Usage

### Create a Product
```bash
curl -X POST "http://localhost:8000/api/products/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chocolate Brownies",
    "description": "Fudgy chocolate brownies",
    "price": 10.99,
    "stock": 30,
    "category": "Brownies"
  }'
```

### Create a Customer
```bash
curl -X POST "http://localhost:8000/api/customers/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1987654321",
    "address": "456 Oak Ave"
  }'
```

### Create an Order
```bash
curl -X POST "http://localhost:8000/api/orders/" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "quantity": 2, "price": 25.99},
      {"product_id": 3, "quantity": 1, "price": 8.99}
    ],
    "notes": "Please deliver before 5 PM"
  }'
```

## Project Structure

```
Sweet Shop Management System/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── README.md              # This file
└── app/
    ├── __init__.py
    ├── app.py             # FastAPI application
    ├── models.py          # Pydantic models
    ├── database.py        # In-memory database
    └── routers/
        ├── __init__.py
        ├── products.py    # Product endpoints
        ├── customers.py   # Customer endpoints
        └── orders.py      # Order endpoints
```

## Notes

- This uses an in-memory database for demonstration. In production, replace with a real database (PostgreSQL, MongoDB, etc.)
- Stock is automatically adjusted when orders are created
- Orders can only be cancelled if they're in pending or processing status
- Customer emails must be unique
