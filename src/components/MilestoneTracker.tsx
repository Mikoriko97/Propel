import { Check, Clock, FileCheck, Loader } from 'lucide-react';

interface MilestoneTrackerProps {
  status: 'open' | 'in_progress' | 'under_review' | 'completed' | 'failed';
}

export function MilestoneTracker({ status }: MilestoneTrackerProps) {
  const steps = [
    { key: 'open', label: 'Market Open', icon: Clock },
    { key: 'in_progress', label: 'In Development', icon: Loader },
    { key: 'under_review', label: 'Under Review', icon: FileCheck },
    { key: 'completed', label: 'Completed', icon: Check },
  ];

  const statusOrder = ['open', 'in_progress', 'under_review', 'completed', 'failed'];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Milestone Progress</h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isFailed = status === 'failed' && index === steps.length - 1;

          return (
            <div key={step.key} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-emerald-dark text-white'
                    : isActive
                    ? 'bg-emerald-light text-white'
                    : isFailed
                    ? 'bg-ruby text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-muted)]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isActive || isCompleted
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {isCompleted && (
                <Check className="w-5 h-5 text-emerald-dark" />
              )}
            </div>
          );
        })}

        {status === 'failed' && (
          <div className="mt-4 p-4 bg-ruby/10 border border-ruby/20 rounded-lg">
            <p className="text-sm font-medium text-ruby">
              Milestone Failed - Project did not meet success criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
