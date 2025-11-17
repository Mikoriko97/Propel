import { User, Hash } from 'lucide-react';
import WalletCard from '../components/WalletCard';

type AuthUser = { id: string; name: string; avatarUrl?: string };

interface ProfilePageProps {
  user?: AuthUser;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const isIsolated = typeof window !== 'undefined' && (window as any).crossOriginIsolated === true;
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Profile</h1>
        {!user ? (
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-[var(--text-muted)]">Sign in with Discord to view your profile.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4">
                {user.avatarUrl && !isIsolated ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-light text-white flex items-center justify-center text-3xl font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-6 h-6 text-emerald-light" />
                    <span className="text-2xl font-bold text-[var(--text-primary)]">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm font-mono">{user.id}</span>
                  </div>
                  <div className="mt-3">
                    <span className="px-3 py-1 bg-emerald-light/10 text-emerald-dark dark:text-emerald-light text-sm font-medium rounded-full">
                      Connected via Discord
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            <WalletCard />
          </div>
        )}
      </div>
    </div>
  );
}