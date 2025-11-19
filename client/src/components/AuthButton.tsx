import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../ui/Button';

function AuthButton() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-stone-50">{user.email}</span>
        <Button action={handleLogout}>Logout</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button action={() => navigate('/login')}>Login</Button>
      <Button action={() => navigate('/register')}>Register</Button>
    </div>
  );
}

export default AuthButton;

