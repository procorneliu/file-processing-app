import { useAuth } from '../contexts/AuthContext';

export function useSubscription() {
  const { user } = useAuth();

  const isPro = user?.plan === 'pro';

  return {
    isPro,
  };
}
