import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthButton from '../components/AuthButton';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../ui/ErrorMessage';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/app');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-950">
      <div className="absolute top-4 right-4 z-10">
        <AuthButton />
      </div>
      <div className="w-full max-w-md px-4">
        <div className="text-center text-stone-50">
          <h1 className="text-4xl font-semibold">Login</h1>
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
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
            <div className="space-y-2 pt-2">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="text-sm">
                <span className="text-stone-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Register
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;
