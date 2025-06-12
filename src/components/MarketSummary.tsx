import React from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import { SimulationResults } from '../types';

interface MarketSummaryProps {
  results: SimulationResults;
  showEquilibriumInfo?: boolean;
}

export const MarketSummary: React.FC<MarketSummaryProps> = ({ results, showEquilibriumInfo = false }) => {
  const totalProfitChange = results.sectors.reduce((sum, sector) => sum + sector.profit_change, 0);
  const buyerCount = results.sectors.filter(s => s.net_position === 'Buyer').length;
  const sellerCount = results.sectors.filter(s => s.net_position === 'Seller').length;
  const neutralCount = results.sectors.filter(s => s.net_position === 'Neutral').length;

  const summaryCards = [
    {
      title: 'Carbon Price',
      value: `₹${results.carbon_price.toFixed(2)}`,
      subtitle: 'per tCO₂',
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Emissions Reduced',
      value: `${results.total_emissions_reduced.toFixed(2)}`,
      subtitle: 'Mt CO₂',
      icon: TrendingDown,
      color: 'green'
    },
    {
      title: 'Market Balance',
      value: `${results.total_ccc_supply.toFixed(2)}`,
      subtitle: 'Mt CO₂ surplus',
      icon: Target,
      color: results.total_ccc_supply > 0 ? 'green' : results.total_ccc_supply < 0 ? 'red' : 'gray'
    },
    {
      title: 'Total Profit Impact',
      value: `₹${totalProfitChange.toFixed(1)}M`,
      subtitle: 'across all sectors',
      icon: TrendingUp,
      color: totalProfitChange > 0 ? 'green' : totalProfitChange < 0 ? 'red' : 'gray'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      red: 'text-red-600 bg-red-50',
      gray: 'text-gray-600 bg-gray-50'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getColorClasses(card.color)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">{card.title}</p>
                  <p className="text-lg font-semibold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-600">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Participants</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{buyerCount}</div>
            <div className="text-sm text-gray-600">Credit Buyers</div>
            <div className="text-xs text-gray-500">Need to purchase credits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{sellerCount}</div>
            <div className="text-sm text-gray-600">Credit Sellers</div>
            <div className="text-xs text-gray-500">Have surplus to sell</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{neutralCount}</div>
            <div className="text-sm text-gray-600">Neutral</div>
            <div className="text-xs text-gray-500">Balanced position</div>
          </div>
        </div>
      </div>

      {showEquilibriumInfo && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Equilibrium Status</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              results.equilibrium_found 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {results.equilibrium_found ? 'Equilibrium Found' : 'Approximate Solution'}
            </div>
          </div>
          {results.iterations !== undefined && (
            <p className="text-gray-600 mt-2">
              Converged in {results.iterations} iterations
            </p>
          )}
        </div>
      )}
    </div>
  );
};