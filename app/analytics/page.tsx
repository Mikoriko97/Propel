'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type DataPoint = { date: string; value: number };
type CategoryPoint = { name: string; value: number };

const sampleDays = ['2025-11-01','2025-11-05','2025-11-10','2025-11-15','2025-11-20','2025-11-25'];

const sampleUsers: DataPoint[] = sampleDays.map((d, i) => ({ date: d, value: 100 + i * 25 }));
const sampleProjects: DataPoint[] = sampleDays.map((d, i) => ({ date: d, value: 5 + i * 2 }));
const sampleFundsProjects: DataPoint[] = sampleDays.map((d, i) => ({ date: d, value: 20000 + i * 5000 }));
const sampleFundsInvestors: DataPoint[] = sampleDays.map((d, i) => ({ date: d, value: 10000 + i * 4000 }));
const sampleTotalVolume: DataPoint[] = sampleDays.map((d, i) => ({ date: d, value: 30000 + i * 9000 }));

const sampleInvestorCats: CategoryPoint[] = [
  { name: 'DeFi', value: 45 },
  { name: 'Gaming', value: 25 },
  { name: 'NFT', value: 18 },
  { name: 'AI', value: 12 },
];

const sampleDeveloperCats: CategoryPoint[] = [
  { name: 'DeFi', value: 30 },
  { name: 'Infrastructure', value: 28 },
  { name: 'Gaming', value: 22 },
  { name: 'NFT', value: 20 },
];

const palette = ['#34d1bf', '#0ea5e9', '#a78bfa', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [users, setUsers] = useState<DataPoint[]>(sampleUsers);
  const [projects, setProjects] = useState<DataPoint[]>(sampleProjects);
  const [fundsProjects, setFundsProjects] = useState<DataPoint[]>(sampleFundsProjects);
  const [fundsInvestors, setFundsInvestors] = useState<DataPoint[]>(sampleFundsInvestors);
  const [totalVolume, setTotalVolume] = useState<DataPoint[]>(sampleTotalVolume);
  const [investorCats, setInvestorCats] = useState<CategoryPoint[]>(sampleInvestorCats);
  const [developerCats, setDeveloperCats] = useState<CategoryPoint[]>(sampleDeveloperCats);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const u = await supabase.from('daily_users').select('date,count');
      if (!u.error && u.data) setUsers(u.data.map((r: any) => ({ date: String(r.date), value: Number(r.count) })));
      const p = await supabase.from('daily_projects').select('date,count');
      if (!p.error && p.data) setProjects(p.data.map((r: any) => ({ date: String(r.date), value: Number(r.count) })));
      const fp = await supabase.from('daily_project_funds').select('date,amount');
      if (!fp.error && fp.data) setFundsProjects(fp.data.map((r: any) => ({ date: String(r.date), value: Number(r.amount) })));
      const fi = await supabase.from('daily_investor_funds').select('date,amount');
      if (!fi.error && fi.data) setFundsInvestors(fi.data.map((r: any) => ({ date: String(r.date), value: Number(r.amount) })));
      const tv = await supabase.from('daily_total_volume').select('date,amount');
      if (!tv.error && tv.data) setTotalVolume(tv.data.map((r: any) => ({ date: String(r.date), value: Number(r.amount) })));
      const ic = await supabase.from('top_categories_investors').select('name,value');
      if (!ic.error && ic.data) setInvestorCats(ic.data.map((r: any) => ({ name: String(r.name), value: Number(r.value) })));
      const dc = await supabase.from('top_categories_developers').select('name,value');
      if (!dc.error && dc.data) setDeveloperCats(dc.data.map((r: any) => ({ name: String(r.name), value: Number(r.value) })));
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Analytics</h2>
          <p className="text-foreground/60 text-lg">Key platform metrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-strong rounded-2xl p-6 border-white/10">
            <ChartContainer config={{ users: { label: 'Users', color: '#34d1bf' } }}>
              <LineChart data={users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="value" name="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </Card>

          <Card className="glass-strong rounded-2xl p-6 border-white/10">
            <ChartContainer config={{ projects: { label: 'Projects', color: '#0ea5e9' } }}>
              <LineChart data={projects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="value" name="projects" stroke="var(--color-projects)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </Card>

          <Card className="glass-strong rounded-2xl p-6 border-white/10">
            <ChartContainer config={{ fundsProjects: { label: 'Project funds', color: '#a78bfa' } }}>
              <LineChart data={fundsProjects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${Number(v).toLocaleString()}`} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="value" name="fundsProjects" stroke="var(--color-fundsProjects)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </Card>

          <Card className="glass-strong rounded-2xl p-6 border-white/10">
            <ChartContainer config={{ fundsInvestors: { label: 'Investor funds', color: '#f59e0b' } }}>
              <LineChart data={fundsInvestors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${Number(v).toLocaleString()}`} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="value" name="fundsInvestors" stroke="var(--color-fundsInvestors)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </Card>

          <Card className="glass-strong rounded-2xl p-6 border-white/10 lg:col-span-2">
            <ChartContainer config={{ totalVolume: { label: 'Total volume', color: '#ef4444' } }}>
              <LineChart data={totalVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${Number(v).toLocaleString()}`} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="value" name="totalVolume" stroke="var(--color-totalVolume)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </Card>

          <Card className="glass-strong rounded-2xl p-6 border-white/10">
            <div className="flex flex-col gap-4">
              <div className="text-sm font-semibold">Investor categories</div>
              <PieChart width={480} height={260}>
                <Pie data={investorCats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                  {investorCats.map((_, i) => (
                    <Cell key={`ic-${i}`} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </div>
          </Card>

          <Card className="glass-strong rounded-2xl p-6 border-white/10">
            <div className="flex flex-col gap-4">
              <div className="text-sm font-semibold">Developer categories</div>
              <PieChart width={480} height={260}>
                <Pie data={developerCats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                  {developerCats.map((_, i) => (
                    <Cell key={`dc-${i}`} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
