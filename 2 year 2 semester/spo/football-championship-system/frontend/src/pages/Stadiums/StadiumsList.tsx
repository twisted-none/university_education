import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Building, Filter, AlertTriangle } from 'lucide-react';
import { Stadium, StadiumCreate, StadiumUpdate } from '@/types/stadium';
import { getStadiums, createStadium, updateStadium, deleteStadium } from '@/services/stadiums';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import StadiumForm from '@/components/forms/StadiumForm';
import { useDebounce } from '@/hooks/useDebounce';

const StadiumsList: React.FC = () => {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'capacity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStadium, setEditingStadium] = useState<Stadium | null>(null);

  // <-- ИЗМЕНЕНИЕ: Создаем "отложенное" значение для поиска
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchStadiums = async () => {
    // Не устанавливаем isLoading в true здесь, чтобы избежать мигания всего списка при поиске
    setError(null);
    try {
      // <-- ИЗМЕНЕНИЕ: Передаем отложенный поисковый запрос в API
      const params = { limit: 100, search: debouncedSearchTerm || undefined };
      const data = await getStadiums(params);
      setStadiums(data);
    } catch (err) {
      console.error("Failed to fetch stadiums:", err);
      setError("Could not load stadiums. Please try again later.");
    } finally {
      // Устанавливаем isLoading в false только при первой загрузке
      if (isLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiums();
  }, [debouncedSearchTerm]); // <-- ИЗМЕНЕНИЕ: useEffect зависит от debouncedSearchTerm

  const handleOpenCreateModal = () => {
    setEditingStadium(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stadium: Stadium) => {
    setEditingStadium(stadium);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStadium(null);
    // Сбрасываем ошибку формы при закрытии
    setError(null);
  };

  const handleSubmit = async (data: StadiumCreate | StadiumUpdate) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingStadium) {
        await updateStadium(editingStadium.id, data);
      } else {
        await createStadium(data as StadiumCreate);
      }
      handleCloseModal();
      await fetchStadiums(); 
    } catch (err: any) {
      console.error("Failed to save stadium:", err);
      const errorMessage = err.response?.data?.detail || "Failed to save stadium. Please check the data.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (stadiumId: number) => {
    if (window.confirm('Are you sure you want to delete this stadium? This action cannot be undone.')) {
        try {
            await deleteStadium(stadiumId);
            await fetchStadiums();
        } catch (err: any) {
            console.error("Failed to delete stadium:", err);
            const errorMessage = err.response?.data?.detail || "Failed to delete stadium. It might be in use.";
            alert(errorMessage);
        }
    }
  };

  // <-- ИЗМЕНЕНИЕ: Клиентский .filter() удален. Осталась только сортировка.
  const sortedStadiums = useMemo(() => {
    return [...stadiums].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [stadiums, sortBy, sortOrder]);
  
  const getCapacityColor = (capacity: number) => {
    if (capacity >= 80000) return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    if (capacity >= 60000) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
    if (capacity >= 40000) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
  };
  const formatCapacity = (capacity: number) => capacity.toLocaleString();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stadiums Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all stadiums in the championship</p>
          </div>
          <Button onClick={handleOpenCreateModal} variant="primary" icon={Plus} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25">
            Add New Stadium
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search stadiums or cities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [field, order] = e.target.value.split('-'); setSortBy(field as 'name' | 'city' | 'capacity'); setSortOrder(order as 'asc' | 'desc'); }} className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="city-asc">City A-Z</option><option value="city-desc">City Z-A</option><option value="capacity-desc">Largest</option><option value="capacity-asc">Smallest</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && <div className="flex items-center justify-center min-h-60"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>}
        
        {error && !isModalOpen && <div className="text-center py-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-600 flex items-center justify-center gap-2"><AlertTriangle size={18}/> {error}</div>}
        
        {/* Stadiums Grid */}
        {!isLoading && sortedStadiums.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStadiums.map((stadium) => (
                <div key={stadium.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-orange-500/20 transition-all duration-300 group flex flex-col">
                    <div className="flex-grow">
                        <div className="flex items-start justify-between mb-4"><div className="flex items-center space-x-3"><div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><Building className="w-6 h-6 text-white" /></div><div><h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">{stadium.name}</h3><div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400"><MapPin className="w-4 h-4" /><span>{stadium.city}</span></div></div></div></div>
                        <div className="mb-6"><div className="flex items-center justify-between mb-3"><span className="text-sm text-gray-600 dark:text-gray-400">Capacity</span><div className={`px-3 py-1 rounded-full text-xs font-medium ${getCapacityColor(stadium.capacity)}`}>{formatCapacity(stadium.capacity)}</div></div><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2"><div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full" style={{ width: `${Math.min((stadium.capacity / 100000) * 100, 100)}%` }}></div></div></div>
                    </div>
                    <div className="flex space-x-2 mt-auto">
                        <Button onClick={() => handleOpenEditModal(stadium)} variant="outline" size="sm" icon={Edit} className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10">Edit</Button>
                        <Button onClick={() => handleDelete(stadium.id)} variant="danger" size="sm" icon={Trash2} className="px-3"></Button>
                    </div>
                </div>
            ))}
            </div>
        )}

        {!isLoading && sortedStadiums.length === 0 && <div className="text-center py-12"><Building className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stadiums found</h3><p className="text-gray-500 dark:text-gray-400">{debouncedSearchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first stadium'}</p></div>}
      </div>

      {/* Модальное окно */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStadium ? 'Edit Stadium' : 'Add New Stadium'}>
        <StadiumForm initialData={editingStadium} onSubmit={handleSubmit} onCancel={handleCloseModal} isLoading={isSubmitting} />
         {error && isModalOpen && <div className="mt-4 text-center text-sm text-red-600">{error}</div>}
      </Modal>
    </>
  );
};

export default StadiumsList;