'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, Wallet, ArrowRight } from 'lucide-react';

const roles = [
  {
    icon: Code2,
    title: 'For Developers',
    description:
      'Launch your crypto project and gain visibility. Access funding through community voting, receive valuable feedback, and connect with experienced investors who believe in your vision.',
    features: ['Submit Projects', 'Track Analytics', 'Community Feedback', 'Funding Access'],
    cta: 'Start Building',
  },
  {
    icon: Wallet,
    title: 'For Investors',
    description:
      'Discover early-stage crypto projects with high potential. Use prediction market voting to influence project selection, earn returns on successful predictions, and build a diversified portfolio.',
    features: ['Vote on Projects', 'Earn Rewards', 'Portfolio Tracking', 'Market Insights'],
    cta: 'Start Investing',
  },
];

export function RolesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {roles.map((role, index) => (
            <Card
              key={index}
              className="glass-strong rounded-2xl p-8 border-white/10 hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <role.icon className="w-8 h-8 text-primary" />
              </div>

              <h3 className="text-3xl font-bold mb-4 text-foreground">
                {role.title}
              </h3>

              <p className="text-foreground/70 leading-relaxed mb-6">
                {role.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {role.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl group">
                {role.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
