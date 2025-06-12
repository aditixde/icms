import React, { useRef, useEffect } from 'react';
import { SimulationResults } from '../types';

interface SectorPositionChartProps {
  results: SimulationResults;
}

export const SectorPositionChart: React.FC<SectorPositionChartProps> = ({ results }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !results) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Prepare data
    const sectors = results.sectors.map(s => ({
      name: s.sector,
      balance: s.ccc_balance,
      position: s.net_position
    }));

    // Sort sectors by CCC balance for better visualization
    sectors.sort((a, b) => b.balance - a.balance);

    const maxAbsBalance = Math.max(...sectors.map(s => Math.abs(s.balance)));
    const barWidth = chartWidth / sectors.length * 0.8;
    const barSpacing = chartWidth / sectors.length * 0.2;

    // Draw axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis (zero line)
    const zeroY = padding + chartHeight / 2;
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, zeroY);
    ctx.lineTo(width - padding, zeroY);
    ctx.stroke();

    // Draw bars
    sectors.forEach((sector, index) => {
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = Math.abs(sector.balance) / maxAbsBalance * (chartHeight / 2 - 10);
      
      // Determine bar color based on position
      let barColor = '#6B7280'; // gray for neutral
      if (sector.position === 'Seller') barColor = '#10B981'; // green
      else if (sector.position === 'Buyer') barColor = '#EF4444'; // red

      ctx.fillStyle = barColor;
      
      if (sector.balance >= 0) {
        // Positive balance (surplus) - bar goes up
        ctx.fillRect(x, zeroY - barHeight, barWidth, barHeight);
      } else {
        // Negative balance (deficit) - bar goes down
        ctx.fillRect(x, zeroY, barWidth, barHeight);
      }

      // Add value labels on bars
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      
      const labelY = sector.balance >= 0 ? zeroY - barHeight - 5 : zeroY + barHeight + 15;
      ctx.fillText(sector.balance.toFixed(1), x + barWidth / 2, labelY);

      // Add sector names (rotated)
      ctx.save();
      ctx.translate(x + barWidth / 2, height - padding + 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#374151';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(sector.name, 0, 0);
      ctx.restore();
    });

    // Add Y-axis labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    
    // Positive side (surplus)
    for (let i = 1; i <= 4; i++) {
      const value = (maxAbsBalance / 4) * i;
      const y = zeroY - (chartHeight / 2 - 10) * (i / 4);
      ctx.fillText(`+${value.toFixed(1)}`, padding - 10, y + 3);
    }
    
    // Negative side (deficit)
    for (let i = 1; i <= 4; i++) {
      const value = (maxAbsBalance / 4) * i;
      const y = zeroY + (chartHeight / 2 - 10) * (i / 4);
      ctx.fillText(`-${value.toFixed(1)}`, padding - 10, y + 3);
    }

    // Add axis labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CCC Balance (Mt CO₂)', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Surplus ← → Deficit', 0, 0);
    ctx.restore();

    // Add title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sector Positions in Carbon Credit Market', width / 2, 25);

  }, [results]);

  if (!results) return null;

  const buyerCount = results.sectors.filter(s => s.net_position === 'Buyer').length;
  const sellerCount = results.sectors.filter(s => s.net_position === 'Seller').length;
  const neutralCount = results.sectors.filter(s => s.net_position === 'Neutral').length;

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="w-full border border-gray-200 rounded-lg"
        style={{ width: '100%', height: '400px' }}
      />
      
      {/* Legend and Summary */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-700">Sellers ({sellerCount})</span>
            <span className="text-gray-500">- Have surplus credits</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-700">Buyers ({buyerCount})</span>
            <span className="text-gray-500">- Need to buy credits</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-gray-700">Neutral ({neutralCount})</span>
            <span className="text-gray-500">- Balanced position</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <strong>Market Balance:</strong> {results.total_ccc_supply.toFixed(2)} Mt CO₂
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            Math.abs(results.total_ccc_supply) < 0.1 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {Math.abs(results.total_ccc_supply) < 0.1 ? 'Balanced' : 'Imbalanced'}
          </span>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Market Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-blue-700 font-medium">Supply Side</div>
            <div className="text-blue-600">
              {sellerCount} sectors generating {results.sectors
                .filter(s => s.ccc_balance > 0)
                .reduce((sum, s) => sum + s.ccc_balance, 0)
                .toFixed(1)} Mt surplus
            </div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Demand Side</div>
            <div className="text-blue-600">
              {buyerCount} sectors needing {Math.abs(results.sectors
                .filter(s => s.ccc_balance < 0)
                .reduce((sum, s) => sum + s.ccc_balance, 0)
              ).toFixed(1)} Mt credits
            </div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Price Impact</div>
            <div className="text-blue-600">
              ₹{results.carbon_price.toFixed(2)}/tCO₂ equilibrium price
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};