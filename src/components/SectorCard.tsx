import React from 'react';
import { TrendingUp, TrendingDown, Minus, Factory } from 'lucide-react';
import { SectorResult } from '../types';

interface SectorCardProps {
  result: SectorResult;
  isCompact?: boolean;
}

export const SectorCard: React.FC<SectorCardProps> = ({ result, isCompact = false }) => {
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Seller': return 'text-green-600 bg-green-50';
      case 'Buyer': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Seller': return TrendingUp;
      case 'Buyer': return TrendingDown;
      default: return Minus;
    }
  };

  const PositionIcon = getPositionIcon(result.net_position);
  const intensityReduction = ((result.baseline_intensity - result.new_intensity) / result.baseline_intensity) * 100;
  const productionChange = ((result.adjusted_production - result.baseline_production) / result.baseline_production) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Factory className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{result.sector}</h3>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(result.net_position)}`}>
              <PositionIcon className="h-3 w-3" />
              <span>{result.net_position}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Emissions Intensity</p>
          <p className="text-sm font-medium">
            {result.new_intensity.toFixed(3)} tCO₂/unit
          </p>
          <p className="text-xs text-gray-600">
            {intensityReduction > 0 ? '↓' : '↑'} {Math.abs(intensityReduction).toFixed(1)}%
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Production</p>
          <p className="text-sm font-medium">
            {result.adjusted_production.toFixed(1)} units
          </p>
          <p className="text-xs text-gray-600">
            {productionChange > 0 ? '↑' : '↓'} {Math.abs(productionChange).toFixed(1)}%
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">CCC Balance</p>
          <p className={`text-sm font-medium ${result.ccc_balance > 0 ? 'text-green-600' : result.ccc_balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {result.ccc_balance > 0 ? '+' : ''}{result.ccc_balance.toFixed(2)} Mt
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Profit Impact</p>
          <p className={`text-sm font-medium ${result.profit_change > 0 ? 'text-green-600' : result.profit_change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {result.profit_change > 0 ? '+' : ''}₹{result.profit_change.toFixed(1)}M
          </p>
        </div>
      </div>

      {!isCompact && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Emissions Reduced: {result.emissions_reduced.toFixed(2)} Mt CO₂</div>
            <div>Total Profit: ₹{result.total_profit.toFixed(1)}M</div>
          </div>
        </div>
      )}
    </div>
  );
};