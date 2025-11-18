import { useAuth } from '../contexts/AuthContext';
import Button from '../ui/Button';

function AuthButton() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="text-sm text-stone-400">Loading...</div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="text-sm text-stone-50">
        {user.email}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button action={() => console.log('Login clicked')}>
        Login
      </Button>
      <Button action={() => console.log('Register clicked')}>
        Register
      </Button>
    </div>
  );
}

export default AuthButton;

