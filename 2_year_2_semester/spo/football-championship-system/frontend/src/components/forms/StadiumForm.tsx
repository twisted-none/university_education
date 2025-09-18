// frontend/src/components/forms/StadiumForm.tsx

import React, { useState, useEffect } from 'react';
import { Stadium, StadiumCreate, StadiumUpdate } from '@/types/stadium';
import Button from '@/components/common/Button';

interface StadiumFormProps {
  initialData?: Stadium | null;
  onSubmit: (data: StadiumCreate | StadiumUpdate) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const StadiumForm: React.FC<StadiumFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCity(initialData.city);
      setCapacity(initialData.capacity);
    } else {
      setName('');
      setCity('');
      setCapacity('');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (capacity === '') newErrors.capacity = 'Capacity is required';
    else if (Number(capacity) < 1000 || Number(capacity) > 100000) {
      newErrors.capacity = 'Capacity must be between 1,000 and 100,000';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const data = { name, city, capacity: Number(capacity) };
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stadium Name</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}</div>
      <div><label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label><input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}</div>
      <div><label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label><input type="number" id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />{errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}</div>
      <div className="flex justify-end space-x-4 pt-4"><Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button><Button type="submit" variant="primary" loading={isLoading} className="bg-gradient-to-r from-orange-500 to-red-600">{initialData ? 'Save Changes' : 'Create Stadium'}</Button></div>
    </form>
  );
};

export default StadiumForm;