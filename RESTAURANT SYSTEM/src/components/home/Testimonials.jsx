import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { TESTIMONIALS } from '../../data/initialData';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <section className="testimonials section">
      <div className="container">
        <div className="section-head">
          <h2>What Our Guests Say</h2>
          <p>Real stories from DineMaster diners</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.id}
              className="testimonial-card"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <div className="stars">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <FiStar key={j} />
                ))}
              </div>
              <p>&ldquo;{t.text}&rdquo;</p>
              <footer>
                <span className="avatar">{t.avatar}</span>
                <cite>{t.name}</cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
