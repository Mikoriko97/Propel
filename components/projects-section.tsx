'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const projects = [
  {
    title: 'DeFi Protocol Alpha',
    category: 'DeFi',
    raised: '$2.4M',
    votes: 1284,
    trend: '+24%',
    status: 'Active',
  },
  {
    title: 'NFT Marketplace Beta',
    category: 'NFT',
    raised: '$1.8M',
    votes: 956,
    trend: '+18%',
    status: 'Active',
  },
  {
    title: 'GameFi Revolution',
    category: 'Gaming',
    raised: '$3.2M',
    votes: 1523,
    trend: '+32%',
    status: 'Hot',
  },
];

export function ProjectsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
            Latest Projects
          </h2>
          <p className="text-foreground/60 text-lg">
            Discover trending crypto ventures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="glass-strong rounded-2xl p-6 border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-primary/20 text-primary">
                    {project.category}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {project.title}
                  </h3>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400">
                  {project.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60 text-sm">Raised</span>
                  <span className="font-bold text-primary">
                    {project.raised}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60 text-sm">Votes</span>
                  <span className="font-semibold text-foreground">
                    {project.votes}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60 text-sm">Trend</span>
                  <span className="flex items-center gap-1 font-semibold text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    {project.trend}
                  </span>
                </div>
              </div>

              <Link href={`/projects/${index + 1}`} className="w-full">
                <Button className="w-full bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/30 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  View Details
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
