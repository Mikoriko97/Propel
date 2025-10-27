import { Clock, TrendingUp } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  creator: string;
  description: string;
  category: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  endTime: Date;
  onClick?: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  creator,
  description,
  category,
  totalPool,
  yesPool,
  noPool,
  endTime,
  onClick,
}: ProjectCardProps) {
  const yesPercentage = (yesPool / totalPool) * 100;
  const noPercentage = (noPool / totalPool) * 100;
  const timeLeft = Math.ceil((endTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, timeLeft);
  const hoursLeft = Math.max(0, Math.ceil((endTime.getTime() - Date.now()) / (1000 * 60 * 60)));

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div 
      className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="px-3 py-1 bg-emerald-light/10 text-emerald-dark dark:text-emerald-light text-xs font-medium rounded-full">
          {category}
        </span>
        <div className="flex items-center gap-1 text-[var(--text-muted)] text-sm">
          <Clock className="w-4 h-4" />
          <span>{daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-2">
        {title}
      </h3>

      <p className="text-sm text-[var(--text-muted)] mb-1">by {creator}</p>

      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
        {description}
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">Total Pool</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-light" />
            <span className="text-lg font-bold text-[var(--text-primary)]">
              ${totalPool.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-dark dark:text-emerald-light font-medium">
              YES {yesPercentage.toFixed(1)}%
            </span>
            <span className="text-ruby font-medium">
              NO {noPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-dark transition-all"
              style={{ width: `${yesPercentage}%` }}
            />
            <div
              className="bg-ruby transition-all"
              style={{ width: `${noPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
