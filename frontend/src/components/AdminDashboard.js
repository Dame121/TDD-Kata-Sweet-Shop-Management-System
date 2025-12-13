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
  const [showEditSweet, setShowEditSweet] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  
  const [newSweet, setNewSweet] = useState({
    name: '',
    category: '',
    price: '',
    quantity_in_stock: '',
    image: null
  });
  
  const [editSweet, setEditSweet] = useState({
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
      const response = await fetch(`${API_BASE_URL}/api/auth/`, {
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

  const handleUpdateSweet = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {};
      if (editSweet.name) updateData.name = editSweet.name;
      if (editSweet.category) updateData.category = editSweet.category;
      if (editSweet.price) updateData.price = parseFloat(editSweet.price);
      if (editSweet.quantity_in_stock !== '') updateData.quantity_in_stock = parseInt(editSweet.quantity_in_stock);

      const response = await fetch(`${API_BASE_URL}/api/sweets/${editingSweet.sweet_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Sweet updated successfully!');
        
        // If there's a new image, upload it
        if (editSweet.image) {
          const formData = new FormData();
          formData.append('image', editSweet.image);
          
          await fetch(`${API_BASE_URL}/api/sweets/${editingSweet.sweet_id}/image`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
        }
        
        setShowEditSweet(false);
        setEditingSweet(null);
        setEditSweet({ name: '', category: '', price: '', quantity_in_stock: '', image: null });
        fetchSweets();
      } else {
        setMessage(`❌ ${data.detail || 'Failed to update sweet'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const openEditModal = (sweet) => {
    setEditingSweet(sweet);
    setEditSweet({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity_in_stock: sweet.quantity_in_stock.toString(),
      image: null
    });
    setShowEditSweet(true);
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

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user ${username}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage(`✅ Successfully deleted user ${username}`);
        fetchUsers();
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
            <h1><i className="bi bi-shop"></i> Sweet Shop Admin</h1>
            <p>Welcome, Admin {user.username}</p>
          </div>
          <div className="user-info">
            <span className="admin-badge"><i className="bi bi-shield-check"></i> Admin</span>
            <button onClick={onLogout} className="logout-btn"><i className="bi bi-box-arrow-right"></i> Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button
          className={activeSection === 'overview' ? 'active' : ''}
          onClick={() => setActiveSection('overview')}
        >
          <i className="bi bi-speedometer2"></i> Overview
        </button>
        <button
          className={activeSection === 'inventory' ? 'active' : ''}
          onClick={() => setActiveSection('inventory')}
        >
          <i className="bi bi-box-seam"></i> Inventory
        </button>
        <button
          className={activeSection === 'users' ? 'active' : ''}
          onClick={() => setActiveSection('users')}
        >
          <i className="bi bi-people"></i> Users
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
                      <div className="stat-icon"><i className="bi bi-boxes"></i></div>
                      <div className="stat-info">
                        <h3>Total Stock</h3>
                        <p className="stat-value">{totalStock}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><i className="bi bi-gift"></i></div>
                      <div className="stat-info">
                        <h3>Products</h3>
                        <p className="stat-value">{sweets.length}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><i className="bi bi-exclamation-triangle"></i></div>
                      <div className="stat-info">
                        <h3>Low Stock Items</h3>
                        <p className="stat-value">{lowStockItems}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><i className="bi bi-currency-rupee"></i></div>
                      <div className="stat-info">
                        <h3>Inventory Value</h3>
                        <p className="stat-value">₹{totalValue.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><i className="bi bi-people-fill"></i></div>
                      <div className="stat-info">
                        <h3>Total Users</h3>
                        <p className="stat-value">{users.length}</p>
                      </div>
                    </div>
                  </div>

                  {lowStockItems > 0 && (
                    <div className="alert-section">
                      <h3><i className="bi bi-exclamation-triangle-fill"></i> Low Stock Alert</h3>
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
                      <i className="bi bi-plus-circle"></i> Add New Sweet
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

                  {showEditSweet && (
                    <div className="modal-overlay" onClick={() => setShowEditSweet(false)}>
                      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Sweet</h3>
                        <form onSubmit={handleUpdateSweet}>
                          <input
                            type="text"
                            placeholder="Sweet Name"
                            value={editSweet.name}
                            onChange={(e) => setEditSweet({...editSweet, name: e.target.value})}
                          />
                          <input
                            type="text"
                            placeholder="Category"
                            value={editSweet.category}
                            onChange={(e) => setEditSweet({...editSweet, category: e.target.value})}
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={editSweet.price}
                            onChange={(e) => setEditSweet({...editSweet, price: e.target.value})}
                          />
                          <input
                            type="number"
                            placeholder="Stock Quantity"
                            value={editSweet.quantity_in_stock}
                            onChange={(e) => setEditSweet({...editSweet, quantity_in_stock: e.target.value})}
                          />
                          <div className="file-input-container">
                            <label htmlFor="edit-sweet-image" className="file-input-label">
                              📷 {editSweet.image ? editSweet.image.name : 'Update Image (Optional)'}
                            </label>
                            <input
                              type="file"
                              id="edit-sweet-image"
                              accept="image/*"
                              onChange={(e) => setEditSweet({...editSweet, image: e.target.files[0]})}
                              className="file-input"
                            />
                          </div>
                          <div className="modal-actions">
                            <button type="submit" className="submit-btn">Update Sweet</button>
                            <button type="button" onClick={() => setShowEditSweet(false)} className="cancel-btn">
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
                                <div className="no-image"><i className="bi bi-image"></i></div>
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
                                onClick={() => openEditModal(sweet)}
                                className="action-btn edit"
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </button>
                              <button
                                onClick={() => handleRestock(sweet.sweet_id, sweet.name)}
                                className="action-btn restock"
                              >
                                <i className="bi bi-box-seam"></i> Restock
                              </button>
                              <button
                                onClick={() => handleDeleteSweet(sweet.sweet_id, sweet.name)}
                                className="action-btn delete"
                              >
                                <i className="bi bi-trash"></i> Delete
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
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(usr => (
                          <tr key={usr.user_id}>
                            <td>{usr.user_id}</td>
                            <td>{usr.username}</td>
                            <td>{usr.email}</td>
                            <td>
                              <span className={`role-badge ${usr.is_admin ? 'admin' : 'user'}`}>
                                {usr.is_admin ? <><i className="bi bi-shield-check"></i> Admin</> : <><i className="bi bi-person"></i> User</>}
                              </span>
                            </td>
                            <td>
                              <span className="status-badge active"><i className="bi bi-check-circle"></i> Active</span>
                            </td>
                            <td>
                              {usr.user_id !== user.user_id && (
                                <button
                                  onClick={() => handleDeleteUser(usr.user_id, usr.username)}
                                  className="action-btn delete"
                                >
                                  <i className="bi bi-trash"></i> Delete
                                </button>
                              )}
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
