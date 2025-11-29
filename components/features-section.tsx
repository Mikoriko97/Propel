'use client';

import { Vote, TrendingUp, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: Vote,
    title: 'Prediction Market Voting',
    description:
      'Vote on promising crypto projects using prediction market mechanics. Your stake determines your influence and potential returns.',
  },
  {
    icon: TrendingUp,
    title: 'Data-Driven Insights',
    description:
      'Access comprehensive analytics and market trends to make informed investment decisions backed by real-time data.',
  },
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description:
      'Built on blockchain technology ensuring complete transparency, security, and immutability of all transactions.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-strong rounded-2xl p-8 border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                {feature.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
