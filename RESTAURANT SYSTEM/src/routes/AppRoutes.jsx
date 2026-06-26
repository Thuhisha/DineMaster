import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

import Home from '../pages/Home';
import Menu from '../pages/Menu';
import Cart from '../pages/Cart';
import Tables from '../pages/Tables';
import Reserve from '../pages/Reserve';
import ReservationDetails from '../pages/ReservationDetails';
import Payment from '../pages/Payment';
import ReservationSuccess from '../pages/ReservationSuccess';
import Login from '../pages/Login';
import BillPreview from '../pages/BillPreview';
import Feedback from '../pages/Feedback';

import CustomerDashboard from '../dashboards/CustomerDashboard';
import ChefDashboard from '../dashboards/ChefDashboard';
import AdminDashboard from '../dashboards/AdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login?mode=register" replace />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/reservation-details" element={<ReservationDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/reservation-success" element={<ReservationSuccess />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/bill/:orderId" element={<BillPreview />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['customer']}>
            <DashboardLayout role="customer" />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
      </Route>

      <Route
        path="/chef"
        element={
          <ProtectedRoute roles={['chef']}>
            <DashboardLayout role="chef" />
          </ProtectedRoute>
        }
      >
        <Route index element={<ChefDashboard />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
