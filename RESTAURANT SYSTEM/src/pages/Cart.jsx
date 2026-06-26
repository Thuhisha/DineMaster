import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatINR } from '../data/initialData';
import './Cart.css';

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  const handleIncrease = (item) => {
    updateQty(item.id, item.qty + 1);
  };

  const handleDecrease = (item) => {
    if (item.qty > 1) {
      updateQty(item.id, item.qty - 1);
    } else {
      removeFromCart(item.id);
      toast.success(`${item.name} removed from cart`);
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
    toast.success(`${item.name} removed from cart`);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart card">
            <FiShoppingBag className="empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Add delicious items from our menu</p>
            <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="page-header">
        <h1>Your Cart</h1>
        <p>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</p>
      </header>

      <div className="container cart-grid">
        <motion.div 
          className="cart-items"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {cart.map((item, index) => (
            <motion.div
              key={item.id}
              className="cart-item card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="cart-item-img">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-category">{item.category}</p>
                <p className="cart-item-price">{formatINR(item.price)}</p>
              </div>
              <div className="cart-item-quantity">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => handleDecrease(item)}
                  aria-label="Decrease quantity"
                >
                  <FiMinus />
                </button>
                <span className="qty-value">{item.qty}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => handleIncrease(item)}
                  aria-label="Increase quantity"
                >
                  <FiPlus />
                </button>
              </div>
              <div className="cart-item-total">
                <p>{formatINR(item.price * item.qty)}</p>
              </div>
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemove(item)}
                aria-label="Remove item"
              >
                <FiTrash2 />
              </button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="cart-summary card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cartCount} items)</span>
            <span>{formatINR(cartTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (5%)</span>
            <span>{formatINR(Math.round(cartTotal * 0.05))}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatINR(cartTotal + Math.round(cartTotal * 0.05))}</span>
          </div>
          <div className="cart-actions">
            <Link to="/menu" className="btn btn-outline btn-full">
              Continue Shopping
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={() => navigate('/reserve')}
            >
              Proceed to Reservation
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
