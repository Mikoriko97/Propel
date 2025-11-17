import { useEffect, useMemo, useState } from 'react';
import { Server } from 'lucide-react';

export function Footer() {
  const rpcUrl = (import.meta.env as any).VITE_LINERA_RPC_URL || (import.meta.env as any).VITE_LINERA_FAUCET_URL;
  const [status, setStatus] = useState<'unknown' | 'connecting' | 'connected' | 'error'>(rpcUrl ? 'connecting' : 'unknown');
  const host = useMemo(() => {
    try {
      return rpcUrl ? new URL(rpcUrl).host : '';
    } catch {
      return '';
    }
  }, [rpcUrl]);

  useEffect(() => {
    let mounted = true;
    const ping = async () => {
      if (!rpcUrl) return;
      setStatus('connecting');
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(rpcUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(timer);
        if (!mounted) return;
        if (res.ok) setStatus('connected');
        else setStatus('error');
      } catch {
        if (!mounted) return;
        setStatus('error');
      }
    };
    ping();
    const iv = setInterval(ping, 10000);
    return () => { mounted = false; clearInterval(iv); };
  }, [rpcUrl]);
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-[var(--bg-primary)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-light rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">Propel</span>
            </div>
            <p className="text-[var(--text-muted)] max-w-sm">
              Decentralized platform for funding innovative projects through transparent milestones and success prediction.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <a href="/explore" className="text-[var(--text-muted)] hover:text-emerald-light transition-colors">
                  Explore Projects
                </a>
              </li>
              <li>
                <a href="/create" className="text-[var(--text-muted)] hover:text-emerald-light transition-colors">
                  Create Project
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-[var(--text-muted)] hover:text-emerald-light transition-colors">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[var(--text-muted)] hover:text-emerald-light transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-muted)] hover:text-emerald-light transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-secondary)] hover:text-emerald-light transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[var(--border-color)] pt-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-[var(--text-muted)] text-sm">
          © 2025 Propel. All rights reserved.
        </p>
        <div className="flex gap-6 mt-4 md:mt-0 items-center">
          <div
            className="flex items-center gap-2 text-sm"
            title={`Linera RPC${host ? ` (${host})` : ''}: ${status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting…' : status === 'error' ? 'Error' : 'Unknown'}`}
          >
            <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)]">
              <Server className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="text-[var(--text-secondary)]">Linera</span>
              <span className={`inline-block w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-light' : status === 'connecting' ? 'bg-amber-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
            </div>
          </div>
          <a href="#" className="text-[var(--text-muted)] hover:text-emerald-light text-sm transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-[var(--text-muted)] hover:text-emerald-light text-sm transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
      </div>
    </footer>
  );
}