import React, { useRef, useEffect } from 'react';

interface ConvergenceData {
  iteration: number;
  price: number;
  balance: number;
}

interface ConvergenceChartProps {
  data: ConvergenceData[];
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find data ranges
    const maxIteration = Math.max(...data.map(d => d.iteration));
    const minPrice = Math.min(...data.map(d => d.price));
    const maxPrice = Math.max(...data.map(d => d.price));
    const minBalance = Math.min(...data.map(d => d.balance));
    const maxBalance = Math.max(...data.map(d => d.balance));

    // Chart dimensions
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Draw axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw price line
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + (point.iteration / maxIteration) * chartWidth;
      const y = height - padding - ((point.price - minPrice) / (maxPrice - minPrice)) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw balance line (scaled to fit)
    if (maxBalance !== minBalance) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + (point.iteration / maxIteration) * chartWidth;
        const y = height - padding - ((point.balance - minBalance) / (maxBalance - minBalance)) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw zero line for balance
    if (minBalance <= 0 && maxBalance >= 0) {
      const zeroY = height - padding - ((0 - minBalance) / (maxBalance - minBalance)) * chartHeight;
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padding, zeroY);
      ctx.lineTo(width - padding, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Add labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Iteration', width / 2 - 20, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Price (Rs/tCO₂)', -30, 0);
    ctx.restore();

    // Add final values
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Final Price: ₹${lastPoint.price.toFixed(2)}`, width - padding, padding + 20);
      ctx.fillText(`Balance: ${lastPoint.balance.toFixed(4)}`, width - padding, padding + 40);
    }

  }, [data]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-64 border border-gray-200 rounded-lg"
        style={{ width: '100%', height: '256px' }}
      />
      <div className="flex justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-blue-600"></div>
          <span className="text-gray-600">Carbon Price</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-green-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #10B981 0, #10B981 3px, transparent 3px, transparent 6px)' }}></div>
          <span className="text-gray-600">Market Balance</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-red-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #EF4444 0, #EF4444 2px, transparent 2px, transparent 4px)' }}></div>
          <span className="text-gray-600">Zero Line</span>
        </div>
      </div>
    </div>
  );
};