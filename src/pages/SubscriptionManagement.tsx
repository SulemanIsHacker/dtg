import { SubscriptionAuthProvider, useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';
import { SubscriptionLogin } from '@/components/SubscriptionLogin';
import { SubscriptionDashboard } from '@/components/SubscriptionDashboard';

const SubscriptionManagementContent = () => {
  const { isAuthenticated, isLoading } = useSubscriptionAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <SubscriptionDashboard /> : <SubscriptionLogin />;
};

export default function SubscriptionManagement() {
  return (
    <SubscriptionAuthProvider>
      <SubscriptionManagementContent />
    </SubscriptionAuthProvider>
  );
}
