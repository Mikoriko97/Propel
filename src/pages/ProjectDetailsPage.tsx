import { useState } from 'react';
import { Clock, TrendingUp, User, Tag, ExternalLink } from 'lucide-react';
import { PredictionModule } from '../components/PredictionModule';
import { MilestoneTracker } from '../components/MilestoneTracker';
import { VerdictModule } from '../components/VerdictModule';
import { CommentsSection } from '../components/CommentsSection';

export function ProjectDetailsPage({ projectId }: { projectId?: string | null }) {
  const [projectStatus] = useState<'open' | 'in_progress' | 'under_review' | 'completed' | 'failed'>('open');

  // Here you can add logic to load project by ID
  // For now we use mock data
  const project = {
    id: projectId || '1',
    title: 'ScribeAI: AI-Powered Writing Assistant',
    creator: 'Elena Kovalenko',
    category: 'AI/ML',
    description: `ScribeAI is an innovative writing assistant specifically designed for English language users.
    The platform leverages advanced AI technology to provide real-time suggestions, grammar correction,
    and style improvements to enhance writing quality across various contexts.`,
    fullDescription: `Our goal is to create the most comprehensive English language writing tool available.
    The MVP will focus on delivering core functionality that writers, students, and professionals can use daily.

    The platform will analyze text in real-time, providing suggestions based on context, tone, and grammatical rules
    specific to the English language. We're partnering with linguistic experts to ensure accuracy and cultural relevance.`,
    totalPool: 15000,
    yesPool: 9000,
    noPool: 6000,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    milestone: {
      title: 'Milestone 1: MVP Development',
      criteria: [
        'Functional web application deployed and accessible via public URL',
        'Real-time AI suggestions working for English text (minimum 90% accuracy on test dataset)',
        'Grammar correction covering at least 50 most common English grammar rules',
        'User authentication system with 100+ registered test users',
        'Response time under 2 seconds for text analysis',
      ],
      deliverables: [
        'Live product URL',
        'Demo video showing all features',
        'User analytics dashboard screenshot',
        'Technical documentation',
      ],
      duration: '60 days',
    },
  };

  const timeLeft = Math.max(0, project.endTime.getTime() - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  const handleBet = (amount: number, position: 'yes' | 'no') => {
    console.log(`Betting ${amount} USDC on ${position.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-xl p-8">
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-emerald-light/10 text-emerald-dark dark:text-emerald-light text-sm font-medium rounded-full">
                  {project.category}
                </span>
                {projectStatus === 'open' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-ruby/10 rounded-full">
                    <Clock className="w-4 h-4 text-ruby" />
                    <span className="text-sm font-medium text-ruby">
                      {daysLeft > 0 ? `${daysLeft} days left` : `${hoursLeft} hours left`}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                {project.title}
              </h1>

              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-secondary)]">
                    Created by <span className="font-medium">{project.creator}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-secondary)]">
                    ID: #{project.id}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">About This Project</h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    {project.description}
                  </p>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {project.fullDescription}
                  </p>
                </div>

                <div className="p-6 bg-emerald-light/5 border-l-4 border-emerald-light rounded-r-lg">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                    {project.milestone.title}
                  </h3>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Success Criteria (All must be met):
                    </h4>
                    <ul className="space-y-2">
                      {project.milestone.criteria.map((criterion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="text-emerald-dark dark:text-emerald-light font-bold">•</span>
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Required Deliverables:
                    </h4>
                    <ul className="space-y-1">
                      {project.milestone.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="text-emerald-dark dark:text-emerald-light">✓</span>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-emerald-light/20">
                    <span className="text-sm text-[var(--text-muted)]">
                      Development Duration: <span className="font-medium text-[var(--text-primary)]">{project.milestone.duration}</span>
                    </span>
                  </div>
                </div>

                {projectStatus === 'completed' && (
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                      Submitted Evidence
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="#"
                        className="flex items-center gap-2 p-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-light transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-light" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          Live Product URL: scribeai.app
                        </span>
                      </a>
                      <a
                        href="#"
                        className="flex items-center gap-2 p-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-light transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-light" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          Demo Video (YouTube)
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Market Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Total Pool</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-light" />
                    <span className="text-xl font-bold text-[var(--text-primary)]">
                      ${project.totalPool.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-dark dark:text-emerald-light font-medium">
                      YES Pool
                    </span>
                    <span className="font-bold text-emerald-dark dark:text-emerald-light">
                      ${project.yesPool.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ruby font-medium">NO Pool</span>
                    <span className="font-bold text-ruby">
                      ${project.noPool.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-dark"
                      style={{ width: `${(project.yesPool / project.totalPool) * 100}%` }}
                    />
                    <div
                      className="bg-ruby"
                      style={{ width: `${(project.noPool / project.totalPool) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {projectStatus === 'open' && (
              <PredictionModule
                yesPool={project.yesPool}
                noPool={project.noPool}
                onBet={handleBet}
              />
            )}

            {(projectStatus === 'in_progress' || projectStatus === 'under_review') && (
              <MilestoneTracker status={projectStatus} />
            )}

            {projectStatus === 'completed' && (
              <VerdictModule
                isSuccess={true}
                votesFor={6}
                votesAgainst={1}
                evidenceLinks={[
                  'https://scribeai.app',
                  'https://youtube.com/demo',
                ]}
              />
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentsSection 
            projectId={project.id} 
            isCreator={false} // In real app this would be determined based on current user
          />
        </div>
      </div>
    </div>
  );
}
