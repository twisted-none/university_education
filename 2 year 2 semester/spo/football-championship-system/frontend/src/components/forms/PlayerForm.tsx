// frontend/src/components/forms/PlayerForm.tsx

import React, { useState, useEffect } from 'react';
import { PlayerWithTeam, PlayerCreate, PlayerUpdate, PlayerPosition } from '@/types/player';
import { Team } from '@/types/team';
import { getTeams } from '@/services/teams';
import Button from '@/components/common/Button';

const POSITIONS: PlayerPosition[] = ['GK', 'DEF', 'MID', 'FWD'];
const POSITION_MAP: Record<PlayerPosition, string> = { 'GK': 'Goalkeeper', 'DEF': 'Defender', 'MID': 'Midfielder', 'FWD': 'Forward' };

interface PlayerFormProps {
  initialData?: PlayerWithTeam | null;
  onSubmit: (data: PlayerCreate | PlayerUpdate) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '' as number | '',
    jersey_number: '' as number | '',
    position: 'FWD' as PlayerPosition,
    team_id: '' as number | '',
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamData = await getTeams({ limit: 1000 });
        setTeams(teamData);
        if (!initialData && teamData.length > 0) {
          setFormData(prev => ({ ...prev, team_id: teamData[0].id }));
        }
      } catch (error) {
        console.error("Failed to fetch teams", error);
        setErrors(prev => ({ ...prev, team_id: "Could not load teams" }));
      }
    };
    fetchTeams();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        age: initialData.age,
        jersey_number: initialData.jersey_number,
        position: initialData.position,
        team_id: initialData.team_id,
      });
    } else {
      setFormData({ first_name: '', last_name: '', age: '', jersey_number: '', position: 'FWD', team_id: teams.length > 0 ? teams[0].id : '' });
    }
  }, [initialData, teams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'age' || name === 'jersey_number' || name === 'team_id') ? (value === '' ? '' : Number(value)) : value }));
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (formData.age === '') newErrors.age = 'Age is required';
    else if (Number(formData.age) < 16 || Number(formData.age) > 45) newErrors.age = 'Age must be between 16 and 45';
    if (formData.jersey_number === '') newErrors.jersey_number = 'Jersey number is required';
    else if (Number(formData.jersey_number) < 1 || Number(formData.jersey_number) > 99) newErrors.jersey_number = 'Jersey # must be 1-99';
    if (formData.team_id === '') newErrors.team_id = 'Team is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // ИЗМЕНЕНИЕ: Приводим числовые поля к типу number перед отправкой
      const dataToSubmit = {
        ...formData,
        age: Number(formData.age),
        jersey_number: Number(formData.jersey_number),
        team_id: Number(formData.team_id),
      };
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-1"><label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label><input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />{errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}</div>
      <div className="md:col-span-1"><label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label><input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />{errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}</div>
      <div className="md:col-span-1"><label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label><input type="number" id="age" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />{errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}</div>
      <div className="md:col-span-1"><label htmlFor="jersey_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jersey Number</label><input type="number" id="jersey_number" name="jersey_number" value={formData.jersey_number} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />{errors.jersey_number && <p className="text-red-500 text-xs mt-1">{errors.jersey_number}</p>}</div>
      <div className="md:col-span-1"><label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label><select id="position" name="position" value={formData.position} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500">{POSITIONS.map(pos => <option key={pos} value={pos}>{POSITION_MAP[pos]}</option>)}</select></div>
      <div className="md:col-span-1"><label htmlFor="team_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label><select id="team_id" name="team_id" value={formData.team_id} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" disabled={teams.length === 0}>{teams.length > 0 ? (teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)) : (<option>Loading teams...</option>)}</select>{errors.team_id && <p className="text-red-500 text-xs mt-1">{errors.team_id}</p>}</div>
      <div className="md:col-span-2 flex justify-end space-x-4 pt-4"><Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button><Button type="submit" variant="primary" loading={isLoading} className="bg-gradient-to-r from-purple-500 to-pink-600">{initialData ? 'Save Changes' : 'Create Player'}</Button></div>
    </form>
  );
};

export default PlayerForm;