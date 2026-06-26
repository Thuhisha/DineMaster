import { useState, useEffect } from 'react';
import './CountdownTimer.css';

export default function CountdownTimer({ targetDate, targetTime }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const tick = () => {
      if (!targetDate || !targetTime) return;
      const target = new Date(`${targetDate}T${convertTime(targetTime)}`);
      const diff = target - new Date();
      if (diff <= 0) {
        setRemaining('Your reservation is now!');
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate, targetTime]);

  if (!targetDate) return null;

  return (
    <div className="countdown-timer">
      <span className="countdown-label">Time until reservation</span>
      <span className="countdown-value">{remaining}</span>
    </div>
  );
}

function convertTime(slot) {
  const [time, period] = slot.split(' ');
  let [h, min] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(min || 0).padStart(2, '0')}:00`;
}
