import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../api/auth';
import type { UserProfile } from '../api/auth';
import AuthButton from '../components/AuthButton';
import ErrorMessage from '../ui/ErrorMessage';

function Dashboard() {
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If we have user from auth context, use it; otherwise fetch
    if (authUser) {
      setUser({
        email: authUser.email,
        id: authUser.id,
        plan: authUser.plan,
      });
      setLoading(false);
    } else {
      const fetchUser = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getCurrentUser();
          setUser(response.user);
        } catch (err) {
          setError('Failed to load profile. Please try again.');
          console.error('Failed to fetch user:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [isAuthenticated, authLoading, authUser, navigate]);

  if (authLoading || loading) {
    return (
      <main className="relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-950">
        <div className="absolute right-4 top-4 z-10">
          <AuthButton />
        </div>
        <div className="text-stone-50">Loading...</div>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen w-screen items-start justify-center overflow-scroll bg-linear-to-br from-gray-900 to-gray-950 pb-10">
      <div className="absolute right-4 top-4 z-10">
        <AuthButton />
      </div>
      <div className="mt-20 w-full max-w-2xl px-4">
        <div className="rounded-xl border border-stone-700 bg-stone-800/50 p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-semibold text-stone-50">
            Profile
          </h1>

          {error && <ErrorMessage message={error} />}

          {user && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-400">
                  Email
                </label>
                <p className="mt-1 text-lg text-stone-50">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-400">
                  Plan
                </label>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      user.plan === 'pro'
                        ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50'
                        : 'bg-stone-600/20 text-stone-300 ring-1 ring-stone-600/50'
                    }`}
                  >
                    {user.plan === 'pro' ? 'Pro' : 'Free'}
                  </span>
                </div>
                {user.plan === 'free' && (
                  <p className="mt-2 text-sm text-stone-400">
                    Upgrade to Pro for advanced features and monthly
                    subscriptions.
                  </p>
                )}
              </div>

              <div className="pt-4">
                <p className="text-sm text-stone-500">
                  User ID: {user.id}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;

