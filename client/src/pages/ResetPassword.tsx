import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthButton from '../components/AuthButton';
import { resetPassword } from '../api/auth';
import ErrorMessage from '../ui/ErrorMessage';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL hash (Supabase sends reset links with hash fragments)
    // Format: #access_token=...&type=recovery&expires_in=...
    const hash = window.location.hash;

    if (!hash) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');

    if (accessToken) {
      setToken(accessToken);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(
        'Invalid reset token. Please request a new password reset link.',
      );
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        token: token!,
        password,
        passwordConfirm,
      });
      setSuccess(true);
      setPassword('');
      setPasswordConfirm('');
    } catch {
      setError('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-950">
        <div className="absolute top-4 right-4 z-10">
          <AuthButton />
        </div>
        <div className="w-full max-w-md px-4">
          <div className="text-center text-stone-50">
            <h1 className="text-4xl font-semibold">
              Password Reset Successful
            </h1>
            <div className="mt-8 space-y-4">
              <p className="text-blue-400">
                Your password has been reset successfully. You can now login
                with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!token && !error) {
    return (
      <main className="relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-950">
        <div className="absolute top-4 right-4 z-10">
          <AuthButton />
        </div>
        <div className="w-full max-w-md px-4">
          <div className="text-center text-stone-50">
            <p className="text-stone-400">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-950">
      <div className="absolute top-4 right-4 z-10">
        <AuthButton />
      </div>
      <div className="w-full max-w-md px-4">
        <div className="text-center text-stone-50">
          <h1 className="text-4xl font-semibold">Reset Password</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && <ErrorMessage message={error} />}
            <div>
              <input
                type="password"
                placeholder="New Password"
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
                placeholder="Confirm New Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-stone-500 bg-transparent px-4 py-3 text-stone-100 transition-all duration-300 outline-none placeholder:text-stone-400 focus:ring focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !token}
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
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
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
