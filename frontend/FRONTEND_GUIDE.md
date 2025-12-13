# Sweet Shop Management System - Frontend Guide

## 🎯 Overview

The frontend provides separate landing pages for **Users** and **Admins** with role-based access control using JWT authentication.

## 🚀 Features

### For All Users
- **Authentication**: Login and Signup pages
- **JWT Token Management**: Secure token-based authentication
- **Role Detection**: Automatic redirect based on user role

### For Regular Users (👤)
- **Sweet Shop Browse**: View all available sweets
- **Search & Filter**: Search by name and filter by category
- **Purchase**: Buy sweets directly from the inventory
- **Real-time Stock**: See current availability
- **User Dashboard**: Clean, intuitive interface

### For Admins (👑)
- **Dashboard Overview**: 
  - Total stock count
  - Number of products
  - Low stock alerts
  - Inventory value
  - User count
- **Inventory Management**:
  - Add new sweets
  - Restock items
  - Delete products
  - View all inventory details
- **User Management**:
  - View all registered users
  - See user roles (Admin/User)
  - Monitor user activity

## 📋 How to Use

### 1. Start the Backend Server
```bash
# From the root directory
python main.py
```
Backend will run on: `http://localhost:8000`

### 2. Start the Frontend
```bash
cd frontend
npm install  # First time only
npm start
```
Frontend will run on: `http://localhost:3000`

### 3. Create Accounts

#### Create User Account:
1. Click on "Sign Up" tab
2. Fill in:
   - Username
   - Email
   - Password
   - Account Type: **Regular User**
3. Click "Create Account"
4. Switch to "Login" tab and login

#### Create Admin Account:
1. Click on "Sign Up" tab
2. Fill in:
   - Username
   - Email  
   - Password
   - Account Type: **Admin**
3. Click "Create Account"
4. Switch to "Login" tab and login

## 🎨 User Interface

### Login Page
- Clean, modern design with gradient background
- Toggle between Login and Signup
- Real-time validation
- Error/Success messages

### User Dashboard
- **Header**: Shows username and role badge
- **Search Bar**: Quick search for sweets
- **Category Filter**: Filter by sweet categories
- **Sweet Cards**: Grid layout with:
  - Sweet name and category
  - Price
  - Stock availability
  - Purchase button
- **Logout**: Easy logout option

### Admin Dashboard
- **Navigation Tabs**:
  - 📊 Overview: Statistics and alerts
  - 📦 Inventory: Manage products
  - 👥 Users: View all users

- **Overview Section**:
  - Key metrics in card format
  - Low stock alerts
  - Quick insights

- **Inventory Section**:
  - Full product table
  - Add new sweet button
  - Restock functionality
  - Delete products
  - Color-coded stock levels

- **Users Section**:
  - List of all users
  - User roles displayed
  - User status information

## 🔐 API Endpoints Used

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/users/me` - Get current user

### Sweets (User & Admin)
- `GET /api/sweets/` - Get all sweets
- `POST /api/sweets/{sweet_id}/purchase` - Purchase sweet (User)

### Sweets (Admin Only)
- `POST /api/sweets/` - Add new sweet
- `POST /api/sweets/{sweet_id}/restock` - Restock sweet
- `DELETE /api/sweets/{sweet_id}` - Delete sweet

### Users (Admin Only)
- `GET /api/auth/users` - Get all users

## 🎯 Key Features

### Role-Based Access
- System automatically detects user role from JWT token
- Users see shopping interface
- Admins see management interface
- Protected routes with authentication

### Real-time Updates
- Inventory updates immediately after purchase
- Stock levels refresh after restock
- Dynamic category filtering

### Responsive Design
- Works on desktop and mobile
- Adaptive layouts
- Touch-friendly buttons

## 🔧 Customization

### Change API URL
Edit `API_BASE_URL` in:
- `src/App.js`
- `src/components/UserDashboard.js`
- `src/components/AdminDashboard.js`

### Styling
- `src/App.css` - Login/Signup page
- `src/components/UserDashboard.css` - User dashboard
- `src/components/AdminDashboard.css` - Admin dashboard

## 🐛 Troubleshooting

### "Network Error" on login
- Ensure backend is running on `http://localhost:8000`
- Check CORS is enabled in backend

### Token not working
- Token expires after 30 minutes
- Re-login to get new token

### Can't see inventory
- Ensure you're logged in as admin for admin features
- Regular users can only browse and purchase

## 📱 Screenshots Flow

1. **Login Page** → Enter credentials
2. **User Dashboard** → Browse sweets → Purchase
3. **Admin Dashboard** → Manage inventory → View users

## 🎓 Development Notes

### Components Structure
```
src/
├── App.js                    # Main app with auth logic
├── App.css                   # Auth page styles
├── components/
│   ├── UserDashboard.js     # User landing page
│   ├── UserDashboard.css    # User styles
│   ├── AdminDashboard.js    # Admin landing page
│   └── AdminDashboard.css   # Admin styles
```

### State Management
- Local state with React hooks
- JWT token stored in state (can be moved to localStorage)
- User info retrieved from login response

### Security
- JWT tokens in Authorization header
- Role-based component rendering
- Backend validates all admin actions

## 🚀 Future Enhancements
- LocalStorage for persistent login
- Order history for users
- Sales analytics for admins
- Export inventory reports
- Email notifications
- Password reset functionality

---

**Built with React and FastAPI** 🍬
