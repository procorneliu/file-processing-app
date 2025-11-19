import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthButton from '../components/AuthButton';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../ui/ErrorMessage';
import BackButton from '../ui/BackButton';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      return;
    }

    // If already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({ email, password, passwordConfirm: confirmPassword });
      navigate('/app');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-950">
      <BackButton />
      <div className="absolute top-4 right-4 z-10">
        <AuthButton />
      </div>
      <div className="w-full max-w-md px-4">
        <div className="text-center text-stone-50">
          <h1 className="text-4xl font-semibold">Register</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && <ErrorMessage message={error} />}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-stone-500 bg-transparent px-4 py-3 text-stone-100 transition-all duration-300 outline-none placeholder:text-stone-400 focus:ring focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-stone-500 bg-transparent px-4 py-3 text-stone-100 transition-all duration-300 outline-none placeholder:text-stone-400 focus:ring focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-stone-500 bg-transparent px-4 py-3 text-stone-100 transition-all duration-300 outline-none placeholder:text-stone-400 focus:ring focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
            <div className="pt-2 text-sm">
              <span className="text-stone-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-400 underline hover:text-blue-300"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Register;
