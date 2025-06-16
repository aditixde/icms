import React, { useState, useEffect } from 'react';
import { Grid3X3, TrendingUp, TrendingDown, ArrowUpDown, ArrowLeftRight } from 'lucide-react';
import { CarbonMarketSimulator } from '../utils/carbonSimulator';
import { SECTORAL_DATA, COST_DATA } from '../data/constants';

interface StrategyResult {
  scenario: string;
  icon: React.ReactNode;
  adjustedOutput: number;
  adjustedIntensity: number;
  cccBalance: number;
  netPosition: 'Buyer' | 'Seller' | 'Neutral';
  emissionsReduced: number;
  profitChange: number;
  totalProfit: number;
}

interface SectorStrategyResults {
  [sectorName: string]: StrategyResult[];
}

export const StrategyMatrix: React.FC = () => {
  // Four separate sliders for each quadrant
  const [topLeftOutput, setTopLeftOutput] = useState(-0.1); // ↓ Output, ↓ Intensity
  const [topLeftIntensity, setTopLeftIntensity] = useState(-0.1);
  
  const [topRightOutput, setTopRightOutput] = useState(0.1); // ↑ Output, ↓ Intensity
  const [topRightIntensity, setTopRightIntensity] = useState(-0.1);
  
  const [bottomLeftOutput, setBottomLeftOutput] = useState(-0.1); // ↓ Output, ↑ Intensity
  const [bottomLeftIntensity, setBottomLeftIntensity] = useState(0.1);
  
  const [bottomRightOutput, setBottomRightOutput] = useState(0.1); // ↑ Output, ↑ Intensity
  const [bottomRightIntensity, setBottomRightIntensity] = useState(0.1);

  const [carbonPrice, setCarbonPrice] = useState(50);
  const [selectedSector, setSelectedSector] = useState('Steel');
  const [results, setResults] = useState<SectorStrategyResults>({});
  const [isLoading, setIsLoading] = useState(false);

  const runStrategyAnalysis = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newResults: SectorStrategyResults = {};
      
      Object.keys(SECTORAL_DATA).forEach(sectorName => {
        const sectorData = SECTORAL_DATA[sectorName];
        const costData = COST_DATA[sectorName];
        
        // Define the four strategic scenarios with individual slider values
        const scenarios = [
          { 
            name: '↓ Output, ↓ Intensity', 
            outputFactor: topLeftOutput, 
            intensityFactor: topLeftIntensity, 
            icon: <TrendingDown className="h-4 w-4 text-green-600" />,
            bgColor: 'bg-green-50 border-green-200'
          },
          { 
            name: '↑ Output, ↓ Intensity', 
            outputFactor: topRightOutput, 
            intensityFactor: topRightIntensity, 
            icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
            bgColor: 'bg-blue-50 border-blue-200'
          },
          { 
            name: '↓ Output, ↑ Intensity', 
            outputFactor: bottomLeftOutput, 
            intensityFactor: bottomLeftIntensity, 
            icon: <TrendingDown className="h-4 w-4 text-red-600" />,
            bgColor: 'bg-red-50 border-red-200'
          },
          { 
            name: '↑ Output, ↑ Intensity', 
            outputFactor: bottomRightOutput, 
            intensityFactor: bottomRightIntensity, 
            icon: <TrendingUp className="h-4 w-4 text-orange-600" />,
            bgColor: 'bg-orange-50 border-orange-200'
          }
        ];
        
        const sectorResults: StrategyResult[] = scenarios.map(scenario => {
          // Apply strategic adjustments
          const adjustedOutput = Math.max(0, sectorData.production * (1 + scenario.outputFactor));
          const adjustedIntensity = Math.max(0, sectorData.intensity * (1 + scenario.intensityFactor));
          
          // Calculate CCC balance
          const cccBalance = (sectorData.target - adjustedIntensity) * adjustedOutput;
          
          // Calculate emissions reduced
          const emissionsReduced = (sectorData.intensity - adjustedIntensity) * adjustedOutput;
          
          // Calculate profit
          const revenue = adjustedOutput * costData.price;
          const variableCost = adjustedOutput * costData.variable_cost;
          const cccCost = Math.max(0, -cccBalance) * carbonPrice;
          const cccRevenue = Math.max(0, cccBalance) * carbonPrice;
          
          const profit = revenue - variableCost - costData.fixed_cost - cccCost + cccRevenue;
          const baselineProfit = (sectorData.production * costData.price) - (sectorData.production * costData.variable_cost) - costData.fixed_cost;
          const profitChange = profit - baselineProfit;
          
          // Determine net position
          let netPosition: 'Buyer' | 'Seller' | 'Neutral' = 'Neutral';
          if (cccBalance > 1) netPosition = 'Seller';
          else if (cccBalance < -1) netPosition = 'Buyer';
          
          return {
            scenario: scenario.name,
            icon: scenario.icon,
            adjustedOutput,
            adjustedIntensity,
            cccBalance,
            netPosition,
            emissionsReduced,
            profitChange: profitChange / 1000000, // Convert to millions
            totalProfit: profit / 1000000
          };
        });
        
        newResults[sectorName] = sectorResults;
      });
      
      setResults(newResults);
    } catch (error) {
      console.error('Strategy analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runStrategyAnalysis();
  }, [topLeftOutput, topLeftIntensity, topRightOutput, topRightIntensity, 
      bottomLeftOutput, bottomLeftIntensity, bottomRightOutput, bottomRightIntensity, carbonPrice]);

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Seller': return 'text-green-600 bg-green-50 border-green-200';
      case 'Buyer': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const selectedSectorResults = results[selectedSector] || [];

  const SliderControl = ({ 
    label, 
    value, 
    onChange, 
    color = 'blue',
    type = 'output' 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    color?: string;
    type?: 'output' | 'intensity';
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600'
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">{label}</label>
          <span className="text-xs text-gray-600">{(value * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="-0.2"
          max="0.2"
          step="0.01"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: value >= 0 
              ? `linear-gradient(to right, #E5E7EB 0%, #E5E7EB 50%, var(--tw-gradient-from) 50%, var(--tw-gradient-to) 100%)`
              : `linear-gradient(to right, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 50%, #E5E7EB 50%, #E5E7EB 100%)`,
            '--tw-gradient-from': value >= 0 ? '#10B981' : '#EF4444',
            '--tw-gradient-to': value >= 0 ? '#059669' : '#DC2626'
          } as React.CSSProperties}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>-20%</span>
          <span>+20%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Grid3X3 className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Strategy Matrix</h2>
              <p className="text-sm text-gray-600">Analyze strategic decisions with individual control over each quadrant</p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Carbon Price */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Carbon Price: ₹{carbonPrice}/tCO₂
            </label>
            <div className="px-3">
              <input
                type="range"
                min="10"
                max="200"
                value={carbonPrice}
                onChange={(e) => setCarbonPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(carbonPrice/200)*100}%, #E5E7EB ${(carbonPrice/200)*100}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹10</span>
                <span>₹200</span>
              </div>
            </div>
          </div>

          {/* Sector Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select Sector for Analysis</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {Object.keys(SECTORAL_DATA).map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Four Quadrant Sliders */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Strategic Control Panel</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Top Left: ↓ Output, ↓ Intensity */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">↓ Output, ↓ Intensity</h4>
              </div>
              <div className="space-y-4">
                <SliderControl
                  label="Output Reduction"
                  value={topLeftOutput}
                  onChange={setTopLeftOutput}
                  color="green"
                  type="output"
                />
                <SliderControl
                  label="Intensity Reduction"
                  value={topLeftIntensity}
                  onChange={setTopLeftIntensity}
                  color="green"
                  type="intensity"
                />
              </div>
            </div>

            {/* Top Right: ↑ Output, ↓ Intensity */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">↑ Output, ↓ Intensity</h4>
              </div>
              <div className="space-y-4">
                <SliderControl
                  label="Output Increase"
                  value={topRightOutput}
                  onChange={setTopRightOutput}
                  color="blue"
                  type="output"
                />
                <SliderControl
                  label="Intensity Reduction"
                  value={topRightIntensity}
                  onChange={setTopRightIntensity}
                  color="blue"
                  type="intensity"
                />
              </div>
            </div>

            {/* Bottom Left: ↓ Output, ↑ Intensity */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-red-900">↓ Output, ↑ Intensity</h4>
              </div>
              <div className="space-y-4">
                <SliderControl
                  label="Output Reduction"
                  value={bottomLeftOutput}
                  onChange={setBottomLeftOutput}
                  color="red"
                  type="output"
                />
                <SliderControl
                  label="Intensity Increase"
                  value={bottomLeftIntensity}
                  onChange={setBottomLeftIntensity}
                  color="red"
                  type="intensity"
                />
              </div>
            </div>

            {/* Bottom Right: ↑ Output, ↑ Intensity */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">↑ Output, ↑ Intensity</h4>
              </div>
              <div className="space-y-4">
                <SliderControl
                  label="Output Increase"
                  value={bottomRightOutput}
                  onChange={setBottomRightOutput}
                  color="orange"
                  type="output"
                />
                <SliderControl
                  label="Intensity Increase"
                  value={bottomRightIntensity}
                  onChange={setBottomRightIntensity}
                  color="orange"
                  type="intensity"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Matrix Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Strategies...</h3>
            <p className="text-gray-600">Computing strategic scenarios for {selectedSector}</p>
          </div>
        ) : selectedSectorResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Grid3X3 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Strategy Data Available</h3>
            <p className="text-gray-600">Strategy analysis is being computed for {selectedSector}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Matrix Header */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Strategic Analysis Results for {selectedSector}
              </h3>
              <p className="text-sm text-gray-600">
                2×2 Matrix showing outcomes for different output and intensity strategies
              </p>
            </div>

            {/* 2x2 Results Grid */}
            <div className="grid grid-cols-2 gap-6">
              {selectedSectorResults.map((result, index) => {
                const bgColors = [
                  'bg-green-50 border-green-200',
                  'bg-blue-50 border-blue-200', 
                  'bg-red-50 border-red-200',
                  'bg-orange-50 border-orange-200'
                ];
                
                return (
                  <div key={index} className={`${bgColors[index]} border-2 rounded-lg p-6 hover:shadow-lg transition-shadow`}>
                    {/* Scenario Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {result.icon}
                        <h4 className="font-semibold text-gray-900">{result.scenario}</h4>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPositionColor(result.netPosition)}`}>
                        {result.netPosition}
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Adjusted Output</p>
                        <p className="text-sm font-medium">{result.adjustedOutput.toFixed(1)} units</p>
                        <p className="text-xs text-gray-600">
                          {((result.adjustedOutput / SECTORAL_DATA[selectedSector].production - 1) * 100).toFixed(1)}% change
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Adjusted Intensity</p>
                        <p className="text-sm font-medium">{result.adjustedIntensity.toFixed(3)} tCO₂/unit</p>
                        <p className="text-xs text-gray-600">
                          {((result.adjustedIntensity / SECTORAL_DATA[selectedSector].intensity - 1) * 100).toFixed(1)}% change
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">CCC Balance</p>
                        <p className={`text-sm font-medium ${result.cccBalance > 0 ? 'text-green-600' : result.cccBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {result.cccBalance > 0 ? '+' : ''}{result.cccBalance.toFixed(2)} Mt
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Emissions Reduced</p>
                        <p className="text-sm font-medium">{result.emissionsReduced.toFixed(2)} Mt</p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Profit Change</p>
                        <p className={`text-lg font-bold ${result.profitChange > 0 ? 'text-green-600' : result.profitChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {result.profitChange > 0 ? '+' : ''}₹{result.profitChange.toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strategy Insights */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-purple-900 mb-4">Strategic Insights for {selectedSector}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-purple-800 mb-2">Optimal Strategy</h5>
                  {(() => {
                    if (selectedSectorResults.length === 0) {
                      return (
                        <div className="text-sm text-purple-700">
                          <p>No strategy data available</p>
                        </div>
                      );
                    }
                    const bestStrategy = selectedSectorResults.reduce((best, current) => 
                      current.profitChange > best.profitChange ? current : best
                    );
                    return (
                      <div className="text-sm text-purple-700">
                        <div className="flex items-center space-x-2 mb-1">
                          {bestStrategy.icon}
                          <span className="font-medium">{bestStrategy.scenario}</span>
                        </div>
                        <p>Profit change: ₹{bestStrategy.profitChange.toFixed(1)}M</p>
                        <p>Position: {bestStrategy.netPosition}</p>
                      </div>
                    );
                  })()}
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-purple-800 mb-2">Environmental Impact</h5>
                  <div className="text-sm text-purple-700">
                    {selectedSectorResults.length === 0 ? (
                      <p>No environmental data available</p>
                    ) : (
                      <>
                        <p>
                          Total emissions reduction range: {Math.min(...selectedSectorResults.map(r => r.emissionsReduced)).toFixed(1)} - {Math.max(...selectedSectorResults.map(r => r.emissionsReduced)).toFixed(1)} Mt CO₂
                        </p>
                        <p>
                          Best environmental strategy: {selectedSectorResults.reduce((best, current) => 
                            current.emissionsReduced > best.emissionsReduced ? current : best
                          ).scenario}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Comparison Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">Strategy Comparison Summary</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensity Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CCC Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Impact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emissions Reduced</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedSectorResults.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {result.icon}
                            <span className="text-sm font-medium text-gray-900">{result.scenario}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {((result.adjustedOutput / SECTORAL_DATA[selectedSector].production - 1) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {((result.adjustedIntensity / SECTORAL_DATA[selectedSector].intensity - 1) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(result.netPosition)}`}>
                            {result.netPosition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${result.profitChange > 0 ? 'text-green-600' : result.profitChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {result.profitChange > 0 ? '+' : ''}₹{result.profitChange.toFixed(1)}M
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.emissionsReduced.toFixed(2)} Mt
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
