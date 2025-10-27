import { Wallet } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onConnectWallet?: () => void;
}

export function Header({ onConnectWallet }: HeaderProps) {
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

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={onConnectWallet}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-light hover:bg-emerald-dark text-white rounded-lg transition-colors font-medium"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
