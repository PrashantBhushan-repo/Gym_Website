import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ShopPage.css';

const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Adjustable Dumbbell Set',
    description: 'Lightweight, space-saving dumbbells for strength training at home.',
    price: 2999,
    stock: 15
  },
  {
    id: 'prod-2',
    name: 'Premium Yoga Mat',
    description: 'Non-slip exercise mat with extra cushioning for comfort.',
    price: 1299,
    stock: 20
  },
  {
    id: 'prod-3',
    name: 'Resistance Band Kit',
    description: 'Five-band resistance set for stretching, HIIT, and fitness routines.',
    price: 799,
    stock: 30
  },
  {
    id: 'prod-4',
    name: 'Gym Gloves',
    description: 'Breathable gloves for secure weightlifting and protection.',
    price: 699,
    stock: 25
  },
  {
    id: 'prod-5',
    name: 'Smart Water Bottle',
    description: 'LED hydration bottle that reminds you to drink water on time.',
    price: 1099,
    stock: 18
  },
  {
    id: 'prod-6',
    name: 'Workout Shaker Bottle',
    description: 'Leak-proof shaker with measurement markers and storage.',
    price: 499,
    stock: 40
  }
];

const loadCart = () => {
  const saved = localStorage.getItem('gymShopCart');
  return saved ? JSON.parse(saved) : [];
};

const ShopPage = () => {
  const [cart, setCart] = useState(loadCart());
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    localStorage.setItem('gymShopCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setConfirmation(`${product.name} added to cart.`);
    setTimeout(() => setConfirmation(''), 3000);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="shop-page">
      <div className="shop-intro">
        <div>
          <h2>FitZone Shop</h2>
          <p>Browse gym gear, nutrition accessories, and training essentials.</p>
        </div>
        <Link to="/shop/cart" className="btn btn-primary shop-cart-link">
          View Cart ({cartItemCount})
        </Link>
      </div>

      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <h3>{product.name}</h3>
              <span className="product-price">₹{product.price}</span>
            </div>
            <p>{product.description}</p>
            <p className="product-stock">Stock: {product.stock}</p>
            <button type="button" className="btn btn-secondary" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {confirmation && <div className="shop-confirmation">{confirmation}</div>}
    </div>
  );
};

export default ShopPage;
