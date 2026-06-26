import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const redirect =
      user.role === 'admin' ? '/admin' : user.role === 'chef' ? '/chef' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
