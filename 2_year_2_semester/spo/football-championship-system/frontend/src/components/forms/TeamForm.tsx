// frontend/src/components/forms/TeamForm.tsx

import React, { useState, useEffect } from 'react';
import { Team, TeamCreate, TeamUpdate } from '@/types/team';
import Button from '@/components/common/Button';

interface TeamFormProps {
  initialData?: Team | null;
  onSubmit: (data: TeamCreate | TeamUpdate) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TeamForm: React.FC<TeamFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    coach: '',
    last_season_place: '' as number | '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        city: initialData.city,
        coach: initialData.coach,
        last_season_place: initialData.last_season_place,
      });
    } else {
      setFormData({ name: '', city: '', coach: '', last_season_place: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'last_season_place' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.coach.trim()) newErrors.coach = 'Coach name is required';
    if (formData.last_season_place === '') newErrors.last_season_place = 'Place is required';
    else if (Number(formData.last_season_place) < 1 || Number(formData.last_season_place) > 20) {
      newErrors.last_season_place = 'Place must be between 1 and 20';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        last_season_place: Number(formData.last_season_place)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
        <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>
      <div>
        <label htmlFor="coach" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coach</label>
        <input type="text" id="coach" name="coach" value={formData.coach} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
        {errors.coach && <p className="text-red-500 text-xs mt-1">{errors.coach}</p>}
      </div>
      <div>
        <label htmlFor="last_season_place" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Season's Place</label>
        <input type="number" id="last_season_place" name="last_season_place" value={formData.last_season_place} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
        {errors.last_season_place && <p className="text-red-500 text-xs mt-1">{errors.last_season_place}</p>}
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isLoading} className="bg-gradient-to-r from-green-500 to-emerald-600">
          {initialData ? 'Save Changes' : 'Create Team'}
        </Button>
      </div>
    </form>
  );
};

export default TeamForm;