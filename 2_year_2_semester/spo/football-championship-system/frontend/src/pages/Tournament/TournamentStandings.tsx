import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Award, Crown, AlertTriangle } from 'lucide-react';
import { TournamentTable, TeamStanding } from '@/types/report';
import { getTournamentStandings } from '@/services/reports';

const TournamentStandings: React.FC = () => {
  const [tournamentData, setTournamentData] = useState<TournamentTable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTournamentStandings();
        setTournamentData(data);
      } catch (err) {
        console.error("Failed to fetch standings:", err);
        setError("Could not load tournament standings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStandings();
  }, []);

  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (position <= 3) return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
    if (position <= 6) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return Crown;
    if (position === 2) return Medal;
    if (position === 3) return Award;
    return Trophy;
  };

  const getFormIndicator = (team: TeamStanding) => {
    if (team.matches_played === 0) return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/20' };
    const winRate = (team.wins / team.matches_played) * 100;
    if (winRate >= 60) return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (winRate >= 40) return { icon: Minus, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
  }

  const standings = tournamentData?.standings ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading tournament standings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-lg">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">An Error Occurred</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tournament Standings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {tournamentData ? `Last updated: ${formatDate(tournamentData.last_updated)}` : 'Current championship table'}
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {standings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {standings.slice(0, 3).map((team, index) => {
            const PositionIcon = getPositionIcon(team.position);
            return (
              <div
                key={team.team_id}
                className={`relative overflow-hidden rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 ${
                  index === 0 ? 'md:order-2 md:scale-110' : index === 1 ? 'md:order-1' : 'md:order-3'
                }`}
              >
                <div className={`absolute inset-0 ${
                  team.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  team.position === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                  'bg-gradient-to-br from-orange-400 to-orange-600'
                }`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4"><PositionIcon className="w-8 h-8" /><span className="text-2xl font-bold">#{team.position}</span></div>
                  <h3 className="text-xl font-bold mb-2">{team.team_name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Points</span><span className="font-bold">{team.points}</span></div>
                    <div className="flex justify-between"><span>Goal Diff</span><span className="font-bold">{team.goal_difference > 0 ? '+' : ''}{team.goal_difference}</span></div>
                    <div className="flex justify-between"><span>Wins</span><span className="font-bold">{team.wins}/{team.matches_played}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Standings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Complete Standings</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" title="Played">P</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" title="Wins">W</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" title="Draws">D</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" title="Losses">L</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" title="Goals For">GF</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" title="Goals Against">GA</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" title="Goal Difference">GD</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" title="Points">Pts</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {standings.map((team) => {
                const PositionIcon = getPositionIcon(team.position);
                const form = getFormIndicator(team);
                const FormIcon = form.icon;
                return (
                  <tr key={team.team_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(team.position)}`}>{team.position}</div><PositionIcon className="w-5 h-5 text-gray-400" /></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900 dark:text-white">{team.team_name}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">{team.matches_played}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 dark:text-green-400 font-medium">{team.wins}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-600 dark:text-yellow-400 font-medium">{team.draws}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 dark:text-red-400 font-medium">{team.losses}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">{team.goals_scored}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">{team.goals_conceded}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"><span className={team.goal_difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{team.goal_difference >= 0 ? '+' : ''}{team.goal_difference}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900 dark:text-white">{team.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center"><div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${form.bg}`}><FormIcon className={`w-4 h-4 ${form.color}`} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {standings.length === 0 && (
            <div className="text-center py-12 text-gray-500">No standings to display yet. The season may not have started.</div>
        )}
      </div>
    </div>
  );
};

export default TournamentStandings;