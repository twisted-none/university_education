import React, { useState, useEffect } from 'react';
import { Calculator, Ticket, Users, MapPin, Trophy, DollarSign, AlertTriangle } from 'lucide-react';
import { MatchWithDetails } from '@/types/match';
import { TicketCalculationResponse, TicketCategory } from '@/types/ticket';
import { getUpcomingMatches } from '@/services/matches';
import { calculateAllCategoriesForMatch } from '@/services/tickets';

const TicketCalculator: React.FC = () => {
  const [upcomingMatches, setUpcomingMatches] = useState<MatchWithDetails[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [ticketPrices, setTicketPrices] = useState<Record<string, TicketCalculationResponse> | null>(null);
  
  const [isMatchesLoading, setIsMatchesLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsMatchesLoading(true);
        setError(null);
        const matches = await getUpcomingMatches(10); // Загружаем 10 ближайших матчей
        setUpcomingMatches(matches);
      } catch (err) {
        console.error("Failed to fetch upcoming matches:", err);
        setError("Could not load matches. Please try again.");
      } finally {
        setIsMatchesLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleMatchSelect = async (match: MatchWithDetails) => {
    setSelectedMatchId(match.id);
    setTicketPrices(null);
    setIsCalculating(true);
    setError(null);
    try {
      const prices = await calculateAllCategoriesForMatch(
        match.home_team_id,
        match.away_team_id,
        match.stadium_id
      );
      setTicketPrices(prices);
    } catch (err) {
      console.error("Failed to calculate ticket prices:", err);
      setError("Could not calculate prices for this match.");
    } finally {
      setIsCalculating(false);
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vip': return 'from-yellow-500 to-orange-600';
      case 'standard': return 'from-blue-500 to-cyan-600';
      case 'economy': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vip': return Trophy;
      case 'standard': return Ticket;
      case 'economy': return Users;
      default: return Ticket;
    }
  };

  const selectedMatchData = upcomingMatches.find(m => m.id === selectedMatchId);
  const priceCategories: TicketCategory[] = ['VIP', 'Standard', 'Economy'];
  const calculationDetails = ticketPrices ? Object.values(ticketPrices)[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket Price Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Calculate ticket prices for upcoming matches based on team rankings and stadium capacity.
          </p>
        </div>
      </div>

      {/* Match Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select an Upcoming Match</h2>
        {isMatchesLoading ? (
            <div className="text-center py-8 text-gray-500">Loading upcoming matches...</div>
        ) : error && upcomingMatches.length === 0 ? (
            <div className="text-center py-8 text-red-500 flex items-center justify-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => handleMatchSelect(match)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedMatchId === match.id
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {match.home_team.name} vs {match.away_team.name}
                  </div>
                  <div className="flex space-x-1">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded">
                      #{match.home_team.last_season_place}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded">
                      #{match.away_team.last_season_place}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{match.stadium.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Calculation Details & Results */}
      {selectedMatchData && (isCalculating || ticketPrices) && (
        <>
        {/* Pricing Algorithm Explanation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pricing Calculation Breakdown</h2>
          {isCalculating ? (
            <div className="text-center py-8 text-gray-500">Analyzing match data...</div>
          ) : calculationDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3"><MapPin className="w-6 h-6 text-white" /></div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Base Price</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Based on {selectedMatchData.stadium.name} ({selectedMatchData.stadium.capacity.toLocaleString()} seats)</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${calculationDetails.base_price.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3"><Trophy className="w-6 h-6 text-white" /></div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Prestige Factor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Team Ranks: #{selectedMatchData.home_team.last_season_place} vs #{selectedMatchData.away_team.last_season_place}</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{calculationDetails.prestige_coefficient.toFixed(2)}x</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3"><DollarSign className="w-6 h-6 text-white" /></div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Category Multiplier</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Final price varies by ticket category</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">Applied Below</p>
                </div>
            </div>
          )}
        </div>

        {/* Ticket Prices */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Calculated Ticket Prices</h2>
          {isCalculating ? (
            <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div><span className="ml-3 text-gray-600 dark:text-gray-400">Calculating prices...</span></div>
          ) : ticketPrices && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {priceCategories.map((category) => {
                const ticket = ticketPrices[category];
                if (!ticket) return null;
                const Icon = getCategoryIcon(category);
                return (
                  <div key={category} className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${getCategoryColor(category)}`}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4"><Icon className="w-8 h-8" /><span className="text-sm opacity-80">{ticket.category_multiplier}x multiplier</span></div>
                      <h3 className="text-xl font-bold mb-2 capitalize">{ticket.category} Ticket</h3>
                      <div className="text-4xl font-bold mb-4">${ticket.price.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </>
      )}

      {!selectedMatchId && !isMatchesLoading && (
        <div className="text-center py-12"><Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Match</h3><p className="text-gray-500 dark:text-gray-400">Choose a match above to calculate ticket prices.</p></div>
      )}
    </div>
  );
};

export default TicketCalculator;