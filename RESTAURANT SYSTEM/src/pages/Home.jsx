import Hero from '../components/home/Hero';
import FeaturedDishes from '../components/home/FeaturedDishes';
import Testimonials from '../components/home/Testimonials';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

export default function Home() {
  return (
  <>
    <Hero />
    <FeaturedDishes />
    <section className="home-cta section">
      <motion.div
        className="container home-cta-inner"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2>Ready for an Unforgettable Evening?</h2>
        <p>Book your table now and earn loyalty points on every visit.</p>
        <Link to="/reserve" className="btn btn-primary">Reserve Table</Link>
      </motion.div>
    </section>
    <Testimonials />
  </>
  );
}
