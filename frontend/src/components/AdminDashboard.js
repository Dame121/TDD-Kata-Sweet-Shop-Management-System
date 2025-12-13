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
    image: null,
    imagePreview: null
  });
  
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'

  // Helper function to show messages
  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    // Auto-dismiss after 5 seconds
    setTimeout(() => setMessage(''), 5000);
  };

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
        showMessage('Sweet added successfully!', 'success');
        setShowAddSweet(false);
        setNewSweet({ name: '', category: '', price: '', quantity_in_stock: '', image: null });
        fetchSweets();
      } else {
        showMessage(data.detail || 'Failed to add sweet', 'error');
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
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
        // If there's a new image, upload it
        if (editSweet.image) {
          const formData = new FormData();
          formData.append('image', editSweet.image);
          
          const imageResponse = await fetch(`${API_BASE_URL}/api/sweets/${editingSweet.sweet_id}/image`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          if (!imageResponse.ok) {
            const imageError = await imageResponse.json();
            showMessage(`Sweet updated but image upload failed: ${imageError.detail || 'Unknown error'}`, 'error');
            setShowEditSweet(false);
            setEditingSweet(null);
            setEditSweet({ name: '', category: '', price: '', quantity_in_stock: '', image: null, imagePreview: null });
            fetchSweets();
            return;
          }
        }
        
        showMessage('Sweet updated successfully!', 'success');
        setShowEditSweet(false);
        setEditingSweet(null);
        setEditSweet({ name: '', category: '', price: '', quantity_in_stock: '', image: null, imagePreview: null });
        fetchSweets();
      } else {
        showMessage(data.detail || 'Failed to update sweet', 'error');
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    }
  };

  const openEditModal = (sweet) => {
    setEditingSweet(sweet);
    setEditSweet({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity_in_stock: sweet.quantity_in_stock.toString(),
      image: null,
      imagePreview: sweet.image_url || null
    });
    setShowEditSweet(true);
  };

  // Handle image selection with preview
  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditSweet({...editSweet, image: file, imagePreview: reader.result});
        } else {
          setNewSweet({...newSweet, image: file});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestock = async (sweetId, sweetName) => {
    const quantity = prompt(`How many ${sweetName} would you like to add to stock?`);
    
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      showMessage('Please enter a valid quantity', 'error');
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
        showMessage(`Successfully restocked ${quantity} ${sweetName}!`, 'success');
        fetchSweets();
      } else {
        showMessage(data.detail || 'Restock failed', 'error');
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
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
        showMessage(`Successfully deleted ${sweetName}`, 'success');
        fetchSweets();
      } else {
        const data = await response.json();
        showMessage(data.detail || 'Delete failed', 'error');
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
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
        showMessage(`Successfully deleted user ${username}`, 'success');
        fetchUsers();
      } else {
        const data = await response.json();
        showMessage(data.detail || 'Delete failed', 'error');
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
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
            <div className={`toast-message ${messageType}`}>
              <div className="toast-icon">
                {messageType === 'success' && <i className="bi bi-check-circle-fill"></i>}
                {messageType === 'error' && <i className="bi bi-exclamation-circle-fill"></i>}
                {messageType === 'info' && <i className="bi bi-info-circle-fill"></i>}
              </div>
              <span className="toast-text">{message}</span>
              <button onClick={() => setMessage('')} className="toast-close">
                <i className="bi bi-x-lg"></i>
              </button>
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
                        <div className="modal-header">
                          <h3><i className="bi bi-plus-circle"></i> Add New Sweet</h3>
                          <button type="button" onClick={() => setShowAddSweet(false)} className="modal-close-btn">
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                        <form onSubmit={handleAddSweet}>
                          <div className="form-group">
                            <label htmlFor="sweet-name"><i className="bi bi-tag"></i> Sweet Name</label>
                            <input
                              type="text"
                              id="sweet-name"
                              placeholder="Enter sweet name"
                              value={newSweet.name}
                              onChange={(e) => setNewSweet({...newSweet, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="sweet-category"><i className="bi bi-grid"></i> Category</label>
                            <input
                              type="text"
                              id="sweet-category"
                              placeholder="e.g., Traditional, Milk Based"
                              value={newSweet.category}
                              onChange={(e) => setNewSweet({...newSweet, category: e.target.value})}
                              required
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="sweet-price"><i className="bi bi-currency-rupee"></i> Price</label>
                              <input
                                type="number"
                                id="sweet-price"
                                step="0.01"
                                placeholder="0.00"
                                value={newSweet.price}
                                onChange={(e) => setNewSweet({...newSweet, price: e.target.value})}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="sweet-stock"><i className="bi bi-box-seam"></i> Initial Stock</label>
                              <input
                                type="number"
                                id="sweet-stock"
                                placeholder="0"
                                value={newSweet.quantity_in_stock}
                                onChange={(e) => setNewSweet({...newSweet, quantity_in_stock: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label><i className="bi bi-image"></i> Product Image (Optional)</label>
                            <div className="file-input-container">
                              <label htmlFor="sweet-image" className="file-input-label">
                                <i className="bi bi-cloud-upload"></i> {newSweet.image ? newSweet.image.name : 'Choose Image'}
                              </label>
                              <input
                                type="file"
                                id="sweet-image"
                                accept="image/*"
                                onChange={(e) => setNewSweet({...newSweet, image: e.target.files[0]})}
                                className="file-input"
                              />
                            </div>
                          </div>
                          <div className="modal-actions">
                            <button type="button" onClick={() => setShowAddSweet(false)} className="cancel-btn">
                              <i className="bi bi-x-circle"></i> Cancel
                            </button>
                            <button type="submit" className="submit-btn">
                              <i className="bi bi-check-circle"></i> Add Sweet
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {showEditSweet && (
                    <div className="modal-overlay" onClick={() => setShowEditSweet(false)}>
                      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <h3><i className="bi bi-pencil-square"></i> Edit Sweet</h3>
                          <button type="button" onClick={() => setShowEditSweet(false)} className="modal-close-btn">
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                        <form onSubmit={handleUpdateSweet} className="edit-form">
                          <div className="form-grid">
                            <div className="form-left">
                              <div className="form-group">
                                <label htmlFor="edit-name"><i className="bi bi-tag"></i> Sweet Name</label>
                                <input
                                  type="text"
                                  id="edit-name"
                                  placeholder="Enter sweet name"
                                  value={editSweet.name}
                                  onChange={(e) => setEditSweet({...editSweet, name: e.target.value})}
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="edit-category"><i className="bi bi-grid"></i> Category</label>
                                <input
                                  type="text"
                                  id="edit-category"
                                  placeholder="Enter category"
                                  value={editSweet.category}
                                  onChange={(e) => setEditSweet({...editSweet, category: e.target.value})}
                                />
                              </div>
                              <div className="form-row">
                                <div className="form-group">
                                  <label htmlFor="edit-price"><i className="bi bi-currency-rupee"></i> Price</label>
                                  <input
                                    type="number"
                                    id="edit-price"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={editSweet.price}
                                    onChange={(e) => setEditSweet({...editSweet, price: e.target.value})}
                                  />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="edit-stock"><i className="bi bi-box-seam"></i> Stock</label>
                                  <input
                                    type="number"
                                    id="edit-stock"
                                    placeholder="0"
                                    value={editSweet.quantity_in_stock}
                                    onChange={(e) => setEditSweet({...editSweet, quantity_in_stock: e.target.value})}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="form-right">
                              <div className="image-upload-section">
                                <label><i className="bi bi-image"></i> Product Image</label>
                                <div className="image-preview-box">
                                  {editSweet.imagePreview ? (
                                    <img src={editSweet.imagePreview} alt="Preview" className="preview-image" />
                                  ) : (
                                    <div className="no-preview">
                                      <i className="bi bi-image"></i>
                                      <span>No image</span>
                                    </div>
                                  )}
                                </div>
                                <label htmlFor="edit-sweet-image" className="file-input-label">
                                  <i className="bi bi-cloud-upload"></i> {editSweet.image ? 'Change Image' : 'Upload New Image'}
                                </label>
                                <input
                                  type="file"
                                  id="edit-sweet-image"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(e, true)}
                                  className="file-input"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="modal-actions">
                            <button type="button" onClick={() => setShowEditSweet(false)} className="cancel-btn">
                              <i className="bi bi-x-circle"></i> Cancel
                            </button>
                            <button type="submit" className="submit-btn">
                              <i className="bi bi-check-circle"></i> Update Sweet
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
