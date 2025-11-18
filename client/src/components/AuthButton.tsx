import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../ui/Button';

function AuthButton() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated && user) {
    return (
      <div className="text-sm text-stone-50">
        {user.email}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button action={() => navigate('/login')}>
        Login
      </Button>
      <Button action={() => navigate('/register')}>
        Register
      </Button>
    </div>
  );
}

export default AuthButton;

