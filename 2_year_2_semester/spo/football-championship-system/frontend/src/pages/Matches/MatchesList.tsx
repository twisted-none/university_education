// frontend/src/pages/Matches/MatchesList.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Calendar, Clock, MapPin, Trophy, Filter, AlertTriangle, Trash2 } from 'lucide-react';
import { MatchWithDetails, MatchStatus, MatchCreate, MatchUpdate, MatchResult } from '@/types/match';
import { getMatches, createMatch, updateMatch, setMatchResult, deleteMatch } from '@/services/matches';
import { useDebounce } from '@/hooks/useDebounce';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import MatchForm from '@/components/forms/MatchForm';
import MatchResultForm from '@/components/forms/MatchResultForm';

const MatchesList: React.FC = () => {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<MatchStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояния для модальных окон
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchMatches = async () => {
    // Не сбрасываем isLoading, чтобы не было "мигания" при фильтрации
    setError(null);
    try {
      // Бэкенд не поддерживает фильтрацию матчей, поэтому фильтруем на клиенте
      const data = await getMatches(0, 1000); // Загружаем все матчи
      setMatches(data);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError("Could not load matches. Please try again later.");
    } finally {
      if(isLoading) setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMatches();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedMatch(null);
    setIsMatchModalOpen(true);
  };

  const handleOpenEditModal = (match: MatchWithDetails) => {
    setSelectedMatch(match);
    setIsMatchModalOpen(true);
  };

  const handleOpenResultModal = (match: MatchWithDetails) => {
    setSelectedMatch(match);
    setIsResultModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsMatchModalOpen(false);
    setIsResultModalOpen(false);
    setSelectedMatch(null);
    setError(null);
  };

  const handleMatchSubmit = async (data: MatchCreate | MatchUpdate) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (selectedMatch) {
        await updateMatch(selectedMatch.id, data);
      } else {
        await createMatch(data as MatchCreate);
      }
      handleCloseModals();
      await fetchMatches();
    } catch (err: any) {
      console.error("Failed to save match:", err);
      setError(err.response?.data?.detail || "Failed to save match.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResultSubmit = async (data: MatchResult) => {
    if (!selectedMatch) return;
    setIsSubmitting(true);
    setError(null);
    try {
        await setMatchResult(selectedMatch.id, data);
        handleCloseModals();
        await fetchMatches();
    } catch (err: any) {
        console.error("Failed to set result:", err);
        setError(err.response?.data?.detail || "Failed to set match result.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (matchId: number) => {
    if (window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
        try {
            await deleteMatch(matchId);
            await fetchMatches();
        } catch (err: any) {
            console.error("Failed to delete match:", err);
            alert(err.response?.data?.detail || "Failed to delete match.");
        }
    }
  };
  
  // Функции форматирования и стилизации
  const statuses: (MatchStatus | 'all')[] = ['all', 'scheduled', 'finished', 'cancelled'];
  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'finished': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

  const filteredAndSortedMatches = useMemo(() => {
    return matches
      .filter(match => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = searchLower === '' ||
          match.home_team.name.toLowerCase().includes(searchLower) ||
          match.away_team.name.toLowerCase().includes(searchLower) ||
          match.stadium.name.toLowerCase().includes(searchLower);
        const matchesStatus = filterStatus === 'all' || match.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'asc' ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      });
  }, [matches, debouncedSearchTerm, filterStatus, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Matches Management</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Schedule and manage all championship matches</p></div>
            <Button onClick={handleOpenCreateModal} variant="primary" icon={Plus} className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg shadow-blue-500/25">Schedule New Match</Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search by teams or stadium..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                <div className="flex items-center space-x-3"><Filter className="w-5 h-5 text-gray-500" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as MatchStatus | 'all')} className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500">{statuses.map(status => (<option key={status} value={status}>{status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}</option>))}</select><select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [field, order] = e.target.value.split('-'); setSortBy(field as 'date' | 'status'); setSortOrder(order as 'asc' | 'desc'); }} className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"><option value="date-desc">Newest First</option><option value="date-asc">Oldest First</option><option value="status-asc">Status A-Z</option><option value="status-desc">Status Z-A</option></select></div>
            </div>
        </div>
        
        {error && !isMatchModalOpen && !isResultModalOpen && <div className="text-center py-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-600 flex items-center justify-center gap-2"><AlertTriangle size={18}/> {error}</div>}

        {/* Matches List */}
        <div className="space-y-4">
        {filteredAndSortedMatches.length > 0 ? (
            filteredAndSortedMatches.map((match) => (
              <div key={match.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-500/20 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1"><div className="flex items-center justify-between mb-4"><div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>{match.status.charAt(0).toUpperCase() + match.status.slice(1)}</div><div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"><div className="flex items-center space-x-1"><Calendar className="w-4 h-4" /><span>{formatDate(match.date)}</span></div><div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{formatTime(match.date)}</span></div></div></div><div className="flex items-center justify-center space-x-6 mb-4"><div className="text-center flex-1"><h3 className="font-bold text-lg text-gray-900 dark:text-white">{match.home_team.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">Home</p></div><div className="text-center">{match.status === 'finished' ? (<div className="text-2xl font-bold text-gray-900 dark:text-white">{match.home_goals} - {match.away_goals}</div>) : (<div className="text-lg font-bold text-gray-500 dark:text-gray-400">VS</div>)}</div><div className="text-center flex-1"><h3 className="font-bold text-lg text-gray-900 dark:text-white">{match.away_team.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">Away</p></div></div><div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4" /><span>{match.stadium.name}</span></div></div>
                  <div className="flex flex-col space-y-2 lg:w-40 lg:pl-4 lg:border-l lg:border-gray-200 dark:lg:border-gray-700">
                    <Button onClick={() => handleOpenEditModal(match)} variant="outline" size="sm" icon={Edit} className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">Manage Match</Button>
                    {match.status === 'scheduled' && (<Button onClick={() => handleOpenResultModal(match)} variant="success" size="sm" icon={Trophy}>Enter Result</Button>)}
                    <Button onClick={() => handleDelete(match.id)} variant="danger" size="sm" icon={Trash2}>Delete</Button>
                  </div>
                </div>
              </div>
            ))
        ) : (
            <div className="text-center py-12"><Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matches found</h3><p className="text-gray-500 dark:text-gray-400">{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter criteria' : 'Schedule your first match to get started'}</p></div>
        )}
        </div>
      </div>

      <Modal isOpen={isMatchModalOpen} onClose={handleCloseModals} title={selectedMatch ? 'Edit Match' : 'Schedule New Match'}>
        <MatchForm initialData={selectedMatch} onSubmit={handleMatchSubmit} onCancel={handleCloseModals} isLoading={isSubmitting} />
        {error && isMatchModalOpen && <div className="mt-4 text-center text-sm text-red-600">{error}</div>}
      </Modal>

      {selectedMatch && (
        <Modal isOpen={isResultModalOpen} onClose={handleCloseModals} title={`Enter Result for: ${selectedMatch.home_team.name} vs ${selectedMatch.away_team.name}`}>
            <MatchResultForm onCancel={handleCloseModals} onSubmit={handleResultSubmit} isLoading={isSubmitting} homeTeamName={selectedMatch.home_team.name} awayTeamName={selectedMatch.away_team.name} />
            {error && isResultModalOpen && <div className="mt-4 text-center text-sm text-red-600">{error}</div>}
        </Modal>
      )}
    </>
  );
};

export default MatchesList;