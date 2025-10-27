import { Rocket, TrendingUp, Users, ArrowRight, Shield } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { Footer } from '../components/Footer';

export function LandingPage({ onProjectClick }: { onProjectClick?: (id: string) => void }) {
  const handleProjectClick = (projectId: string) => {
    if (onProjectClick) {
      onProjectClick(projectId);
    }
  };

  const mockProjects = [
    {
      id: '1',
      title: 'ScribeAI: AI-Powered Writing Assistant',
      creator: 'Elena Kovalenko',
      description: 'Build MVP with real-time AI suggestions and grammar correction for English language.',
      category: 'AI/ML',
      totalPool: 15000,
      yesPool: 9000,
      noPool: 6000,
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'EcoTrack: Carbon Footprint Calculator',
      creator: 'Dmitro Petrov',
      description: 'Develop mobile app with database of 500+ products and personalized recommendations.',
      category: 'CleanTech',
      totalPool: 8500,
      yesPool: 3500,
      noPool: 5000,
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'LocalFarm: Farm-to-Table Marketplace',
      creator: 'Anna Sydorenko',
      description: 'Launch platform connecting 50+ local farms with urban consumers in major cities.',
      category: 'Marketplace',
      totalPool: 12000,
      yesPool: 8000,
      noPool: 4000,
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--text-primary)] mb-6">
            Propel Ideas.
            <br />
            <span className="text-emerald-light">Profit from Predictions.</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
            A decentralized platform where creators get milestone-based funding,
            and backers earn by predicting project success.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/explore"
              className="px-8 py-4 bg-emerald-light hover:bg-emerald-dark text-white font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              Explore Markets
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/create"
              className="px-8 py-4 border-2 border-emerald-light text-emerald-light hover:bg-emerald-light hover:text-white font-bold rounded-lg transition-colors"
            >
              Create Project
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-emerald-light" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">1. Create Project</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Creators submit ideas with clear, objective success criteria for Milestone 1
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-light" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">2. Market Opens</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Backers bet YES or NO on whether the creator will meet the milestone criteria
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-light" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">3. Review & Verdict</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Creator submits evidence. Propel team verifies if criteria were met
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-light" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">4. Distribution</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Winners get 60% of losing pool. Creator gets 30%. Platform keeps 10%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Propel Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Why choose <span className="text-emerald-light">Propel</span>?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-3xl mx-auto">
            We've created a unique ecosystem where innovation meets transparent funding
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border-color)] hover:border-emerald-light/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-emerald-light/10 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-light/20 transition-colors">
                <Shield className="w-8 h-8 text-emerald-light" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Transparency & Trust</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Each project milestone is verified by an independent team. Objective success criteria eliminate subjectivity and manipulation.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border-color)] hover:border-emerald-light/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-emerald-light/10 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-light/20 transition-colors">
                <TrendingUp className="w-8 h-8 text-emerald-light" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Fair Rewards</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Unique distribution model: creators receive funding + 30% from the losing side, while accurate predictors share 60% of the prize pool.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border-color)] hover:border-emerald-light/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-emerald-light/10 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-light/20 transition-colors">
                <Rocket className="w-8 h-8 text-emerald-light" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Innovation without Risks</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Milestone-based funding reduces risks for all participants. Creators receive resources gradually, proving their capability at each step.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Hot Markets</h2>
            <a
              href="/explore"
              className="text-emerald-light hover:text-emerald-dark font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} {...project} onClick={handleProjectClick} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">For Creators</h2>
              <p className="text-lg text-[var(--text-secondary)]">
                Get funded to build your idea. Define clear milestones, prove execution,
                and unlock capital as you deliver results.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[var(--text-secondary)]">Milestone-based funding unlocks as you deliver</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[var(--text-secondary)]">Earn 30% of the losing pool when you succeed</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[var(--text-secondary)]">Build credibility with transparent, verified progress</span>
                </li>
              </ul>
              <a
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-light hover:bg-emerald-dark text-white font-bold rounded-lg transition-colors"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">For Backers</h2>
              <p className="text-lg text-[var(--text-secondary)]">
                Put your analytical skills to work. Predict which projects will succeed
                and earn returns from accurate forecasts.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[var(--text-secondary)]">Bet on project success or failure with USDC</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[var(--text-secondary)]">Winners share 60% of the losing pool</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[var(--text-secondary)]">Clear, objective criteria eliminate ambiguity</span>
                </li>
              </ul>
              <a
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-light hover:bg-emerald-dark text-white font-bold rounded-lg transition-colors"
              >
                Explore Markets
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
