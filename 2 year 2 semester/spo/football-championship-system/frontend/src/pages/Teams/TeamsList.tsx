// frontend/src/pages/Teams/TeamsList.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Users, MapPin, Trophy, Filter, AlertTriangle } from 'lucide-react';
import { Team, TeamCreate, TeamUpdate } from '@/types/team';
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/services/teams';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import TeamForm from '@/components/forms/TeamForm';
import { useDebounce } from '@/hooks/useDebounce';

const TeamsList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'last_season_place'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchTeams = async () => {
    setError(null);
    try {
      const params = { limit: 100, search: debouncedSearchTerm || undefined };
      const data = await getTeams(params);
      setTeams(data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError("Could not load teams. Please try again later.");
    } finally {
      if (isLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [debouncedSearchTerm]);

  const handleOpenCreateModal = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setError(null);
  };

  const handleSubmit = async (data: TeamCreate | TeamUpdate) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, data);
      } else {
        await createTeam(data as TeamCreate);
      }
      handleCloseModal();
      await fetchTeams();
    } catch (err: any) {
      console.error("Failed to save team:", err);
      const errorMessage = err.response?.data?.detail || "Failed to save team. Please check the data.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (teamId: number) => {
    if (window.confirm('Are you sure you want to delete this team? All associated players will also be affected.')) {
        try {
            await deleteTeam(teamId);
            await fetchTeams();
        } catch (err: any) {
            console.error("Failed to delete team:", err);
            alert(err.response?.data?.detail || "Failed to delete team. It might have associated matches.");
        }
    }
  };

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [teams, sortBy, sortOrder]);

  const getPlaceColor = (place: number) => {
    if (place === 1) return 'text-yellow-500 bg-yellow-500/10';
    if (place <= 3) return 'text-green-500 bg-green-500/10';
    if (place <= 10) return 'text-blue-500 bg-blue-500/10';
    return 'text-gray-500 bg-gray-500/10';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all teams in the championship</p>
          </div>
          <Button onClick={handleOpenCreateModal} variant="primary" icon={Plus} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25">
            Add New Team
          </Button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search teams, cities, or coaches..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [field, order] = e.target.value.split('-'); setSortBy(field as 'name' | 'city' | 'last_season_place'); setSortOrder(order as 'asc' | 'desc'); }} className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="city-asc">City A-Z</option><option value="city-desc">City Z-A</option><option value="last_season_place-asc">Best Position</option><option value="last_season_place-desc">Worst Position</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && <div className="flex items-center justify-center min-h-60"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>}
        {error && !isModalOpen && <div className="text-center py-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-600 flex items-center justify-center gap-2"><AlertTriangle size={18}/> {error}</div>}

        {!isLoading && sortedTeams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTeams.map((team) => (
              <div key={team.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-cyan-500/20 transition-all duration-300 group flex flex-col">
                <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3"><div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><Users className="w-6 h-6 text-white" /></div><div><h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-500 transition-colors">{team.name}</h3><div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400"><MapPin className="w-4 h-4" /><span>{team.city}</span></div></div></div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPlaceColor(team.last_season_place)}`}>#{team.last_season_place}</div>
                    </div>
                    <div className="space-y-3 mb-6"><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Coach</span><span className="text-sm font-medium text-gray-900 dark:text-white">{team.coach}</span></div><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Last Season</span><div className="flex items-center space-x-1"><Trophy className="w-4 h-4 text-yellow-500" /><span className="text-sm font-medium text-gray-900 dark:text-white">{team.last_season_place === 1 ? 'Champion' : `${team.last_season_place}th Place`}</span></div></div></div>
                </div>
                <div className="flex space-x-2 mt-auto">
                    <Button onClick={() => handleOpenEditModal(team)} variant="outline" size="sm" icon={Edit} className="flex-1 border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10">Edit</Button>
                    <Button onClick={() => handleDelete(team.id)} variant="danger" size="sm" icon={Trash2} className="px-3"></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && sortedTeams.length === 0 && <div className="text-center py-12"><Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No teams found</h3><p className="text-gray-500 dark:text-gray-400">{debouncedSearchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first team'}</p></div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTeam ? 'Edit Team' : 'Add New Team'}>
        <TeamForm initialData={editingTeam} onSubmit={handleSubmit} onCancel={handleCloseModal} isLoading={isSubmitting} />
        {error && isModalOpen && <div className="mt-4 text-center text-sm text-red-600">{error}</div>}
      </Modal>
    </>
  );
};

export default TeamsList;