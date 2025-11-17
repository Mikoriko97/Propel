import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PredictionModuleProps {
  yesPool: number;
  noPool: number;
  onBet: (amount: number, position: 'yes' | 'no') => void;
}

export function PredictionModule({ yesPool, noPool, onBet }: PredictionModuleProps) {
  const [amount, setAmount] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<'yes' | 'no' | null>(null);

  const calculatePotentialProfit = () => {
    const betAmount = parseFloat(amount) || 0;
    if (betAmount === 0 || !selectedPosition) return 0;

    const losingPool = selectedPosition === 'yes' ? noPool : yesPool;
    const winningPool = selectedPosition === 'yes' ? yesPool : noPool;

    const newWinningPool = winningPool + betAmount;
    const profitShare = (betAmount / newWinningPool) * losingPool * 0.6;

    return profitShare;
  };

  const potentialProfit = calculatePotentialProfit();

  const handleBet = () => {
    if (selectedPosition && amount) {
      onBet(parseFloat(amount), selectedPosition);
      setAmount('');
      setSelectedPosition(null);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Place Your Bet</h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedPosition('yes')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPosition === 'yes'
                ? 'border-emerald-dark bg-emerald-dark/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-dark'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-dark" />
              <span className="font-bold text-emerald-dark">YES</span>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Pool: ${yesPool.toLocaleString()}
            </div>
          </button>

          <button
            onClick={() => setSelectedPosition('no')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPosition === 'no'
                ? 'border-ruby bg-ruby/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-ruby'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-ruby" />
              <span className="font-bold text-ruby">NO</span>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Pool: ${noPool.toLocaleString()}
            </div>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Bet Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
            />
          </div>

          {amount && selectedPosition && (
            <div className="p-4 bg-emerald-light/5 border border-emerald-light/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-muted)]">Your bet:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  ${parseFloat(amount).toFixed(2)} {selectedPosition.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Potential profit:</span>
                <span className="font-bold text-emerald-dark dark:text-emerald-light">
                  ~${potentialProfit.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleBet}
            disabled={!amount || !selectedPosition}
            className="w-full py-3 bg-emerald-light hover:bg-emerald-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Place Bet
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-[var(--text-muted)] space-y-1">
          <p>• Winners receive 60% of the losing pool proportional to their stake</p>
          <p>• Creator receives 30% if milestone succeeds</p>
          <p>• Platform fee: 10%</p>
        </div>
      </div>
    </div>
  );
}
