import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthButton from '../components/AuthButton';

function Dashboard() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <main className="relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-950">
        <div className="absolute top-4 right-4 z-10">
          <AuthButton />
        </div>
        <div className="text-stone-50">Loading...</div>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen w-screen items-start justify-center overflow-scroll bg-linear-to-br from-gray-900 to-gray-950 pb-10">
      <div className="absolute top-4 right-4 z-10">
        <AuthButton />
      </div>
      <div className="mt-20 w-full max-w-2xl px-4">
        <div className="rounded-xl border border-stone-700 bg-stone-800/50 p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-semibold text-stone-50">Profile</h1>

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
                <p className="text-sm text-stone-500">User ID: {user.id}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
