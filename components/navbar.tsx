'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const u = session.user as any;
        const nickname = (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || (u.user_metadata?.user_name as string) || '';
        const avatar = (u.user_metadata?.avatar_url as string) || '';
        supabase
          .from('profiles')
          .upsert({ id: u.id, user_id: u.id, discord_nickname: nickname, discord_avatar_url: avatar }, { onConflict: 'user_id' });
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      if (!supabaseConfigured) {
        toast({ title: 'Supabase not configured', description: 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify environment.' });
        return;
      }
      await supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: window.location.origin } });
    } catch (e: any) {
      console.error('OAuth error:', e);
      toast({ title: 'Login failed', description: e?.message || 'OAuth error' });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Go to home"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Rocket className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
              Propel
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/explorer"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Explorer
            </Link>
            <Link
              href="/submit"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Submit Project
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Analytics
            </Link>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl px-4">
                  Profile
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="secondary" className="rounded-xl px-4">
                Log Out
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl px-6">
              Log In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
