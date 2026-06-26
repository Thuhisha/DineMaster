import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGift } from 'react-icons/fi';
import { SPECIAL_OFFERS } from '../../data/initialData';
import './OfferBanner.css';

export default function OfferBanner() {
  const [visible, setVisible] = useState(true);
  const offer = SPECIAL_OFFERS[0];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="offer-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="container offer-banner-inner">
            <FiGift className="offer-icon" />
            <span>
              <strong>{offer.title}:</strong> {offer.desc} — Code <code>{offer.code}</code>
            </span>
            <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss">
              <FiX />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
