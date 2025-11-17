import { useState } from 'react';
import { Bell, Shield, Palette } from 'lucide-react';

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [accentColor, setAccentColor] = useState<'emerald' | 'blue' | 'violet'>('emerald');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Налаштування</h1>
        <div className="space-y-6">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-emerald-light" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Сповіщення</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Отримувати сповіщення</span>
              <button
                onClick={() => setNotifications((v) => !v)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${notifications ? 'bg-emerald-light text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-primary)]'}`}
              >
                {notifications ? 'Увімкнено' : 'Вимкнено'}
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-emerald-light" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Конфіденційність</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Приватний режим</span>
              <button
                onClick={() => setPrivacyMode((v) => !v)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${privacyMode ? 'bg-emerald-light text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-primary)]'}`}
              >
                {privacyMode ? 'Увімкнено' : 'Вимкнено'}
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-emerald-light" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Акцентний колір</h2>
            </div>
            <div className="flex items-center gap-3">
              {(['emerald','blue','violet'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${accentColor === c ? 'bg-emerald-light text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-primary)]'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}