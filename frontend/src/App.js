import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [lookupOrderId, setLookupOrderId] = useState('');
  const [view, setView] = useState('products'); // products, cart, confirmation, lookup

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, [API_URL]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      const updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    setCart(updatedCart);
  };

  const placeOrder = () => {
    if (!customerName || !customerEmail || cart.length === 0) {
      alert('Please fill in all fields and add items to your cart');
      return;
    }

    const orderData = {
      customer_name: customerName,
      customer_email: customerEmail,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
      .then(response => response.json())
      .then(data => {
        setOrderId(data.order_id);
        setView('confirmation');
        setCart([]);
      })
      .catch(error => console.error('Error placing order:', error));
  };

  const lookupOrder = () => {
    if (!lookupOrderId) return;

    fetch(`${API_URL}/api/orders/${lookupOrderId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Order not found');
        }
        return response.json();
      })
      .then(data => {
        setOrderStatus(data);
        setView('orderStatus');
      })
      .catch(error => {
        console.error('Error fetching order:', error);
        alert('Order not found or error occurred');
      });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Pranhu's Artisan Bakery</h1>
          <p className="tagline">Handcrafted with passion</p>
        </div>
        <nav>
          <button 
            className={view === 'products' ? 'active' : ''} 
            onClick={() => setView('products')}
          >
            Our Treats
          </button>
          <button 
            className={view === 'cart' ? 'active' : ''} 
            onClick={() => setView('cart')}
          >
            Your Basket ({cart.reduce((total, item) => total + item.quantity, 0)})
          </button>
          <button 
            className={view === 'lookup' ? 'active' : ''} 
            onClick={() => setView('lookup')}
          >
            Order Status
          </button>
        </nav>
      </header>

      <div className="container">
        {view === 'products' && (
          <div className="products-container">
            <h2>Our Artisan Selection</h2>
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} />
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="description">{product.description}</p>
                    <div className="product-footer">
                      <p className="price">${product.price.toFixed(2)}</p>
                      <button onClick={() => addToCart(product)}>Add to Basket</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div className="cart-container">
            <h2>Your Basket</h2>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your basket is empty</p>
                <button onClick={() => setView('products')}>Browse our treats</button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p>${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="item-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        <button 
                          className="remove-btn" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="item-total">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div className="total">
                    <span>Total:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
                <div className="checkout-form">
                  <h3>Your Details</h3>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)} 
                      placeholder="Enter your name"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={customerEmail} 
                      onChange={(e) => setCustomerEmail(e.target.value)} 
                      placeholder="Enter your email"
                      required 
                    />
                  </div>
                  <button className="checkout-button" onClick={placeOrder}>
                    Complete Your Order
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {view === 'confirmation' && (
          <div className="confirmation-container">
            <div className="confirmation-icon">✓</div>
            <h2>Order Confirmed!</h2>
            <p className="thank-you">Thank you for your order, {customerName}!</p>
            <div className="order-details">
              <p>Your order number is:</p>
              <p className="order-id">{orderId}</p>
              <p>We've sent a confirmation to {customerEmail}</p>
            </div>
            <button onClick={() => setView('products')}>Continue Shopping</button>
          </div>
        )}

        {view === 'lookup' && (
          <div className="lookup-container">
            <h2>Track Your Order</h2>
            <div className="lookup-form">
              <div className="form-group">
                <label>Enter your order number</label>
                <input 
                  type="text" 
                  value={lookupOrderId} 
                  onChange={(e) => setLookupOrderId(e.target.value)} 
                  placeholder="Order ID"
                  required 
                />
              </div>
              <button onClick={lookupOrder}>Check Status</button>
            </div>
          </div>
        )}

        {view === 'orderStatus' && orderStatus && (
          <div className="order-status-container">
            <h2>Order #{orderStatus.order_id}</h2>
            <div className="status-header">
              <div>
                <p className="label">Customer</p>
                <p>{orderStatus.customer_name}</p>
              </div>
              <div>
                <p className="label">Date</p>
                <p>{orderStatus.created_at}</p>
              </div>
              <div>
                <p className="label">Status</p>
                <p className={`status ${orderStatus.status.toLowerCase()}`}>
                  {orderStatus.status}
                </p>
              </div>
            </div>
            
            <h3>Your Items</h3>
            <div className="order-items">
              {orderStatus.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-name">{item.product_name}</div>
                  <div className="item-quantity">x {item.quantity}</div>
                  <div className="item-price">${item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <span>Total:</span>
              <span>
                ${orderStatus.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
              </span>
            </div>
            
            <button onClick={() => setView('lookup')}>Check Another Order</button>
          </div>
        )}
      </div>

      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Pranhu's Artisan Bakery. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}

export default App;