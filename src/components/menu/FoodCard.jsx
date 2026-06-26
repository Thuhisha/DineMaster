import { motion } from 'framer-motion';
import { FiStar, FiPlus } from 'react-icons/fi';
import { formatINR } from '../../data/initialData';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './FoodCard.css';

export default function FoodCard({ item, index = 0 }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <motion.article
      className="food-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="food-card-img">
        <img src={item.image} alt={item.name} loading="lazy" />
        <span className="food-cat">{item.category}</span>
      </div>
      <div className="food-card-body">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="food-card-footer">
          <div>
            <span className="food-price">{formatINR(item.price)}</span>
            <span className="food-rating"><FiStar /> {item.rating}</span>
          </div>
          <button type="button" className="btn-add" onClick={handleAdd} aria-label={`Add ${item.name}`}>
            <FiPlus /> Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}
