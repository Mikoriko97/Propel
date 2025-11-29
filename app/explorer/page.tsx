'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, TrendingUp, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Project = {
  id: string;
  title: string;
  category: string;
  raised: number;
  votes: number;
  status: string;
  trend?: number;
  description?: string;
};

const fallbackProjects: Project[] = [
  { id: '1', title: 'DeFi Protocol Alpha', category: 'DeFi', raised: 2400000, votes: 1284, trend: 24, status: 'Active' },
  { id: '2', title: 'NFT Marketplace Beta', category: 'NFT', raised: 1800000, votes: 956, trend: 18, status: 'Active' },
  { id: '3', title: 'GameFi Revolution', category: 'Gaming', raised: 3200000, votes: 1523, trend: 32, status: 'Hot' },
];

export default function ExplorerPage() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id,title,category,raised,votes,status,trend,description')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data && Array.isArray(data)) {
        const normalized = data.map((p) => ({
          id: String(p.id),
          title: String(p.title),
          category: String(p.category),
          raised: Number(p.raised ?? 0),
          votes: Number(p.votes ?? 0),
          status: String(p.status ?? 'Active'),
          trend: typeof p.trend === 'number' ? p.trend : undefined,
          description: p.description ? String(p.description) : undefined,
        })) as Project[];
        setProjects(normalized.length ? normalized : fallbackProjects);
      }
    };
    load();
  }, []);

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
            Explorer
          </h2>
          <p className="text-foreground/60 text-lg">Discover trending crypto projects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="glass-strong rounded-2xl p-6 border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-primary/20 text-primary">
                    {project.category}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{project.title}</h3>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400">
                  {project.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60 text-sm">Raised</span>
                  <span className="font-bold text-primary">
                    {project.raised.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60 text-sm">Votes</span>
                  <span className="font-semibold text-foreground">{project.votes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60 text-sm">Trend</span>
                  <span className="flex items-center gap-1 font-semibold text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    {project.trend ? `+${project.trend}%` : '+0%'}
                  </span>
                </div>
              </div>

              <Link href={`/projects/${project.id}`} className="w-full">
                <Button className="w-full bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/30 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  View
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
