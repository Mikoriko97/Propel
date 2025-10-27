import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface VerdictModuleProps {
  isSuccess: boolean;
  votesFor: number;
  votesAgainst: number;
  evidenceLinks?: string[];
}

export function VerdictModule({ isSuccess, votesFor, votesAgainst, evidenceLinks }: VerdictModuleProps) {
  const totalVotes = votesFor + votesAgainst;

  return (
    <div className="bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <div className={`flex items-center gap-3 mb-6 pb-6 border-b ${
        isSuccess ? 'border-emerald-dark/20' : 'border-ruby/20'
      }`}>
        {isSuccess ? (
          <>
            <CheckCircle className="w-8 h-8 text-emerald-dark" />
            <div>
              <h3 className="text-xl font-bold text-emerald-dark">Milestone Successful</h3>
              <p className="text-sm text-[var(--text-muted)]">Success criteria verified</p>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-8 h-8 text-ruby" />
            <div>
              <h3 className="text-xl font-bold text-ruby">Milestone Failed</h3>
              <p className="text-sm text-[var(--text-muted)]">Criteria not met</p>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Decision Details (Propel Team Review)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-emerald-dark/10 rounded-lg">
              <div className="text-2xl font-bold text-emerald-dark">{votesFor}</div>
              <div className="text-xs text-[var(--text-muted)]">Votes For</div>
            </div>
            <div className="p-3 bg-ruby/10 rounded-lg">
              <div className="text-2xl font-bold text-ruby">{votesAgainst}</div>
              <div className="text-xs text-[var(--text-muted)]">Votes Against</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-[var(--text-muted)]">
            {votesFor} of {totalVotes} reviewers approved this milestone
          </div>
        </div>

        {evidenceLinks && evidenceLinks.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
              Submitted Evidence
            </h4>
            <div className="space-y-2">
              {evidenceLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-light hover:text-emerald-dark transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="truncate">Evidence Link {index + 1}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
