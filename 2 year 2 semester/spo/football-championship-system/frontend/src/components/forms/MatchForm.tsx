// frontend/src/components/forms/MatchForm.tsx
import React, { useState, useEffect } from 'react';
import { MatchWithDetails, MatchCreate, MatchUpdate } from '@/types/match';
import { Team } from '@/types/team';
import { Stadium } from '@/types/stadium';
import { getTeams } from '@/services/teams';
import { getStadiums } from '@/services/stadiums';
import Button from '@/components/common/Button';

interface MatchFormProps {
  initialData?: MatchWithDetails | null;
  onSubmit: (data: MatchCreate | MatchUpdate) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const MatchForm: React.FC<MatchFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    date: '',
    home_team_id: '' as number | '',
    away_team_id: '' as number | '',
    stadium_id: '' as number | '',
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, stadiumsData] = await Promise.all([
          getTeams({ limit: 1000 }),
          getStadiums({ limit: 1000 }),
        ]);
        setTeams(teamsData);
        setStadiums(stadiumsData);

        if (!initialData && teamsData.length >= 2 && stadiumsData.length > 0) {
          setFormData(prev => ({
            ...prev,
            home_team_id: teamsData[0].id,
            away_team_id: teamsData[1].id,
            stadium_id: stadiumsData[0].id,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch teams/stadiums", error);
        setErrors(prev => ({ ...prev, form: "Could not load required data." }));
      }
    };
    fetchData();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      // Форматируем дату для input[type=datetime-local]
      const localDate = new Date(initialData.date).toISOString().slice(0, 16);
      setFormData({
        date: localDate,
        home_team_id: initialData.home_team_id,
        away_team_id: initialData.away_team_id,
        stadium_id: initialData.stadium_id,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name.includes('_id')) ? Number(value) : value
    }));
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.date) newErrors.date = 'Date and time are required';
    if (!formData.home_team_id) newErrors.home_team_id = 'Home team is required';
    if (!formData.away_team_id) newErrors.away_team_id = 'Away team is required';
    if (formData.home_team_id === formData.away_team_id) {
      newErrors.away_team_id = 'Home and away teams must be different';
    }
    if (!formData.stadium_id) newErrors.stadium_id = 'Stadium is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const dataToSubmit = {
        date: new Date(formData.date).toISOString(),
        home_team_id: Number(formData.home_team_id), // Убеждаемся, что это число
        away_team_id: Number(formData.away_team_id), // Убеждаемся, что это число
        stadium_id: Number(formData.stadium_id),   // Убеждаемся, что это число
      };
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="home_team_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Team</label>
        <select id="home_team_id" name="home_team_id" value={formData.home_team_id} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500">
          <option value="">Select Home Team</option>
          {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
        {errors.home_team_id && <p className="text-red-500 text-xs mt-1">{errors.home_team_id}</p>}
      </div>

      <div>
        <label htmlFor="away_team_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Away Team</label>
        <select id="away_team_id" name="away_team_id" value={formData.away_team_id} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500">
          <option value="">Select Away Team</option>
          {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
        {errors.away_team_id && <p className="text-red-500 text-xs mt-1">{errors.away_team_id}</p>}
      </div>

      <div>
        <label htmlFor="stadium_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stadium</label>
        <select id="stadium_id" name="stadium_id" value={formData.stadium_id} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500">
          <option value="">Select Stadium</option>
          {stadiums.map(stadium => <option key={stadium.id} value={stadium.id}>{stadium.name} ({stadium.city})</option>)}
        </select>
        {errors.stadium_id && <p className="text-red-500 text-xs mt-1">{errors.stadium_id}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date and Time</label>
        <input type="datetime-local" id="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isLoading} className="bg-gradient-to-r from-blue-500 to-cyan-600">
          {initialData ? 'Save Changes' : 'Schedule Match'}
        </Button>
      </div>
    </form>
  );
};

export default MatchForm;