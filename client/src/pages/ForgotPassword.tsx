import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthButton from '../components/AuthButton';
import { forgotPassword } from '../api/auth';
import ErrorMessage from '../ui/ErrorMessage';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
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
          <h1 className="text-4xl font-semibold">Forgot Password</h1>
          {success ? (
            <div className="mt-8 space-y-4">
              <p className="text-blue-400">
                If an account with that email exists, a password reset link has
                been sent. Please check your email.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && <ErrorMessage message={error} />}
              <p className="text-sm text-stone-400">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
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
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
              <div className="pt-2 text-sm">
                <span className="text-stone-400">Remember your password? </span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
