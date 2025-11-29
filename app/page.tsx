'use client';

import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { ProjectsSection } from '@/components/projects-section';
import { RolesSection } from '@/components/roles-section';
import { AboutSection } from '@/components/about-section';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ProjectsSection />
      <RolesSection />
      <AboutSection />
    </main>
  );
}
