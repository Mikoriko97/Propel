'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Github, Twitter, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

type Role = 'developer' | 'investor';
type Project = { id: string; title: string; category: string; status: string };

import { LineraService, EvmSigner } from '@/lib/linera-client';

export default function ProfilePage() {
  const [role, setRole] = useState<Role | ''>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [devStats, setDevStats] = useState<{ total: number; active: number; completed: number; raised: number }>({ total: 0, active: 0, completed: 0, raised: 0 });
  const [votes, setVotes] = useState<Array<{ projectId: string; projectTitle: string; choice: 'yes' | 'no'; amount: number; result: string; pl: number }>>([]);
  const [investorStats, setInvestorStats] = useState<{ participation: number; committed: number; pl: number; balance: number }>({ participation: 0, committed: 0, pl: 0, balance: 0 });
  const [description, setDescription] = useState<string>('');
  const [xLink, setXLink] = useState<string>('');
  const [githubLink, setGithubLink] = useState<string>('');
  const [discordProfileLink, setDiscordProfileLink] = useState<string>('');
  const [lineraAddress, setLineraAddress] = useState<string>('');
  const [lineraMicrochain, setLineraMicrochain] = useState<string>('');
  const [creatingWallet, setCreatingWallet] = useState<boolean>(false);
  const [tlinBalance, setTlinBalance] = useState<string>('');
  const [ticker, setTicker] = useState<string>('');
  const [chainBalance, setChainBalance] = useState<string>('');
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);
  const [blockHeight, setBlockHeight] = useState<string>('');
  const [chainOwner, setChainOwner] = useState<string>('');
  const [signer, setSigner] = useState<EvmSigner | null>(null);
  const [wsStatus, setWsStatus] = useState<string>('');
  const wsUnsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const loadSigner = async () => {
      const stored = localStorage.getItem('linera_wallet_signer');
      if (stored) {
        try {
          const s = await EvmSigner.fromJson(stored);
          setSigner(s);
          try {
            const service = LineraService.getInstance();
            await service.primeClientFromStorage(s);
          } catch {}
        } catch (e) {
          console.error('Invalid stored signer', e);
          localStorage.removeItem('linera_wallet_signer');
        }
      }
    };
    loadSigner();
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      setUser(u ?? null);
      setUserId(u?.id ?? null);
      if (!u) return;

      const profRes = await supabase.from('profiles').select('*').eq('user_id', u.id).maybeSingle();
      if (!profRes.error && profRes.data) {
        setProfileData(profRes.data);
        if (profRes.data.role) setRole(profRes.data.role as Role);
      }

      const dn = (profRes.data?.discord_nickname as string) || (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || (u.user_metadata?.user_name as string) || (u.email as string) || 'User';
      const av = (profRes.data?.discord_avatar_url as string) || (u.user_metadata?.avatar_url as string) || '';
      setDisplayName(dn);
      setAvatarUrl(av);

      setDescription(String(profRes.data?.description || ''));
      setXLink(String(profRes.data?.x_link || ''));
      setGithubLink(String(profRes.data?.github_link || ''));
      setDiscordProfileLink(String(profRes.data?.discord_profile_link || ''));
      setLineraAddress(String(profRes.data?.linera_address || ''));
      setLineraMicrochain(String(profRes.data?.linera_microchain || ''));

      const projects = await supabase.from('projects').select('id,title,category,status,raised').eq('owner_id', u.id).limit(100);
      if (!projects.error && projects.data) {
        const normalized = projects.data.map((p) => ({ id: String(p.id), title: String(p.title), category: String(p.category), status: String(p.status ?? 'Active') })) as Project[];
        setOwnedProjects(normalized);
        const total = projects.data.length;
        const active = projects.data.filter((p: any) => String(p.status ?? 'Active') === 'Active').length;
        const completed = projects.data.filter((p: any) => String(p.status ?? 'Active') !== 'Active').length;
        const raised = projects.data.reduce((sum: number, p: any) => sum + Number(p.raised || 0), 0);
        setDevStats({ total, active, completed, raised });
      }

      const votesRes = await supabase.from('votes').select('project_id,choice,amount').eq('user_id', u.id).limit(200);
      if (!votesRes.error && votesRes.data) {
        const voteRows = votesRes.data.map((v: any) => ({ project_id: String(v.project_id), choice: String(v.choice) as 'yes' | 'no', amount: Number(v.amount || 0) }));
        const ids = Array.from(new Set(voteRows.map((v: any) => v.project_id)));
        let projectsMap: Record<string, { title: string; status: string }> = {};
        let marketsMap: Record<string, { yes_pool: number; no_pool: number }> = {};

        if (ids.length) {
          const projRes = await supabase.from('projects').select('id,title,status').in('id', ids);
          if (!projRes.error && projRes.data) {
            projRes.data.forEach((p: any) => {
              projectsMap[String(p.id)] = { title: String(p.title), status: String(p.status ?? 'Active') };
            });
          }
          const mRes = await supabase.from('projects_markets').select('project_id,yes_pool,no_pool').in('project_id', ids);
          if (!mRes.error && mRes.data) {
            mRes.data.forEach((m: any) => {
              marketsMap[String(m.project_id)] = { yes_pool: Number(m.yes_pool || 0), no_pool: Number(m.no_pool || 0) };
            });
          }
        }

        const rows = voteRows.map((v: any) => {
          const pm = marketsMap[v.project_id] || { yes_pool: 0, no_pool: 0 };
          const pr = projectsMap[v.project_id] || { title: 'Project', status: 'Active' };
          const yesPool = pm.yes_pool;
          const noPool = pm.no_pool;
          let pl = 0;
          if (v.choice === 'yes') {
            const share = yesPool > 0 ? v.amount / yesPool : 0;
            pl = 0.6 * noPool * share;
          } else {
            const share = noPool > 0 ? v.amount / noPool : 0;
            pl = 0.6 * yesPool * share;
          }
          const result = pr.status === 'Active' ? 'Pending' : 'Pending';
          return { projectId: v.project_id, projectTitle: pr.title, choice: v.choice, amount: v.amount, result, pl };
        });
        const participation = ids.length;
        const committed = voteRows.reduce((s: number, v: any) => s + Number(v.amount || 0), 0);
        const plTotal = rows.reduce((s: number, r: any) => s + Number(r.pl || 0), 0);
        const balance = Number(profRes.data?.balance || 0);
        setVotes(rows);
        setInvestorStats({ participation, committed, pl: plTotal, balance });
      }
    };
    init();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: window.location.origin + '/profile' } });
  };

  const saveRole = async () => {
    if (!userId) {
      toast({ title: 'Sign In', description: 'Please sign in with Discord first.' });
      return;
    }
    if (!role) {
      toast({ title: 'Choose role', description: 'Select a user role.' });
      return;
    }
    const { error } = await supabase.from('profiles').upsert({ id: userId, user_id: userId, role }, { onConflict: 'user_id' });
    if (error) {
      toast({ title: 'Error', description: 'Failed to save role.' });
      return;
    }
    toast({ title: 'Done', description: 'Role saved.' });
  };

  const saveProfileInfo = async () => {
    if (!userId) {
      toast({ title: 'Sign In', description: 'Please sign in with Discord first.' });
      return;
    }
    const payload: any = {
      id: userId,
      user_id: userId,
      description: String(description || ''),
      x_link: String(xLink || ''),
      github_link: String(githubLink || ''),
      discord_profile_link: String(discordProfileLink || ''),
    };
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' });
    if (error) {
      toast({ title: 'Error', description: 'Failed to save profile data.' });
      return;
    }
    setProfileData((prev: any) => ({ ...(prev || {}), ...payload }));
    toast({ title: 'Done', description: 'Profile updated.' });
  };

  const createLineraWallet = async () => {
    if (!userId) {
      toast({ title: 'Sign In', description: 'Please sign in with Discord first.' });
      return;
    }
    const isolated = Boolean((globalThis as any).crossOriginIsolated);
    if (!isolated) {
      toast({ title: 'Headers required', description: 'Enable COOP/COEP and restart the server.' });
      return;
    }
    if (lineraAddress && lineraMicrochain) {
      toast({ title: 'Already created', description: 'Linera wallet already exists.' });
      return;
    }
    setCreatingWallet(true);
    try {
      const service = LineraService.getInstance();
      const result = await service.createWalletAndClaimChain();
      
      setSigner(result.signer);
      setLineraAddress(result.address);
      setLineraMicrochain(result.microchain);
      
      const json = await result.signer.toJson();
      localStorage.setItem('linera_wallet_signer', json);
      
      setProfileData((prev: any) => ({ 
        ...(prev || {}), 
        linera_address: result.address, 
        linera_microchain: result.microchain 
      }));
      
      try {
        const { error } = await supabase.from('profiles').upsert({ 
          id: userId,
          user_id: userId, 
          linera_address: result.address, 
          linera_microchain: result.microchain 
        }, { onConflict: 'user_id' });
        if (error) throw error;
        toast({ title: 'Done', description: 'Linera wallet created.' });
      } catch (dbErr: any) {
        console.error('Supabase error:', dbErr);
        toast({ title: 'Wallet created', description: 'Database write skipped (table unavailable).' });
      }
    } catch (e: any) {
      console.error('Linera Wallet Creation Error:', e);
      toast({ 
        title: 'Creation error', 
        description: `Details: ${e?.message || JSON.stringify(e) || 'Unknown error'}` 
      });
    } finally {
      setCreatingWallet(false);
    }
  };

  const resetWallet = async () => {
    if (!confirm("Are you sure? You'll lose access to this wallet if you haven't saved the key.")) return;
    setSigner(null);
    setLineraAddress('');
    setLineraMicrochain('');
    localStorage.removeItem('linera_wallet_signer');
    
    if (userId) {
       await supabase.from('profiles').upsert({ 
        id: userId,
        user_id: userId, 
        linera_address: null, 
        linera_microchain: null 
      }, { onConflict: 'user_id' });
    }
    toast({ title: 'Reset', description: 'Wallet disconnected.' });
  };

  const refreshTokenBalance = useCallback(async () => {
    if (!userId || !lineraAddress || !lineraMicrochain || !signer) return;
    setLoadingBalance(true);
    try {
      const service = LineraService.getInstance();
      console.log('[Profile] Refresh microchain balance', { owner: lineraAddress, chainId: lineraMicrochain });
      const systemBalance = await service.getBalance(lineraAddress, lineraMicrochain, signer);
      setChainBalance(systemBalance);

      const appId = (process.env.NEXT_PUBLIC_LINERA_APPLICATION_ID as string) || (process.env.VITE_LINERA_APPLICATION_ID as string) || '';
      if (appId) {
        const [tokenBal, sym] = await Promise.all([
          service.getTokenBalance(lineraAddress, appId, signer, lineraMicrochain),
          service.getTickerSymbol(appId, signer, lineraMicrochain)
        ]);
        setTlinBalance(tokenBal);
        setTicker(sym);
        console.log('[Profile] Token balance updated', { balance: tokenBal, ticker: sym });
      } else {
        setTlinBalance('');
        setTicker('');
      }
      
    } catch (e) {
      console.error('[Profile] Balance check error:', e);
      setTlinBalance('');
      setChainBalance('');
    }
    setLoadingBalance(false);
  }, [userId, lineraAddress, lineraMicrochain, signer]);

  useEffect(() => {
    const run = async () => {
      if (!userId || !lineraAddress || !lineraMicrochain || !signer) return;
      await refreshTokenBalance();
    };
    run();
  }, [refreshTokenBalance, userId, lineraAddress, lineraMicrochain, signer]);

  useEffect(() => {
    const check = async () => {
      const service = LineraService.getInstance();
      const ok = await service.checkConnectivity();
      setWsStatus(ok ? 'Connected' : 'Not connected');
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  

  useEffect(() => {
    if (!userId || !lineraAddress || !lineraMicrochain || !signer) return;
    if (!(globalThis as any).crossOriginIsolated) return;
    const id = setInterval(() => {
      refreshTokenBalance();
    }, 15000);
    return () => clearInterval(id);
  }, [refreshTokenBalance, userId, lineraAddress, lineraMicrochain, signer]);

  if (!userId) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Profile</h2>
          <p className="text-foreground/60 mb-8">Sign in to configure your profile</p>
          <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Sign in with Discord</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-foreground/70 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="glass-strong rounded-2xl p-8 border-white/10 lg:col-span-1">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                {avatarUrl ? (
                  <AvatarImage src={`/api/proxy-image?url=${encodeURIComponent(avatarUrl)}`} alt={displayName} />
                ) : (
                  <AvatarFallback>{displayName?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="text-2xl font-bold">{displayName || 'User'}</div>
                <div className="text-sm text-foreground/60">Discord</div>
                <div className="mt-4 text-sm text-foreground/80 break-words">
                  {profileData?.description || 'User description will be added.'}
                </div>
                <div className="mt-6 flex items-center gap-3">
                  {profileData?.x_link && (
                    <a href={String(profileData.x_link)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground/70 hover:text-primary">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {profileData?.github_link && (
                    <a href={String(profileData.github_link)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground/70 hover:text-primary">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {(profileData?.discord_profile_link || user?.user_metadata?.user_name) && (
                    <a
                      href={String(profileData?.discord_profile_link || `https://discord.com/users/${user?.user_metadata?.sub || ''}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-foreground/70 hover:text-primary"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 px-4 py-3">
                <div className="text-xs text-foreground/60">Token balance</div>
                <div className="text-lg font-semibold font-mono break-all">{loadingBalance ? '...' : (tlinBalance ? `${tlinBalance} ${ticker || 'TLINERA'}` : '—')}</div>
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={refreshTokenBalance}>Refresh balance</Button>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 px-4 py-3">
                <div className="text-xs text-foreground/60">Microchain balance</div>
                <div className="text-lg font-semibold font-mono break-all">{chainBalance ? `${chainBalance} TLINERA` : '—'}</div>
              </div>
              <div className="rounded-xl border border-white/10 px-4 py-3">
                <div className="text-xs text-foreground/60">Linera status</div>
                <div className="text-sm font-mono break-all">{wsStatus || '—'}</div>
              </div>
              <div className="rounded-xl border border-white/10 px-4 py-3">
                <div className="text-xs text-foreground/60">Role</div>
                <div className="text-lg font-semibold">{role || '—'}</div>
              </div>
            </div>
          </Card>

          <Card className="glass-strong rounded-2xl p-8 border-white/10 lg:col-span-2">
            <div className="text-xl font-bold mb-6">User type</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={saveRole} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Save</Button>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 p-4">
              <div className="text-sm font-semibold mb-3">Linera wallet</div>
              {lineraAddress ? (
                <>
                <div className="grid gap-3">
                  <div>
                    <div className="text-xs text-foreground/60">Address</div>
                    <div className="font-mono break-all">{lineraAddress}</div>
                  </div>
                  <div>
                    <div className="text-xs text-foreground/60">Microchain</div>
                    <div className="font-mono break-all">{lineraMicrochain}</div>
                  </div>
                </div>
                <Button onClick={resetWallet} variant="outline" className="mt-4 w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">Reset wallet</Button>
                </>
              ) : (
                <Button onClick={createLineraWallet} disabled={creatingWallet} className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Create Linera wallet</Button>
              )}
            </div>
          </Card>

          <Card className="glass-strong rounded-2xl p-8 border-white/10 lg:col-span-2">
            <div className="text-xl font-bold mb-6">Profile editor</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 grid gap-2">
                <label className="text-sm text-foreground/60">Description</label>
                <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short bio" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-foreground/60">X (Twitter) link</label>
                <Input value={xLink} onChange={(e) => setXLink(e.target.value)} placeholder="https://x.com/username" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-foreground/60">GitHub link</label>
                <Input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/username" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-foreground/60">Discord profile</label>
                <Input value={discordProfileLink} onChange={(e) => setDiscordProfileLink(e.target.value)} placeholder="https://discord.com/users/123" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end">
              <Button onClick={saveProfileInfo} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Save profile</Button>
            </div>
          </Card>

          <Card className="glass-strong rounded-2xl p-8 border-white/10 lg:col-span-3">
            <div className="text-xl font-bold mb-6">Section</div>
            {role === 'developer' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="text-sm text-foreground/60 mb-3">Your projects</div>
                  <div className="grid grid-cols-1 gap-3">
                    {ownedProjects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                        <div>
                          <div className="font-semibold">{p.title}</div>
                          <div className="text-xs text-foreground/60">{p.category}</div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-lg bg-primary/20 text-primary">{p.status}</div>
                      </div>
                    ))}
                    {!ownedProjects.length && (
                      <div className="text-sm text-foreground/60">No projects yet</div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="text-sm text-foreground/60 mb-3">Statistics</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                      <span className="text-sm">Total</span>
                      <span className="font-semibold">{devStats.total}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                      <span className="text-sm">Active</span>
                      <span className="font-semibold">{devStats.active}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                      <span className="text-sm">Completed</span>
                      <span className="font-semibold">{devStats.completed}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                      <span className="text-sm">Funds raised</span>
                      <span className="font-semibold">{devStats.raised.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : role === 'investor' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="text-sm text-foreground/60 mb-3">Statistics</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                      <span className="text-sm">Project participation</span>
                      <span className="font-semibold">{investorStats.participation}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                      <span className="text-sm">Funds committed</span>
                      <span className="font-semibold">{investorStats.committed.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                      <span className="text-sm">P/L (potential)</span>
                      <span className="font-semibold">{investorStats.pl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="text-sm text-foreground/60 mb-3">Voting history</div>
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Choice</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>P/L</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {votes.map((v, i) => (
                          <TableRow key={`${v.projectId}-${i}`}>
                            <TableCell className="font-medium">{v.projectTitle}</TableCell>
                            <TableCell className="capitalize">{v.choice}</TableCell>
                            <TableCell>{v.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                            <TableCell>{v.result}</TableCell>
                            <TableCell>{v.pl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                          </TableRow>
                        ))}
                        {!votes.length && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-foreground/60">No votes yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-foreground/60">Select a role to view the section</div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
