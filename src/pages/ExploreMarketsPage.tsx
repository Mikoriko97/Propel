import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';

export function ExploreMarketsPage({ onProjectClick }: { onProjectClick?: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const handleProjectClick = (projectId: string) => {
    if (onProjectClick) {
      onProjectClick(projectId);
    }
  };

  const categories = ['All', 'AI/ML', 'CleanTech', 'Marketplace', 'FinTech', 'HealthTech', 'EdTech'];
  const statuses = ['All', 'Open', 'In Progress', 'Under Review', 'Completed'];

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
    {
      id: '4',
      title: 'CryptoWallet: Secure Digital Wallet',
      creator: 'Oleksiy Tkachenko',
      description: 'Create mobile wallet with multi-chain support and biometric security for 10,000+ users.',
      category: 'FinTech',
      totalPool: 22000,
      yesPool: 14000,
      noPool: 8000,
      endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: '5',
      title: 'MediConnect: Telemedicine Platform',
      creator: 'Iryna Moroz',
      description: 'Develop HIPAA-compliant video consultation platform with 100+ verified doctors.',
      category: 'HealthTech',
      totalPool: 18500,
      yesPool: 11000,
      noPool: 7500,
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: '6',
      title: 'LearnHub: Interactive Coding Platform',
      creator: 'Maxim Boyko',
      description: 'Build platform with 50 interactive coding lessons and real-time code execution.',
      category: 'EdTech',
      totalPool: 9500,
      yesPool: 5500,
      noPool: 4000,
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  ];

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Explore Markets</h1>
          <p className="text-lg text-[var(--text-muted)]">
            Discover projects and place your bets on future success
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 space-y-6">
            <div className="bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-[var(--text-primary)]" />
                <h2 className="font-bold text-[var(--text-primary)]">Filters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status.toLowerCase().replace(' ', '_')}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-emerald-light/10 border border-emerald-light/20 rounded-xl p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-2">New to Propel?</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Learn how prediction markets work and start earning from your forecasts.
              </p>
              <a
                href="#"
                className="text-sm text-emerald-light hover:text-emerald-dark font-medium"
              >
                Read Guide →
              </a>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                />
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[var(--text-muted)]">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </p>
              <select className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light">
                <option>Trending</option>
                <option>Newest</option>
                <option>Ending Soon</option>
                <option>Largest Pool</option>
              </select>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} {...project} onClick={handleProjectClick} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-xl">
                <p className="text-[var(--text-muted)] mb-4">No projects match your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }}
                  className="text-emerald-light hover:text-emerald-dark font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
