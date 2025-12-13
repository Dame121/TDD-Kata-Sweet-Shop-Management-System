import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

const API_BASE_URL = 'http://localhost:8000';

function UserDashboard({ user, token, onLogout }) {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/sweets/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSweets(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(sweet => sweet.category))];
        setCategories(uniqueCategories);
      } else {
        setMessage('Failed to fetch sweets');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const searchSweets = async (query, category) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/sweets/search?`;
      if (query) url += `query=${encodeURIComponent(query)}&`;
      if (category) url += `category=${encodeURIComponent(category)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSweets(data);
      } else {
        setMessage('Search failed');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm || selectedCategory || minPrice || maxPrice) {
        searchSweets(searchTerm, selectedCategory);
      } else {
        fetchSweets();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);

  const handlePurchase = async (sweetId, sweetName) => {
    const quantity = prompt(`How many ${sweetName} would you like to purchase?`);
    
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setMessage('Invalid quantity');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: parseInt(quantity) })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully purchased ${quantity} ${sweetName}!`);
        // Refresh with current search/filter settings
        if (searchTerm || selectedCategory) {
          searchSweets(searchTerm, selectedCategory);
        } else {
          fetchSweets();
        }
      } else {
        setMessage(`❌ ${data.detail || 'Purchase failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  // Filter sweets by price range on client side
  const filteredSweets = sweets.filter(sweet => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    return sweet.price >= min && sweet.price <= max;
  });

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand">
            <h1><i className="bi bi-shop"></i> Sweet Shop</h1>
            <p>Welcome back, {user.username}!</p>
          </div>
          <div className="user-info">
            <span className="user-badge"><i className="bi bi-person-circle"></i> User</span>
            <button onClick={onLogout} className="logout-btn"><i className="bi bi-box-arrow-right"></i> Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2>Browse Our Sweet Collection</h2>
            <p>Discover and purchase delicious sweets from our inventory</p>
          </section>

          {/* Search and Filter */}
          <div className="search-filter-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-box">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="price-filter">
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="price-input"
                min="0"
              />
              <span className="price-separator">—</span>
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-input"
                min="0"
              />
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {/* Sweets Grid */}
          {loading ? (
            <div className="loading">Loading sweets...</div>
          ) : (
            <div className="sweets-grid">
              {filteredSweets.length === 0 ? (
                <div className="no-results">
                  <p>No sweets found matching your criteria</p>
                </div>
              ) : (
                filteredSweets.map(sweet => (
                  <div key={sweet.sweet_id} className="sweet-card">
                    {sweet.image_url ? (
                      <img 
                        src={sweet.image_url} 
                        alt={sweet.name}
                        className="sweet-image"
                      />
                    ) : (
                      <div className="sweet-emoji">🍭</div>
                    )}
                    <h3>{sweet.name}</h3>
                    <p className="category">{sweet.category}</p>
                    <div className="sweet-details">
                      <p className="price">₹{sweet.price.toFixed(2)}</p>
                      <p className="stock">
                        {sweet.quantity_in_stock > 0 ? (
                          <span className="in-stock">In Stock: {sweet.quantity_in_stock}</span>
                        ) : (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePurchase(sweet.sweet_id, sweet.name)}
                      disabled={sweet.quantity_in_stock === 0}
                      className="purchase-btn"
                    >
                      {sweet.quantity_in_stock > 0 ? <><i className="bi bi-cart-plus"></i> Purchase</> : <><i className="bi bi-x-circle"></i> Out of Stock</>}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
