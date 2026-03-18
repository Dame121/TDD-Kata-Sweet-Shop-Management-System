import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import '@styles/UserDashboard.css';
import { API_BASE_URL } from '@configs/apiConfig';
import { MessageType, DashboardProps, Sweet } from '@/types';

const UserDashboard: React.FC<DashboardProps> = ({ user, token, onLogout }) => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSweet, setPurchaseSweet] = useState<Sweet | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to show messages
  const showMessage = (text: string, type: MessageType = 'info'): void => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const fetchSweets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/sweets/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: Sweet[] = await response.json();
        setSweets(data);
        const uniqueCategories = [...new Set(data.map(sweet => sweet.category))];
        setCategories(uniqueCategories);
      } else {
        showMessage('Failed to fetch sweets', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const searchSweets = useCallback(async (query: string, category: string): Promise<void> => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/v1/sweets/search?`;
      if (query) url += `query=${encodeURIComponent(query)}&`;
      if (category) url += `category=${encodeURIComponent(category)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: Sweet[] = await response.json();
        setSweets(data);
      } else {
        showMessage('Search failed', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSweets();
  }, [fetchSweets]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm || selectedCategory || minPrice || maxPrice) {
        searchSweets(searchTerm, selectedCategory);
      } else {
        fetchSweets();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, searchSweets, fetchSweets]);

  const openPurchaseModal = (sweet: Sweet): void => {
    setPurchaseSweet(sweet);
    setPurchaseQuantity(1);
    setShowPurchaseModal(true);
  };

  const closePurchaseModal = (): void => {
    setShowPurchaseModal(false);
    setPurchaseSweet(null);
    setPurchaseQuantity(1);
    setIsProcessing(false);
  };

  const handlePurchase = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!purchaseSweet || purchaseQuantity <= 0) {
      showMessage('Please enter a valid quantity', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/sweets/${purchaseSweet.sweet_id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: purchaseQuantity })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Successfully purchased ${purchaseQuantity} ${purchaseSweet.name}!`, 'success');
        closePurchaseModal();
        if (searchTerm || selectedCategory) {
          searchSweets(searchTerm, selectedCategory);
        } else {
          fetchSweets();
        }
      } else {
        showMessage(data.detail || 'Purchase failed', 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error: ${errorMessage}`, 'error');
      setIsProcessing(false);
    }
  };

  const filteredSweets = sweets.filter(sweet => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    return sweet.price >= min && sweet.price <= max;
  });

  return (
    <div className="user-dashboard">
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

      <main className="dashboard-main">
        <div className="dashboard-container">
          <section className="welcome-section">
            <h2>Browse Our Sweet Collection</h2>
            <p>Discover and purchase delicious sweets from our inventory</p>
          </section>

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
                      onClick={() => openPurchaseModal(sweet)}
                      disabled={sweet.quantity_in_stock === 0}
                      className="purchase-btn"
                    >
                      {sweet.quantity_in_stock > 0 ? (
                        <><i className="bi bi-cart-plus"></i> Purchase</>
                      ) : (
                        <><i className="bi bi-x-circle"></i> Out of Stock</>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {showPurchaseModal && purchaseSweet && (
            <div className="modal-overlay" onClick={closePurchaseModal}>
              <div className="purchase-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3><i className="bi bi-cart-plus"></i> Purchase Sweet</h3>
                  <button type="button" onClick={closePurchaseModal} className="modal-close-btn">
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                
                <div className="purchase-modal-content">
                  <div className="purchase-item-preview">
                    {purchaseSweet.image_url ? (
                      <img src={purchaseSweet.image_url} alt={purchaseSweet.name} className="purchase-item-image" />
                    ) : (
                      <div className="purchase-item-placeholder"><i className="bi bi-gift"></i></div>
                    )}
                    <div className="purchase-item-info">
                      <h4>{purchaseSweet.name}</h4>
                      <p className="purchase-item-category">{purchaseSweet.category}</p>
                      <p className="purchase-item-price">₹{purchaseSweet.price.toFixed(2)} each</p>
                      <p className="purchase-item-stock">
                        <i className="bi bi-box-seam"></i> {purchaseSweet.quantity_in_stock} available
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handlePurchase} className="purchase-form">
                    <div className="quantity-selector">
                      <label htmlFor="purchase-quantity">Quantity:</label>
                      <div className="quantity-controls">
                        <button 
                          type="button" 
                          className="qty-btn"
                          onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                          disabled={purchaseQuantity <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <input
                          type="number"
                          id="purchase-quantity"
                          value={purchaseQuantity}
                          onChange={(e) => setPurchaseQuantity(Math.max(1, Math.min(purchaseSweet.quantity_in_stock, parseInt(e.target.value) || 1)))}
                          min="1"
                          max={purchaseSweet.quantity_in_stock}
                          className="qty-input"
                        />
                        <button 
                          type="button" 
                          className="qty-btn"
                          onClick={() => setPurchaseQuantity(Math.min(purchaseSweet.quantity_in_stock, purchaseQuantity + 1))}
                          disabled={purchaseQuantity >= purchaseSweet.quantity_in_stock}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="total-price">
                      <span>Total: ₹{(purchaseSweet.price * purchaseQuantity).toFixed(2)}</span>
                    </div>

                    <div className="modal-actions">
                      <button type="button" onClick={closePurchaseModal} className="btn-cancel">
                        Cancel
                      </button>
                      <button type="submit" disabled={isProcessing} className="btn-confirm">
                        {isProcessing ? 'Processing...' : 'Confirm Purchase'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export { UserDashboard };
