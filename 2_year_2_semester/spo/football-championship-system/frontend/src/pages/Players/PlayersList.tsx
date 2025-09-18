import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, Users, Filter, Award, AlertTriangle } from 'lucide-react';
import { PlayerWithTeam, PlayerPosition, PlayerCreate, PlayerUpdate } from '@/types/player';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '@/services/players';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import PlayerForm from '@/components/forms/PlayerForm';
import { useDebounce } from '@/hooks/useDebounce';

const POSITION_MAP: Record<PlayerPosition, string> = {
  'GK': 'Goalkeeper',
  'DEF': 'Defender',
  'MID': 'Midfielder',
  'FWD': 'Forward'
};

const PlayersList: React.FC = () => {
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<PlayerPosition | 'all'>('all');
  const [sortBy, setSortBy] = useState<'first_name' | 'age' | 'jersey_number'>('first_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerWithTeam | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

const fetchPlayers = async () => {
  setError(null);
  try {
    const params = {
      limit: 1000,
      search: debouncedSearchTerm || undefined,
      position: filterPosition !== 'all' ? filterPosition : undefined,
    };
    console.log('Fetching players with params:', params); // Добавьте это
    const data = await getPlayers(params);
    console.log('Received players data:', data); // И это
    setPlayers(data);
  } catch (err) {
    console.error("Failed to fetch players:", err);
    setError("Could not load players. Please try again.");
  } finally {
    if (isLoading) setIsLoading(false);
  }
};
  
  useEffect(() => {
    fetchPlayers();
  }, [debouncedSearchTerm, filterPosition]);

  const handleOpenCreateModal = () => {
    setEditingPlayer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (player: PlayerWithTeam) => {
    setEditingPlayer(player);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlayer(null);
    setError(null);
  };

  const handleSubmit = async (data: PlayerCreate | PlayerUpdate) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, data);
      } else {
        await createPlayer(data as PlayerCreate);
      }
      handleCloseModal();
      await fetchPlayers();
    } catch (err: any) {
      console.error("Failed to save player:", err);
      const errorMessage = err.response?.data?.detail || "Failed to save player. Please check the data.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (playerId: number) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
        try {
            await deletePlayer(playerId);
            await fetchPlayers();
        } catch (err: any) {
            console.error("Failed to delete player:", err);
            alert(err.response?.data?.detail || "Failed to delete player.");
        }
    }
  };

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aValue = sortBy === 'first_name' ? a.first_name : a[sortBy];
      const bValue = sortBy === 'first_name' ? b.first_name : b[sortBy];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [players, sortBy, sortOrder]);

  const getPositionColor = (position: PlayerPosition) => {
    switch (position) {
      case 'GK': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'DEF': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'MID': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'FWD': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Players Management</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage all players in the championship</p></div>
          <Button onClick={handleOpenCreateModal} variant="primary" icon={Plus} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25">Add New Player</Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search players by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" /></div>
            <div className="flex items-center space-x-3"><Filter className="w-5 h-5 text-gray-500" /><select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value as PlayerPosition | 'all')} className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"><option value="all">All Positions</option>{Object.entries(POSITION_MAP).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}</select><select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [field, order] = e.target.value.split('-'); setSortBy(field as 'first_name' | 'age' | 'jersey_number'); setSortOrder(order as 'asc' | 'desc'); }} className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"><option value="first_name-asc">Name A-Z</option><option value="first_name-desc">Name Z-A</option><option value="age-desc">Age (Old to Young)</option><option value="age-asc">Age (Young to Old)</option><option value="jersey_number-asc">Jersey #</option></select></div>
          </div>
        </div>
        
        {isLoading && <div className="flex items-center justify-center min-h-60"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>}
        {error && !isModalOpen && <div className="text-center py-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-600 flex items-center justify-center gap-2"><AlertTriangle size={18}/> {error}</div>}

        {/* Players Grid */}
        {!isLoading && sortedPlayers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPlayers.map((player) => (
              <div key={player.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-500/20 transition-all duration-300 group flex flex-col">
                <div className="flex-grow">
                    <div className="flex items-center justify-between mb-4"><div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">{player.jersey_number}</div><div className={`px-3 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>{POSITION_MAP[player.position]}</div></div>
                    <div className="mb-4"><h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">{player.first_name} {player.last_name}</h3><div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400"><Users className="w-4 h-4" /><span>{player.team.name}</span></div></div>
                    <div className="space-y-3 mb-6"><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Age</span><span className="text-sm font-medium text-gray-900 dark:text-white">{player.age} years</span></div><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Team</span><div className="flex items-center space-x-1"><Award className="w-4 h-4 text-purple-500" /><span className="text-sm font-medium text-gray-900 dark:text-white">{player.team.city}</span></div></div></div>
                </div>
                <div className="flex space-x-2 mt-auto"><Button onClick={() => handleOpenEditModal(player)} variant="outline" size="sm" icon={Edit} className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10">Edit</Button><Button onClick={() => handleDelete(player.id)} variant="danger" size="sm" icon={Trash2} className="px-3"></Button></div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && sortedPlayers.length === 0 && <div className="text-center py-12"><UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players found</h3><p className="text-gray-500 dark:text-gray-400">{debouncedSearchTerm || filterPosition !== 'all' ? 'Try adjusting your search or filter criteria' : 'Get started by adding your first player'}</p></div>}
      </div>

      {/* Модальное окно */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPlayer ? 'Edit Player' : 'Add New Player'}>
        <PlayerForm initialData={editingPlayer} onSubmit={handleSubmit} onCancel={handleCloseModal} isLoading={isSubmitting} />
        {error && isModalOpen && <div className="mt-4 text-center text-sm text-red-600">{error}</div>}
      </Modal>
    </>
  );
};

export default PlayersList;