import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import OfferBanner from '../components/home/OfferBanner';

export default function MainLayout() {
  return (
    <>
      <OfferBanner />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
