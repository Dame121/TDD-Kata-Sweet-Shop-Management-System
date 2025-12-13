import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_BASE_URL = 'http://localhost:8000';

function AdminDashboard({ user, token, onLogout }) {
  const [sweets, setSweets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddSweet, setShowAddSweet] = useState(false);
  
  const [newSweet, setNewSweet] = useState({
    name: '',
    category: '',
    price: '',
    quantity_in_stock: '',
    image: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSweets(), fetchUsers()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSweets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSweets(data);
      }
    } catch (error) {
      console.error('Error fetching sweets:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddSweet = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append('name', newSweet.name);
      formData.append('category', newSweet.category);
      formData.append('price', parseFloat(newSweet.price));
      formData.append('quantity_in_stock', parseInt(newSweet.quantity_in_stock));
      
      // Add image if selected
      if (newSweet.image) {
        formData.append('image', newSweet.image);
      }

      const response = await fetch(`${API_BASE_URL}/api/sweets/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Sweet added successfully!');
        setShowAddSweet(false);
        setNewSweet({ name: '', category: '', price: '', quantity_in_stock: '', image: null });
        fetchSweets();
      } else {
        setMessage(`❌ ${data.detail || 'Failed to add sweet'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleRestock = async (sweetId, sweetName) => {
    const quantity = prompt(`How many ${sweetName} would you like to add to stock?`);
    
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setMessage('Invalid quantity');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}/restock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: parseInt(quantity) })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully restocked ${quantity} ${sweetName}!`);
        fetchSweets();
      } else {
        setMessage(`❌ ${data.detail || 'Restock failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleDeleteSweet = async (sweetId, sweetName) => {
    if (!window.confirm(`Are you sure you want to delete ${sweetName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage(`✅ Successfully deleted ${sweetName}`);
        fetchSweets();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.detail || 'Delete failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const totalStock = sweets.reduce((sum, sweet) => sum + sweet.quantity_in_stock, 0);
  const lowStockItems = sweets.filter(sweet => sweet.quantity_in_stock < 10).length;
  const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity_in_stock), 0);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand">
            <h1>🍬 Sweet Shop Admin</h1>
            <p>Welcome, Admin {user.username}</p>
          </div>
          <div className="user-info">
            <span className="admin-badge">👑 Admin</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button
          className={activeSection === 'overview' ? 'active' : ''}
          onClick={() => setActiveSection('overview')}
        >
          📊 Overview
        </button>
        <button
          className={activeSection === 'inventory' ? 'active' : ''}
          onClick={() => setActiveSection('inventory')}
        >
          📦 Inventory
        </button>
        <button
          className={activeSection === 'users' ? 'active' : ''}
          onClick={() => setActiveSection('users')}
        >
          👥 Users
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
              <button onClick={() => setMessage('')} className="close-btn">×</button>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading dashboard...</div>
          ) : (
            <>
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="overview-section">
                  <h2>Dashboard Overview</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">📦</div>
                      <div className="stat-info">
                        <h3>Total Stock</h3>
                        <p className="stat-value">{totalStock}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🍭</div>
                      <div className="stat-info">
                        <h3>Products</h3>
                        <p className="stat-value">{sweets.length}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">⚠️</div>
                      <div className="stat-info">
                        <h3>Low Stock Items</h3>
                        <p className="stat-value">{lowStockItems}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-info">
                        <h3>Inventory Value</h3>
                        <p className="stat-value">₹{totalValue.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">👥</div>
                      <div className="stat-info">
                        <h3>Total Users</h3>
                        <p className="stat-value">{users.length}</p>
                      </div>
                    </div>
                  </div>

                  {lowStockItems > 0 && (
                    <div className="alert-section">
                      <h3>⚠️ Low Stock Alert</h3>
                      <div className="alert-items">
                        {sweets.filter(sweet => sweet.quantity_in_stock < 10).map(sweet => (
                          <div key={sweet.sweet_id} className="alert-item">
                            <span>{sweet.name}</span>
                            <span className="stock-badge">{sweet.quantity_in_stock} left</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Section */}
              {activeSection === 'inventory' && (
                <div className="inventory-section">
                  <div className="section-header">
                    <h2>Inventory Management</h2>
                    <button onClick={() => setShowAddSweet(true)} className="add-btn">
                      ➕ Add New Sweet
                    </button>
                  </div>

                  {showAddSweet && (
                    <div className="modal-overlay" onClick={() => setShowAddSweet(false)}>
                      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Add New Sweet</h3>
                        <form onSubmit={handleAddSweet}>
                          <input
                            type="text"
                            placeholder="Sweet Name"
                            value={newSweet.name}
                            onChange={(e) => setNewSweet({...newSweet, name: e.target.value})}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Category"
                            value={newSweet.category}
                            onChange={(e) => setNewSweet({...newSweet, category: e.target.value})}
                            required
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={newSweet.price}
                            onChange={(e) => setNewSweet({...newSweet, price: e.target.value})}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Initial Stock"
                            value={newSweet.quantity_in_stock}
                            onChange={(e) => setNewSweet({...newSweet, quantity_in_stock: e.target.value})}
                            required
                          />
                          <div className="file-input-container">
                            <label htmlFor="sweet-image" className="file-input-label">
                              📷 {newSweet.image ? newSweet.image.name : 'Choose Image (Optional)'}
                            </label>
                            <input
                              type="file"
                              id="sweet-image"
                              accept="image/*"
                              onChange={(e) => setNewSweet({...newSweet, image: e.target.files[0]})}
                              className="file-input"
                            />
                          </div>
                          <div className="modal-actions">
                            <button type="submit" className="submit-btn">Add Sweet</button>
                            <button type="button" onClick={() => setShowAddSweet(false)} className="cancel-btn">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="inventory-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sweets.map(sweet => (
                          <tr key={sweet.sweet_id}>
                            <td>
                              {sweet.image_url ? (
                                <img 
                                  src={sweet.image_url} 
                                  alt={sweet.name}
                                  className="sweet-thumbnail"
                                />
                              ) : (
                                <div className="no-image">📷</div>
                              )}
                            </td>
                            <td>{sweet.sweet_id}</td>
                            <td>{sweet.name}</td>
                            <td><span className="category-badge">{sweet.category}</span></td>
                            <td>₹{sweet.price.toFixed(2)}</td>
                            <td>
                              <span className={`stock-badge ${sweet.quantity_in_stock < 10 ? 'low' : ''}`}>
                                {sweet.quantity_in_stock}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleRestock(sweet.sweet_id, sweet.name)}
                                className="action-btn restock"
                              >
                                📦 Restock
                              </button>
                              <button
                                onClick={() => handleDeleteSweet(sweet.sweet_id, sweet.name)}
                                className="action-btn delete"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users Section */}
              {activeSection === 'users' && (
                <div className="users-section">
                  <h2>User Management</h2>
                  <div className="users-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.user_id}>
                            <td>{user.user_id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}>
                                {user.is_admin ? '👑 Admin' : '👤 User'}
                              </span>
                            </td>
                            <td>
                              <span className="status-badge active">Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
