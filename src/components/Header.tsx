import { useEffect, useMemo, useState } from 'react';
import { Wallet, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onConnectApp?: () => void;
  user?: { id: string; name: string; avatarUrl?: string };
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function Header({ onConnectApp, user, onProfile, onSettings, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [chainBalance, setChainBalance] = useState<string | undefined>(undefined);
  const isIsolated = typeof window !== 'undefined' && (window as any).crossOriginIsolated === true;
  const formatTLINERA = useMemo(() => (s?: string) => {
    const t = (s ?? '').toString().trim();
    if (!t) return '';
    let nStr = t;
    if (/^\d+\.$/.test(t)) nStr = t.slice(0, -1);
    else if (/^\d+$/.test(t)) nStr = t;
    else if (/^\d+\.0+$/.test(t)) nStr = t.split('.')[0];
    try {
      const n = BigInt(nStr);
      const withSep = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${withSep} TLINERA`;
    } catch {
      return `${nStr} TLINERA`;
    }
  }, []);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      if (!user) { setChainBalance(undefined); return; }
      try {
        const { refreshBalances, subscribeNotifications, hasClient } = await import('../lib/linera');
        if (hasClient()) {
          const b = await refreshBalances();
          setChainBalance(b.chainBalance);
          await subscribeNotifications(async () => {
            const nb = await refreshBalances();
            setChainBalance(nb.chainBalance);
          });
          unsub = () => {};
        } else {
          setChainBalance(undefined);
        }
      } catch (e) { void e; }
    })();
    return () => { if (unsub) unsub(); };
  }, [user]);
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-light rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">Propel</span>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/explore" className="text-[var(--text-secondary)] hover:text-emerald-light transition-colors">
                Explore Markets
              </a>
              <a href="/dashboard" className="text-[var(--text-secondary)] hover:text-emerald-light transition-colors">
                Dashboard
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4 relative">
            <ThemeToggle />
            {user && chainBalance ? (
              <div className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-[var(--text-primary)]">
                {formatTLINERA(chainBalance)}
              </div>
            ) : null}
            {!user ? (
              <button 
                onClick={onConnectApp}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-light hover:bg-emerald-dark text-white rounded-lg transition-colors font-medium"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect App</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {user.avatarUrl && !avatarFailed && !isIsolated ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" onError={() => setAvatarFailed(true)} />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-light text-white flex items-center justify-center text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="font-medium max-w-[140px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => { setMenuOpen(false); onProfile?.(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <User className="w-4 h-4" />
                      <span>Профіль</span>
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onSettings?.(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Налаштування</span>
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
                    <button
                      onClick={() => { setMenuOpen(false); onLogout?.(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Вихід</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
