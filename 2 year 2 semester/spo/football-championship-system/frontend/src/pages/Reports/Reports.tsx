import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, Trophy, TrendingUp, FileText, PieChart } from 'lucide-react';
import Button from '@/components/common/Button';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('month');

  const reportTypes = [
    { id: 'overview', name: 'Season Overview', icon: BarChart3, description: 'Complete season statistics and performance metrics' },
    { id: 'teams', name: 'Team Performance', icon: Users, description: 'Detailed analysis of team statistics and rankings' },
    { id: 'matches', name: 'Match Analytics', icon: Trophy, description: 'Match results, attendance, and revenue data' },
    { id: 'financial', name: 'Financial Report', icon: TrendingUp, description: 'Revenue, expenses, and profit analysis' },
    { id: 'attendance', name: 'Attendance Report', icon: PieChart, description: 'Stadium utilization and fan engagement metrics' }
  ];

  const mockData = {
    overview: {
      totalMatches: 120,
      completedMatches: 85,
      totalGoals: 245,
      averageAttendance: 45678,
      totalRevenue: 2450000,
      topScorer: 'Lionel Messi (18 goals)'
    },
    teams: {
      bestAttack: 'Real Madrid (35 goals)',
      bestDefense: 'Real Madrid (8 goals conceded)',
      mostWins: 'Real Madrid (12 wins)',
      fairPlayWinner: 'Barcelona FC (2 yellow cards)'
    },
    matches: {
      highestScoring: 'Barcelona 4-3 Real Madrid',
      lowestScoring: 'Chelsea 0-0 Arsenal',
      highestAttendance: '99,354 (Camp Nou)',
      averageGoalsPerMatch: 2.88
    }
  };

  const generateReport = () => {
    // Mock report generation
    console.log(`Generating ${selectedReport} report for ${dateRange} period`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate comprehensive reports and analyze championship data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="season">Full Season</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button
            variant="primary"
            icon={Download}
            onClick={generateReport}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedReport === report.id
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedReport === report.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{report.name}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Metrics</h2>
          
          {selectedReport === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Matches</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{mockData.overview.totalMatches}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 dark:text-green-400">+8 this week</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{mockData.overview.averageAttendance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 dark:text-green-400">+5.2%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">${mockData.overview.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 dark:text-green-400">+12.8%</p>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'teams' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Attack</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{mockData.teams.bestAttack}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Defense</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{mockData.teams.bestDefense}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Wins</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{mockData.teams.mostWins}</p>
              </div>
            </div>
          )}

          {selectedReport === 'matches' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Highest Scoring</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{mockData.matches.highestScoring}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Highest Attendance</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{mockData.matches.highestAttendance}</p>
              </div>
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Goals Per Match</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{mockData.matches.averageGoalsPerMatch}</p>
              </div>
            </div>
          )}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Data Visualization</h2>
          
          <div className="h-64 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Chart
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Interactive chart will be displayed here
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">85%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Completion</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">+12%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Growth</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.8M</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Available Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Season Summary</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Complete season overview with all key statistics</p>
            <Button variant="outline" size="sm" className="w-full">
              Generate
            </Button>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-6 h-6 text-green-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Player Stats</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Individual player performance and rankings</p>
            <Button variant="outline" size="sm" className="w-full">
              Generate
            </Button>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Financial Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Revenue, costs, and profitability breakdown</p>
            <Button variant="outline" size="sm" className="w-full">
              Generate
            </Button>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer">
            
            <div className="flex items-center space-x-3 mb-3">
              <Calendar className="w-6 h-6 text-orange-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Match Schedule</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Upcoming fixtures and scheduling analysis</p>
            <Button variant="outline" size="sm" className="w-full">
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;