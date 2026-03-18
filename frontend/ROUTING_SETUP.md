# Frontend Routing Setup Instructions

## 🛣️ Overview

This document explains how routing is configured in the Sweet Shop Management System frontend using **React Router v6/v7**.

---

## 📍 Basic Route Definition

All routes are defined in the main `App.js` file using React Router's `<Routes>` component.

### Example Routes Structure

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={<AdminDashboard />} 
        />
        
        {/* Protected User Routes */}
        <Route 
          path="/user" 
          element={<UserDashboard />} 
        />
        
        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🔐 Protected Routes

Protected routes require authentication. Here's how to implement route protection:

### Route Protection Pattern

```javascript
import { Navigate } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ element, userRole, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/404" replace />;
  }
  
  return element;
};

// Usage in App.js
<Route 
  path="/admin" 
  element={
    <ProtectedRoute 
      element={<AdminDashboard />} 
      requiredRole="admin"
    />
  } 
/>
```

---

## 🧭 Navigation Examples

### Using Link Component

```javascript
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/services">Services</Link>
    </nav>
  );
}
```

### Using useNavigate Hook

```javascript
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // After successful login
    navigate('/user'); // Navigate to user dashboard
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
    </form>
  );
}
```

### Using Navigate Component

```javascript
import { Navigate } from 'react-router-dom';

function OldPage() {
  return <Navigate to="/new-page" replace />;
}
```

---

## 📂 Project Route Structure

```
routes/
├── /                 → Landing page / Home
├── /login            → Login page (public)
├── /signup           → Sign up page (public)
├── /admin            → Admin dashboard (protected - admin only)
├── /admin/users      → Manage users (protected - admin only)
├── /admin/inventory  → Manage inventory (protected - admin only)
├── /user             → User dashboard (protected - user only)
├── /user/orders      → View orders (protected - user only)
├── /user/ratings     → View ratings (protected - user only)
└── /404              → Not found page
```

---

## 🔄 URL Parameters

Access dynamic URL parameters using `useParams`:

```javascript
import { useParams } from 'react-router-dom';

// Route definition
<Route path="/products/:id" element={<ProductDetail />} />

// Component using parameter
function ProductDetail() {
  const { id } = useParams();
  
  return <div>Product ID: {id}</div>;
}
```

---

## 🔍 Query Parameters

Handle query strings with `useSearchParams`:

```javascript
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  return (
    <div>
      <h1>Search Results for: {query}</h1>
    </div>
  );
}

// Link: <Link to="/search?q=chocolate">Chocolate</Link>
```

---

## 🌐 API Integration with Routing

Fetch data based on routes:

```javascript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function SweetDetail() {
  const { id } = useParams();
  const [sweet, setSweet] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    axios.get(`/api/sweets/${id}`)
      .then(response => setSweet(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, [id]);
  
  if (loading) return <div>Loading...</div>;
  if (!sweet) return <div>Not found</div>;
  
  return <div><h1>{sweet.name}</h1></div>;
}
```

---

## ⚙️ Router Configuration in main.jsx/index.js

```javascript
// In main.jsx or index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

The `<BrowserRouter>` wrapper is typically in `App.js` as shown in the example above.

---

## 🔗 Nested Routes

Create route hierarchies for complex applications:

```javascript
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="admin-container">
      <Sidebar />
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}

// Route definition with children
<Route path="/admin" element={<AdminLayout />}>
  <Route path="users" element={<Users />} />
  <Route path="inventory" element={<Inventory />} />
  <Route path="ratings" element={<Ratings />} />
</Route>
```

---

## 🎯 404 Page Implementation

```javascript
function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">The page you're looking for doesn't exist.</p>
      <button 
        onClick={() => navigate('/')}
        className="bg-amber-500 text-white px-6 py-2 rounded"
      >
        Go Home
      </button>
    </div>
  );
}
```

---

## 🔗 Active Link Styling

Highlight the current route with `NavLink`:

```javascript
import { NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <NavLink 
        to="/home"
        className={({ isActive }) => isActive ? 'nav-active' : ''}
      >
        Home
      </NavLink>
      
      <NavLink 
        to="/about"
        className={({ isActive }) => isActive ? 'text-amber-500' : 'text-gray-600'}
      >
        About
      </NavLink>
    </nav>
  );
}
```

---

## 📋 Routing Best Practices

1. **Keep routes organized** - Group related routes together
2. **Use lazy loading** - Load components only when needed with `React.lazy()`
3. **Set meaningful paths** - Use clear, descriptive URL patterns
4. **Protect sensitive routes** - Always check authentication before rendering admin pages
5. **Handle 404s** - Always have a catch-all fallback route
6. **Consistent naming** - Use lowercase, kebab-case URLs (e.g., `/admin-dashboard`)
7. **Link over navigation** - Use `<Link>` and `<NavLink>` instead of `<a>` tags for better performance
8. **State persistence** - Save auth state in localStorage or Context API for route protection

---

## 🚀 Running the Development Server

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173 (Vite)
# or http://localhost:3000 (Create React App)
```

---

## 📚 Related Documentation

- [Dependencies Documentation](./DEPENDENCIES.md) - Frontend package versions
- [React Router Documentation](https://reactrouter.com/) - Official React Router docs
- [Vite Configuration](./vite.config.js) - Build tool setup
- [App.js](./src/App.js) - Main application file with routes

---

## ❓ Troubleshooting

### Routes not working
- Ensure `<BrowserRouter>` wrapper is in place
- Check that route paths don't have typos
- Verify component imports are correct

### Navigation not working
- Use `<Link>` or `<NavLink>` instead of `<a>` tags
- Check that paths match route definitions
- Verify `useNavigate()` hook is used in function components

### Protected routes not working
- Verify authentication token is stored in localStorage
- Check the `ProtectedRoute` component logic
- Ensure user role is correctly saved and validated

### 404 page showing unexpectedly
- Check that all routes are defined
- Verify there are no typos in paths
- Ensure catch-all route (`path="*"`) is last in Routes list
