# Sweet Shop Frontend - Authentication Testing Interface

A simple React application to test the Sweet Shop Management System API authentication endpoints.

## Features

- 🔐 User Registration (Signup)
- 🔑 User Login
- 🎨 Modern, responsive UI
- 📋 Token display and copy functionality
- ⚡ Real-time feedback for API responses

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Sweet Shop API running on `http://localhost:5000`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Make sure your Flask API is running on port 5000

2. Start the React development server:
```bash
npm start
```

3. The application will open automatically in your browser at `http://localhost:3000`

## Usage

### Sign Up
1. Click on the "Sign Up" tab
2. Fill in the registration form:
   - Username
   - Email
   - Password
   - Role (customer, store_owner, or supplier)
3. Click "Create Account"
4. You'll see a success or error message

### Login
1. Click on the "Login" tab
2. Enter your username and password
3. Click "Login"
4. Upon successful login, you'll receive an access token
5. Use the "Copy Token" button to copy it to your clipboard

## API Configuration

The API base URL is set to `http://localhost:5000` by default. If your API is running on a different port or host, update the `API_BASE_URL` constant in `src/App.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000';
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # Styling
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json
└── README.md
```

## API Endpoints Used

- **POST** `/auth/users/signup` - Create a new user account
- **POST** `/auth/users/login` - Authenticate and get access token

## Troubleshooting

### CORS Errors
If you encounter CORS errors, make sure your Flask API has CORS enabled:

```python
from flask_cors import CORS
CORS(app)
```

### Connection Refused
Make sure your Flask API is running before starting the frontend:

```bash
python main.py
```

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `build/` directory.
