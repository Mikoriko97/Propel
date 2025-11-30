'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  title: z.string().min(3),
  category: z.string().min(1),
  description: z.string().min(10),
  goal: z.preprocess((v) => Number(v), z.number().positive()),
  link: z.string().url().optional(),
});

type FormValues = z.infer<typeof schema>;

const categories = ['DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Social', 'AI', 'Other'];

export default function SubmitProjectPage() {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { title: '', category: '', description: '', goal: 0, link: '' } });
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast({ title: 'Sign In', description: 'Please sign in with Discord to submit a project.' });
      setSubmitting(false);
      return;
    }
    const payload = {
      title: values.title,
      category: values.category,
      description: values.description,
      goal: values.goal,
      raised: 0,
      votes: 0,
      status: 'Active',
      owner_id: userData.user.id,
      link: values.link || null,
    };
    const inserted = await supabase.from('projects').insert(payload).select('id').maybeSingle();
    if (inserted.error || !inserted.data?.id) {
      setSubmitting(false);
      toast({ title: 'Error', description: 'Failed to submit the project.' });
      return;
    }
    const projId = String(inserted.data.id);
    setSubmitting(false);
    toast({ title: 'Done', description: 'Project submitted for review.' });
    form.reset();
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Submit Project</h2>
          <p className="text-foreground/60">Fill out the form to add your crypto project</p>
        </div>

        <Card className="glass-strong rounded-2xl p-8 border-white/10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Short project description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding goal (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 100000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input placeholder="Website or repository" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                Submit
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </section>
  );
}
