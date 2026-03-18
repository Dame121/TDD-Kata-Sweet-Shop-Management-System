import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import './AdminDashboard.css';
import { API_BASE_URL } from '@configs/apiConfig';
import { Sweet, DashboardProps, MessageType } from '@lib/types';
import { User, AdminUser } from '@auth/jwtService';

interface NewSweetData {
  name: string;
  category: string;
  price: string;
  quantity_in_stock: string;
  image: File | null;
}

interface EditSweetData {
  name: string;
  category: string;
  price: string;
  quantity_in_stock: string;
  image: File | null;
  imagePreview: string | null;
}

const AdminDashboard: React.FC<DashboardProps> = ({ user, token, onLogout }) => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'inventory' | 'users'>('overview');
  const [showAddSweet, setShowAddSweet] = useState(false);
  const [showEditSweet, setShowEditSweet] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  
  const [newSweet, setNewSweet] = useState<NewSweetData>({
    name: '',
    category: '',
    price: '',
    quantity_in_stock: '',
    image: null
  });
  
  const [editSweet, setEditSweet] = useState<EditSweetData>({
    name: '',
    category: '',
    price: '',
    quantity_in_stock: '',
    image: null,
    imagePreview: null
  });
  
  const [messageType, setMessageType] = useState<MessageType>('');

  const showMessage = (text: string, type: MessageType = 'info'): void => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const fetchSweets = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/sweets/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: Sweet[] = await response.json();
        setSweets(data);
      }
    } catch (error) {
      console.error('Error fetching sweets:', error);
    }
  }, [token]);

  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: AdminUser[] = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [token]);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await Promise.all([fetchSweets(), fetchUsers()]);
    } finally {
      setLoading(false);
    }
  }, [fetchSweets, fetchUsers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSweet = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', newSweet.name);
      formData.append('category', newSweet.category);
      formData.append('price', parseFloat(newSweet.price).toString());
      formData.append('quantity_in_stock', parseInt(newSweet.quantity_in_stock).toString());
      
      if (newSweet.image) {
        formData.append('image', newSweet.image);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/sweets/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error: ${errorMessage}`, 'error');
    }
  };

  const handleUpdateSweet = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!editingSweet) return;

    try {
      const updateData: Partial<Sweet> = {};
      if (editSweet.name) updateData.name = editSweet.name;
      if (editSweet.category) updateData.category = editSweet.category;
      if (editSweet.price) updateData.price = parseFloat(editSweet.price);
      if (editSweet.quantity_in_stock !== '') updateData.quantity_in_stock = parseInt(editSweet.quantity_in_stock);

      const response = await fetch(`${API_BASE_URL}/api/v1/sweets/${editingSweet.sweet_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        if (editSweet.image) {
          const imageFormData = new FormData();
          imageFormData.append('image', editSweet.image);
          
          const imageResponse = await fetch(`${API_BASE_URL}/api/v1/sweets/${editingSweet.sweet_id}/image`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: imageFormData
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error: ${errorMessage}`, 'error');
    }
  };

  const openEditModal = (sweet: Sweet): void => {
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, isEdit: boolean = false): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditSweet({ ...editSweet, image: file, imagePreview: reader.result as string });
        } else {
          setNewSweet({ ...newSweet, image: file });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestock = async (sweetId: number, sweetName: string): Promise<void> => {
    const quantity = prompt(`How many ${sweetName} would you like to add to stock?`);
    
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      showMessage('Please enter a valid quantity', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/sweets/${sweetId}/restock`, {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error: ${errorMessage}`, 'error');
    }
  };

  const handleDeleteSweet = async (sweetId: number, sweetName: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete ${sweetName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/sweets/${sweetId}`, {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error: ${errorMessage}`, 'error');
    }
  };

  const handleDeleteUser = async (userId: number, username: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete user ${username}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/users/${userId}`, {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error: ${errorMessage}`, 'error');
    }
  };

  const totalStock = sweets.reduce((sum, sweet) => sum + sweet.quantity_in_stock, 0);
  const lowStockItems = sweets.filter(sweet => sweet.quantity_in_stock < 10).length;
  const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity_in_stock), 0);

  return (
    <div className="admin-dashboard">
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

          {activeSection === 'overview' && (
            <section className="overview-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><i className="bi bi-box-seam"></i></div>
                  <div className="stat-content">
                    <h3>Total Items</h3>
                    <p className="stat-value">{sweets.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="bi bi-stack"></i></div>
                  <div className="stat-content">
                    <h3>Total Stock</h3>
                    <p className="stat-value">{totalStock}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="bi bi-exclamation-triangle"></i></div>
                  <div className="stat-content">
                    <h3>Low Stock Items</h3>
                    <p className="stat-value">{lowStockItems}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="bi bi-currency-rupee"></i></div>
                  <div className="stat-content">
                    <h3>Inventory Value</h3>
                    <p className="stat-value">₹{totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'inventory' && (
            <section className="inventory-section">
              <div className="section-header">
                <h2>Inventory Management</h2>
                <button onClick={() => setShowAddSweet(true)} className="btn-primary">
                  <i className="bi bi-plus-circle"></i> Add New Sweet
                </button>
              </div>

              {loading ? (
                <div className="loading">Loading inventory...</div>
              ) : (
                <div className="inventory-table-wrapper">
                  <table className="inventory-table">
                    <thead>
                      <tr>
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
                          <td>{sweet.name}</td>
                          <td>{sweet.category}</td>
                          <td>₹{sweet.price.toFixed(2)}</td>
                          <td className={sweet.quantity_in_stock < 10 ? 'low-stock' : ''}>
                            {sweet.quantity_in_stock}
                          </td>
                          <td className="action-buttons">
                            <button onClick={() => openEditModal(sweet)} className="btn-sm btn-edit">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button onClick={() => handleRestock(sweet.sweet_id, sweet.name)} className="btn-sm btn-restock">
                              <i className="bi bi-plus-square"></i>
                            </button>
                            <button onClick={() => handleDeleteSweet(sweet.sweet_id, sweet.name)} className="btn-sm btn-delete">
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Sweet Modal */}
              {showAddSweet && (
                <div className="modal-overlay" onClick={() => setShowAddSweet(false)}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3><i className="bi bi-plus-circle"></i> Add New Sweet</h3>
                      <button type="button" onClick={() => setShowAddSweet(false)} className="modal-close-btn">
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                    <form onSubmit={handleAddSweet} className="modal-form">
                      <div className="form-group">
                        <label htmlFor="add-name">Sweet Name *</label>
                        <input
                          type="text"
                          id="add-name"
                          value={newSweet.name}
                          onChange={(e) => setNewSweet({...newSweet, name: e.target.value})}
                          required
                          placeholder="e.g., Chocolate Truffle"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="add-category">Category *</label>
                        <input
                          type="text"
                          id="add-category"
                          value={newSweet.category}
                          onChange={(e) => setNewSweet({...newSweet, category: e.target.value})}
                          required
                          placeholder="e.g., Chocolate"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="add-price">Price (₹) *</label>
                          <input
                            type="number"
                            id="add-price"
                            value={newSweet.price}
                            onChange={(e) => setNewSweet({...newSweet, price: e.target.value})}
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="add-quantity">Initial Quantity</label>
                          <input
                            type="number"
                            id="add-quantity"
                            value={newSweet.quantity_in_stock}
                            onChange={(e) => setNewSweet({...newSweet, quantity_in_stock: e.target.value})}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="add-image">Product Image</label>
                        <input
                          type="file"
                          id="add-image"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, false)}
                        />
                      </div>
                      <div className="modal-actions">
                        <button type="button" onClick={() => setShowAddSweet(false)} className="btn-cancel">
                          Cancel
                        </button>
                        <button type="submit" className="btn-confirm">
                          Add Sweet
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Sweet Modal */}
              {showEditSweet && editingSweet && (
                <div className="modal-overlay" onClick={() => setShowEditSweet(false)}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3><i className="bi bi-pencil"></i> Edit Sweet</h3>
                      <button type="button" onClick={() => setShowEditSweet(false)} className="modal-close-btn">
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                    <form onSubmit={handleUpdateSweet} className="modal-form">
                      <div className="form-group">
                        <label htmlFor="edit-name">Sweet Name</label>
                        <input
                          type="text"
                          id="edit-name"
                          value={editSweet.name}
                          onChange={(e) => setEditSweet({...editSweet, name: e.target.value})}
                          placeholder="e.g., Chocolate Truffle"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-category">Category</label>
                        <input
                          type="text"
                          id="edit-category"
                          value={editSweet.category}
                          onChange={(e) => setEditSweet({...editSweet, category: e.target.value})}
                          placeholder="e.g., Chocolate"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="edit-price">Price (₹)</label>
                          <input
                            type="number"
                            id="edit-price"
                            value={editSweet.price}
                            onChange={(e) => setEditSweet({...editSweet, price: e.target.value})}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-quantity">Quantity</label>
                          <input
                            type="number"
                            id="edit-quantity"
                            value={editSweet.quantity_in_stock}
                            onChange={(e) => setEditSweet({...editSweet, quantity_in_stock: e.target.value})}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-image">Change Image</label>
                        {editSweet.imagePreview && (
                          <img src={editSweet.imagePreview} alt="preview" className="image-preview" />
                        )}
                        <input
                          type="file"
                          id="edit-image"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, true)}
                        />
                      </div>
                      <div className="modal-actions">
                        <button type="button" onClick={() => setShowEditSweet(false)} className="btn-cancel">
                          Cancel
                        </button>
                        <button type="submit" className="btn-confirm">
                          Update Sweet
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === 'users' && (
            <section className="users-section">
              <h2>User Management</h2>
              {loading ? (
                <div className="loading">Loading users...</div>
              ) : (
                <div className="users-table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(usr => (
                        <tr key={usr.user_id}>
                          <td>{usr.username}</td>
                          <td>{usr.email}</td>
                          <td>{usr.is_admin ? 'Admin' : 'User'}</td>
                          <td>{usr.is_active ? 'Active' : 'Inactive'}</td>
                          <td>{new Date(usr.created_at).toLocaleDateString()}</td>
                          <td className="action-buttons">
                            <button onClick={() => handleDeleteUser(usr.user_id, usr.username)} className="btn-sm btn-delete">
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export { AdminDashboard };
