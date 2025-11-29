'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const features = [
  'Decentralized voting mechanism',
  'Transparent fund allocation',
  'Community-driven decisions',
  'Real-time project tracking',
  'Secure blockchain integration',
  'Prediction market rewards',
];

export function AboutSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <Card className="glass-strong rounded-2xl overflow-hidden border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="relative h-64 lg:h-auto min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-cyan-500/20 to-primary/30 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/30 backdrop-blur-md border border-primary/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/40 backdrop-blur-md border border-primary/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
                Why Propel?
              </h2>

              <p className="text-foreground/70 leading-relaxed mb-8">
                Propel revolutionizes crypto venture funding by combining prediction market
                mechanics with decentralized voting. Our platform empowers the community to
                identify and fund the most promising projects while rewarding accurate
                predictions.
              </p>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm text-foreground/60">
                  Built on Linera blockchain for maximum speed, security, and scalability.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
