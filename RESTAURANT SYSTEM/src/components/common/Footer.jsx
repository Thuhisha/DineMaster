import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo">
            <span className="logo-icon">D</span>
            <span className="logo-text">DineMaster</span>
          </Link>
          <p>Premium dining experiences across India. Reserve your table in seconds.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/menu">Menu</Link>
          <Link to="/reserve">Reservations</Link>
          <Link to="/tables">Table Status</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">My Dashboard</Link>
        </div>
        <div>
          <h4>Connect</h4>
          <div className="social-links">
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="Facebook"><FiFacebook /></a>
            <a href="mailto:hello@dinemaster.com" aria-label="Email"><FiMail /></a>
          </div>
          <p className="footer-contact">hello@dinemaster.com</p>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} DineMaster. All rights reserved.</p>
      </div>
    </footer>
  );
}
