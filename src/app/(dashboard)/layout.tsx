import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OnboardingGuard } from '@/components/auth/OnboardingGuard';
import { ActivityProvider } from '@/providers/ActivityProvider';
import { GlobalStatusBar } from '@/components/system/GlobalStatusBar';
import { PageTransition } from '@/components/system/PageTransition';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <ActivityProvider>
        <div className="flex h-screen overflow-hidden bg-background terminal-grid">
          <Sidebar />
          <div className="flex w-0 flex-1 flex-col overflow-hidden">
            <GlobalStatusBar />
            <Header />
            <main className="relative flex-1 overflow-y-auto focus:outline-none">
              <div className="py-4 md:py-6">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-8">
                  <ErrorBoundary>
                    <PageTransition>{children}</PageTransition>
                  </ErrorBoundary>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ActivityProvider>
    </OnboardingGuard>
  );
}
