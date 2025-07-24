// frontend/src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Trophy, Activity } from 'lucide-react'; // ИЗМЕНЕНО: 'MapPin' удален
import { getGeneralStatistics } from '@/services/reports';
import { getUpcomingMatches } from '@/services/matches';
import { GeneralStatistics } from '@/types/report';
import { MatchWithDetails } from '@/types/match';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ComponentType<any>; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p><p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p></div>
            <div className={`p-3 rounded-xl ${color}`}><Icon className="w-6 h-6 text-white" /></div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<GeneralStatistics | null>(null);
    const [recentMatches, setRecentMatches] = useState<MatchWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, matchesData] = await Promise.all([
                    getGeneralStatistics(),
                    getUpcomingMatches(3)
                ]);
                setStats(statsData);
                setRecentMatches(matchesData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-96"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    const completedMatches = stats?.finished_matches ?? 0;
    const totalMatches = stats?.total_matches ?? 0;
    const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's an overview of the championship.</p></div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl"><Activity className="w-4 h-4 text-green-600 dark:text-green-400" /><span className="text-sm font-medium text-green-700 dark:text-green-300">System Online</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Teams" value={stats?.total_teams ?? 'N/A'} icon={Users} color="bg-gradient-to-r from-blue-500 to-cyan-500" />
                <StatCard title="Total Goals" value={stats?.total_goals ?? 'N/A'} icon={Trophy} color="bg-gradient-to-r from-green-500 to-emerald-500" />
                <StatCard title="Avg Goals/Match" value={stats?.average_goals_per_match?.toFixed(2) ?? 'N/A'} icon={UserCheck} color="bg-gradient-to-r from-purple-500 to-pink-500" />
                <StatCard title="Finished Matches" value={completedMatches} icon={Calendar} color="bg-gradient-to-r from-orange-500 to-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Season Progress</h2>
                    <div>
                        <div className="flex justify-between text-sm mb-2"><span className="text-gray-600 dark:text-gray-400">Completed Matches</span><span className="text-gray-900 dark:text-white font-medium">{completedMatches} / {totalMatches}</span></div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3"><div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full" style={{ width: `${progress}%` }}></div></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress.toFixed(0)}% complete</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Matches</h2>
                    <div className="space-y-4">
                        {recentMatches.map((match) => (
                            <div key={match.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2"><div className="text-sm font-medium text-gray-900 dark:text-white">{match.home_team.name} vs {match.away_team.name}</div><span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">Upcoming</span></div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(match.date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;