import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthButton from '../components/AuthButton';
import { activateSubscription, cancelSubscription } from '../api/subscription';
import ErrorMessage from '../ui/ErrorMessage';
import { useSubscription } from '../hooks/useSubscription';

function Dashboard() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    refreshUser,
  } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const maxFileSize = isPro ? '10GB' : '1GB';
  const maxVideoLength = isPro ? '60 minutes' : '5 minutes';

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

  useEffect(() => {
    // Handle Stripe redirects
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      // Remove query parameter to prevent infinite loop
      setSearchParams({});
      // Refresh user data to get updated plan
      refreshUser();
    } else if (subscriptionStatus === 'cancelled') {
      setSearchParams({});
      setUpgradeError('Subscription checkout was cancelled');
    }
  }, [searchParams, setSearchParams, refreshUser]);

  const handleUpgrade = async () => {
    setUpgradeError(null);
    setUpgradeLoading(true);

    try {
      const { checkoutUrl } = await activateSubscription();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setUpgradeError('Failed to get checkout URL');
        setUpgradeLoading(false);
      }
    } catch (error) {
      setUpgradeError(
        error instanceof Error
          ? error.message
          : 'Failed to start subscription. Please try again.',
      );
      setUpgradeLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelError(null);
    setCancelLoading(true);

    try {
      await cancelSubscription();
      await refreshUser();
    } catch (error) {
      setCancelError(
        error instanceof Error
          ? error.message
          : 'Failed to cancel subscription. Please try again.',
      );
      setCancelLoading(false);
    }
  };

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
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-stone-400">
                      Upgrade to Pro for advanced features and monthly
                      subscriptions.
                    </p>
                    {upgradeError && <ErrorMessage message={upgradeError} />}
                    <button
                      className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-stone-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleUpgrade}
                      disabled={upgradeLoading}
                    >
                      {upgradeLoading ? 'Loading...' : '✨ Upgrade to PRO'}
                    </button>
                  </div>
                )}
                {user.plan === 'pro' && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-stone-400">
                      You are currently on the Pro plan. You can cancel your
                      subscription at any time.
                    </p>
                    {cancelError && <ErrorMessage message={cancelError} />}
                    <button
                      className="cursor-pointer rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-stone-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleCancel}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? 'Loading...' : 'Cancel Subscription'}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-400">
                  Plan Limits
                </label>
                <div className="mt-3 space-y-2 rounded-lg border border-stone-700 bg-stone-800/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-400">
                      Maximum file size:
                    </span>
                    <span className="text-sm font-semibold text-stone-50">
                      {maxFileSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-400">
                      Maximum video length:
                    </span>
                    <span className="text-sm font-semibold text-stone-50">
                      {maxVideoLength}
                    </span>
                  </div>
                </div>
                {!isPro && (
                  <p className="mt-2 text-xs text-stone-500">
                    Upgrade to Pro to increase limits to 10GB file size and 60
                    minutes video length.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
