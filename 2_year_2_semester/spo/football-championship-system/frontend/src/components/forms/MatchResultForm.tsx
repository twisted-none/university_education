// frontend/src/components/forms/MatchResultForm.tsx

import React, { useState } from 'react';
import { MatchResult } from '@/types/match';
import Button from '@/components/common/Button';

// Интерфейс для пропсов компонента
interface MatchResultFormProps {
  onSubmit: (data: MatchResult) => void;
  onCancel: () => void;
  isLoading: boolean;
  homeTeamName: string;
  awayTeamName: string;
}

const MatchResultForm: React.FC<MatchResultFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading, 
  homeTeamName, 
  awayTeamName 
}) => {
  const [homeGoals, setHomeGoals] = useState<number | ''>('');
  const [awayGoals, setAwayGoals] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeGoals === '' || awayGoals === '') {
      setError('Both scores are required.');
      return;
    }
    if (homeGoals < 0 || awayGoals < 0) {
      setError('Scores cannot be negative.');
      return;
    }
    setError(null);
    onSubmit({
      home_goals: Number(homeGoals),
      away_goals: Number(awayGoals),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4 items-center">
        <label htmlFor="home_goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {homeTeamName} (Home)
        </label>
        <input
          type="number"
          id="home_goals"
          value={homeGoals}
          onChange={(e) => setHomeGoals(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full text-center px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
          min="0"
          autoFocus // Удобно для пользователя
        />
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <label htmlFor="away_goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {awayTeamName} (Away)
        </label>
        <input
          type="number"
          id="away_goals"
          value={awayGoals}
          onChange={(e) => setAwayGoals(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full text-center px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
          min="0"
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="success" loading={isLoading}>
          Save Result
        </Button>
      </div>
    </form>
  );
};

export default MatchResultForm;