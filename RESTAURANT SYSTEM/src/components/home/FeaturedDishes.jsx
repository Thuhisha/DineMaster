import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../data/initialData';
import './FeaturedDishes.css';

export default function FeaturedDishes() {
  const { menu } = useApp();
 
  const featuredDishes = menu.slice(0, 4);

  return (
    <section className="featured section">
      <div className="container">
        <div className="section-head">
          <h2>Royal Delights</h2>
          <p>Handpicked favorites from our kitchen</p>
        </div>
        <div className="featured-grid">
          {featuredDishes.map((dish, i) => (
            <motion.article
              key={dish.id}
              className="featured-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="featured-img-wrap">
                <img src={dish.image} alt={dish.name} loading="lazy" />
              </div>
              <div className="featured-body">
                <span className="featured-cat">{dish.category}</span>
                <h3>{dish.name}</h3>
                <p>{dish.description}</p>
                <div className="featured-meta">
                  <span className="price">{formatINR(dish.price)}</span>
                  <span className="rating"><FiStar /> {dish.rating}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="section-cta">
          <Link to="/menu" className="btn btn-outline">Explore Full Menu</Link>
        </div>
      </div>
    </section>
  );
}
