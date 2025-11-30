'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

type Project = {
  id: string;
  title: string;
  category: string;
  status: string;
  description?: string;
  owner_id?: string;
  raised?: number;
  votes?: number;
};

type MarketStats = {
  yesPool: number;
  noPool: number;
  total: number;
};

type Milestone = {
  title: string;
  successCriteria: string[];
  deliverables: string[];
  durationDays: number;
};

const fallbackBySlug: Record<string, Project & { milestone: Milestone; market: MarketStats }> = {
  '1': {
    id: '1',
    title: 'DeFi Protocol Alpha',
    category: 'DeFi',
    status: 'Active',
    description:
      'A DeFi protocol aiming to optimize yield strategies with transparent governance and community-driven incentives.',
    raised: 2400000,
    milestone: {
      title: 'Milestone 1: MVP Development',
      successCriteria: [
        'Functional web app accessible via public URL',
        'Real-time metrics dashboard for liquidity and APY',
        'Wallet auth with 100+ test users',
        'Response time < 2s for core actions',
      ],
      deliverables: [
        'Live product URL',
        'Demo video of core features',
        'User analytics screenshot',
        'Technical documentation',
      ],
      durationDays: 60,
    },
    market: { yesPool: 9000, noPool: 6000, total: 15000 },
  },
  '2': {
    id: '2',
    title: 'NFT Marketplace Beta',
    category: 'NFT',
    status: 'Active',
    description: 'A creator-first NFT marketplace focusing on social discovery and fair royalties.',
    raised: 1800000,
    milestone: {
      title: 'Milestone 1: Marketplace Beta',
      successCriteria: [
        'Minting flow live with testnet assets',
        'Royalties tracking and payouts',
        'On-chain listing and offer system',
      ],
      deliverables: ['Public beta URL', 'Video demo', 'Protocol docs'],
      durationDays: 45,
    },
    market: { yesPool: 7000, noPool: 3000, total: 10000 },
  },
  '3': {
    id: '3',
    title: 'GameFi Revolution',
    category: 'Gaming',
    status: 'Hot',
    description: 'P2E game with sustainable tokenomics and seasonal leagues.',
    raised: 3200000,
    milestone: {
      title: 'Milestone 1: Season Launch',
      successCriteria: [
        'Core gameplay loop online',
        'Season pass smart contracts',
        'Fair matchmaking and anti-cheat',
      ],
      deliverables: ['Playable build', 'Chain contracts', 'Design docs'],
      durationDays: 30,
    },
    market: { yesPool: 12000, noPool: 4000, total: 16000 },
  },
};

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [market, setMarket] = useState<MarketStats | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [voteChoice, setVoteChoice] = useState<'yes' | 'no' | ''>('');
  const [voteAmount, setVoteAmount] = useState('');
  const [comments, setComments] = useState<Array<{ user_id: string; content: string; created_at: string; nickname?: string; avatar?: string }>>([]);
  const [commentText, setCommentText] = useState('');
  const [canComment, setCanComment] = useState(false);

  const fallback = useMemo(() => fallbackBySlug[id], [id]);

  useEffect(() => {
    const load = async () => {
      const projRes = await supabase
        .from('projects')
        .select('id,title,category,status,description,owner_id,raised,votes')
        .eq(typeof Number(id) === 'number' && !Number.isNaN(Number(id)) ? 'id' : 'id', id)
        .maybeSingle();

      if (!projRes.error && projRes.data) {
        setProject({
          id: String(projRes.data.id),
          title: String(projRes.data.title),
          category: String(projRes.data.category),
          status: String(projRes.data.status || 'Active'),
          description: projRes.data.description ? String(projRes.data.description) : undefined,
          owner_id: projRes.data.owner_id ? String(projRes.data.owner_id) : undefined,
          raised: typeof projRes.data.raised === 'number' ? projRes.data.raised : undefined,
          votes: typeof projRes.data.votes === 'number' ? projRes.data.votes : undefined,
        });
      } else if (fallback) {
        setProject(fallback);
      }

      const marketRes = await supabase
        .from('projects_markets')
        .select('yes_pool,no_pool,total')
        .eq('project_id', id)
        .maybeSingle();
      if (!marketRes.error && marketRes.data) {
        setMarket({
          yesPool: Number(marketRes.data.yes_pool || 0),
          noPool: Number(marketRes.data.no_pool || 0),
          total: Number(marketRes.data.total || 0),
        });
      } else if (fallback) {
        setMarket(fallback.market);
      }

      const msRes = await supabase
        .from('projects_milestones')
        .select('title,success_criteria,deliverables,duration_days')
        .eq('project_id', id)
        .maybeSingle();
      if (!msRes.error && msRes.data) {
        setMilestone({
          title: String(msRes.data.title),
          successCriteria: Array.isArray(msRes.data.success_criteria)
            ? msRes.data.success_criteria.map(String)
            : [],
          deliverables: Array.isArray(msRes.data.deliverables)
            ? msRes.data.deliverables.map(String)
            : [],
          durationDays: Number(msRes.data.duration_days || 0),
        });
      } else if (fallback) {
        setMilestone(fallback.milestone);
      }

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      const votesRes = uid
        ? await supabase.from('votes').select('id').eq('user_id', uid).eq('project_id', id).limit(1)
        : null;
      setCanComment(Boolean(votesRes && !votesRes.error && votesRes.data && votesRes.data.length));

      const commentsRes = await supabase
        .from('project_comments')
        .select('user_id,content,created_at')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!commentsRes.error && Array.isArray(commentsRes.data)) {
        const base = commentsRes.data.map((c: any) => ({ user_id: String(c.user_id), content: String(c.content), created_at: String(c.created_at) }));
        const uids = Array.from(new Set(base.map((c) => c.user_id)));
        let profilesMap: Record<string, { nickname?: string; avatar?: string }> = {};
        if (uids.length) {
          const profs = await supabase.from('profiles').select('user_id,discord_nickname,discord_avatar_url').in('user_id', uids);
          if (!profs.error && Array.isArray(profs.data)) {
            profs.data.forEach((p: any) => {
              profilesMap[String(p.user_id)] = { nickname: p.discord_nickname ? String(p.discord_nickname) : undefined, avatar: p.discord_avatar_url ? String(p.discord_avatar_url) : undefined };
            });
          }
        }
        setComments(
          base.map((c) => ({ ...c, nickname: profilesMap[c.user_id]?.nickname, avatar: profilesMap[c.user_id]?.avatar }))
        );
      }
    };
    load();
  }, [id, fallback]);

  const castVote = async () => {
    const amt = Number(voteAmount);
    if (!voteChoice) {
      toast({ title: 'Choose an option', description: 'Select YES or NO.' });
      return;
    }
    if (!amt || amt <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a positive amount.' });
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast({ title: 'Sign In', description: 'Sign in with Discord to vote.' });
      return;
    }
    const { error } = await supabase.from('votes').insert({
      project_id: project?.id || id,
      user_id: userData.user.id,
      choice: voteChoice,
      amount: amt,
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to cast vote.' });
      return;
    }

    const marketRes = await supabase
      .from('projects_markets')
      .select('yes_pool,no_pool,total')
      .eq('project_id', project?.id || id)
      .maybeSingle();
    if (!marketRes.error && marketRes.data) {
      setMarket({
        yesPool: Number(marketRes.data.yes_pool || 0),
        noPool: Number(marketRes.data.no_pool || 0),
        total: Number(marketRes.data.total || 0),
      });
    }

    const projRes = await supabase
      .from('projects')
      .select('raised,votes')
      .eq('id', project?.id || id)
      .maybeSingle();
    if (!projRes.error && projRes.data) {
      const newRaised = Number((projRes.data as any)?.raised || 0);
      const newVotes = Number((projRes.data as any)?.votes || 0);
      setProject((prev) =>
        prev
          ? { ...prev, raised: newRaised, votes: newVotes }
          : { id, title: '', category: '', status: 'Active', raised: newRaised, votes: newVotes }
      );
    }

    toast({ title: 'Vote accepted', description: 'Thank you for voting.' });
    setVoteAmount('');
    setVoteChoice('');
  };

  const yesPercent = market ? Math.round((market.yesPool / Math.max(market.total, 1)) * 100) : 0;

  const submitComment = async () => {
    const text = String(commentText || '').trim();
    if (!text || text.length < 3) {
      toast({ title: 'Short comment', description: 'Enter at least 3 characters.' });
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast({ title: 'Sign In', description: 'Sign in with Discord to comment.' });
      return;
    }
    if (!canComment) {
      toast({ title: 'Insufficient permissions', description: 'Only users who voted can comment.' });
      return;
    }
    const payload = { project_id: project?.id || id, user_id: userData.user.id, content: text } as any;
    const { error } = await supabase.from('project_comments').insert(payload);
    if (error) {
      toast({ title: 'Error', description: 'Failed to add comment.' });
      return;
    }
    setComments([{ user_id: userData.user.id, content: text, created_at: new Date().toISOString() }, ...comments]);
    setCommentText('');
    toast({ title: 'Done', description: 'Comment added.' });
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {project?.category && (
              <Badge className="bg-primary/20 text-primary border-primary/30">{project.category}</Badge>
            )}
            {project?.status && (
              <Badge className="bg-green-500/20 text-green-400 border-green-400/30">{project.status}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-strong rounded-2xl p-8 border-white/10">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{project?.title || 'Project'}</h1>
                <div className="text-sm text-foreground/60">ID: #{project?.id || id}</div>
              </div>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="text-foreground/80 leading-relaxed">
                  {project?.description || 'Project description will be available soon.'}
                </div>
                {typeof project?.raised === 'number' && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-foreground/60">Raised</span>
                    <span className="font-bold text-primary">
                      {project.raised.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="glass-strong rounded-2xl p-8 border-white/10">
              <div className="text-xl font-bold mb-4">{milestone?.title || 'Milestone'}</div>
              <div className="grid gap-6">
                <div>
                  <div className="text-sm font-semibold mb-2">Success Criteria</div>
                  <div className="space-y-2">
                    {(milestone?.successCriteria || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Required Deliverables</div>
                  <div className="space-y-2">
                    {(milestone?.deliverables || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {typeof milestone?.durationDays === 'number' && (
                  <div className="text-xs text-foreground/60">Development Duration: {milestone?.durationDays} days</div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-strong rounded-2xl p-6 border-white/10">
              <div className="text-sm font-semibold mb-4">Market Stats</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60">Total Pool</span>
                  <span className="font-mono font-semibold text-green-400">
                    ${market?.total?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60">YES Pool</span>
                  <span className="font-mono text-foreground">${market?.yesPool?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60">NO Pool</span>
                  <span className="font-mono text-foreground">${market?.noPool?.toLocaleString() || '0'}</span>
                </div>
                <Progress value={yesPercent} />
              </div>
            </Card>

            <Card className="glass-strong rounded-2xl p-6 border-white/10">
              <div className="text-sm font-semibold mb-4">Cast Your Vote</div>
              <div className="grid gap-4">
                <RadioGroup value={voteChoice} onValueChange={(v) => setVoteChoice(v as 'yes' | 'no')} className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2">
                    <RadioGroupItem value="yes" id="vote-yes" />
                    <label htmlFor="vote-yes" className="text-sm">YES</label>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2">
                    <RadioGroupItem value="no" id="vote-no" />
                    <label htmlFor="vote-no" className="text-sm">NO</label>
                  </div>
                </RadioGroup>
                <div className="grid gap-2">
                  <label className="text-sm text-foreground/60">Vote Amount (TLINERA)</label>
                  <Input value={voteAmount} onChange={(e) => setVoteAmount(e.target.value)} placeholder="0.00" />
                </div>
                <Button onClick={castVote} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Cast Vote</Button>
                <div className="text-xs text-foreground/60">
                  Winners receive 60% of the losing pool proportional to their stake · Creator receives 30% if milestone succeeds · Platform fee: 10%
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="glass-strong rounded-2xl p-8 border-white/10 mt-6">
          <div className="text-xl font-bold mb-4">Community Comments</div>
            <div className="space-y-6">
              {canComment ? (
                <div className="grid gap-3">
                  <Textarea rows={4} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Your comment on the project" />
                  <div className="flex items-center justify-end">
                    <Button onClick={submitComment} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Add Comment</Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-foreground/60">Only users who voted for this project can comment.</div>
              )}

              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={i} className="rounded-xl border border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {c.avatar ? (
                          <AvatarImage src={`/api/proxy-image?url=${encodeURIComponent(c.avatar)}`} alt={c.nickname || ''} />
                        ) : (
                          <AvatarFallback>{(c.nickname || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-sm font-medium">{c.nickname || 'User'}</div>
                      <div className="ml-auto text-xs text-foreground/60">{new Date(c.created_at).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-foreground/80 leading-relaxed break-words">{c.content}</div>
                  </div>
                ))}
                {!comments.length && (
                  <div className="text-sm text-foreground/60">No comments yet</div>
                )}
              </div>
            </div>
        </Card>
      </div>
    </section>
  );
}
