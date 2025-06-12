import React, { useState, useEffect } from 'react';
import { Target, Play, AlertCircle, Edit3, RotateCcw, Settings, BarChart3 } from 'lucide-react';
import { CarbonMarketSimulator } from '../utils/carbonSimulator';
import { SimulationResults } from '../types';
import { SectorCard } from './SectorCard';
import { MarketSummary } from './MarketSummary';
import { SectorPositionChart } from './SectorPositionChart';
import { SECTORAL_DATA, COST_DATA, ELASTICITY_MAP } from '../data/constants';

interface EquilibriumFinderProps {
  onResultsChange: (results: SimulationResults) => void;
}

export const EquilibriumFinder: React.FC<EquilibriumFinderProps> = ({ onResultsChange }) => {
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Price bounds
  const [pMin, setPMin] = useState(0);
  const [pMax, setPMax] = useState(200);
  
  // Editable data states
  const [sectoralData, setSectoralData] = useState(SECTORAL_DATA);
  const [costData, setCostData] = useState(COST_DATA);
  const [elasticityData, setElasticityData] = useState(ELASTICITY_MAP);
  const [isEditing, setIsEditing] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Create simulator instance
  const [simulator] = useState(() => new CarbonMarketSimulator());

  // Update simulator data whenever any data changes
  useEffect(() => {
    simulator.updateSectoralData(sectoralData);
    simulator.updateCostData(costData);
    simulator.updateElasticityData(elasticityData);
    
    // Auto-update equilibrium if enabled and not currently loading
    if (autoUpdate && !isLoading) {
      findEquilibrium();
    }
  }, [sectoralData, costData, elasticityData, autoUpdate, pMin, pMax]);

  const resetToDefaults = () => {
    setSectoralData({ ...SECTORAL_DATA });
    setCostData({ ...COST_DATA });
    setElasticityData({ ...ELASTICITY_MAP });
    setPMin(0);
    setPMax(200);
  };

  const findEquilibrium = async () => {
    setIsLoading(true);
    
    try {
      const result = simulator.findEquilibriumPrice(pMin, pMax);
      setResults(result);
      onResultsChange(result);
      
    } catch (error) {
      console.error('Equilibrium finding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSectoralValue = (sector: string, field: string, value: number) => {
    setSectoralData(prev => ({
      ...prev,
      [sector]: {
        ...prev[sector],
        [field]: value
      }
    }));
  };

  const updateCostValue = (sector: string, field: string, value: number) => {
    setCostData(prev => ({
      ...prev,
      [sector]: {
        ...prev[sector],
        [field]: value
      }
    }));
  };

  const updateElasticityValue = (sector: string, value: number) => {
    setElasticityData(prev => ({
      ...prev,
      [sector]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Equilibrium Price Finder</h2>
              <p className="text-sm text-gray-600">Find the market-clearing carbon price using bisection method</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Auto-update</span>
            </label>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit3 className="h-4 w-4" />
              <span>{isEditing ? 'View Mode' : 'Edit Data'}</span>
            </button>
            
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Defaults</span>
            </button>
            
            <button
              onClick={findEquilibrium}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>{isLoading ? 'Finding Equilibrium...' : 'Find Equilibrium'}</span>
            </button>
          </div>
        </div>

        {/* Price Bounds Configuration */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-blue-900">Price Search Range</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Minimum Price (P_min)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600">₹</span>
                <input
                  type="number"
                  value={pMin}
                  onChange={(e) => setPMin(Math.max(0, Number(e.target.value)))}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="1"
                />
                <span className="text-sm text-blue-600">/tCO₂</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Maximum Price (P_max)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600">₹</span>
                <input
                  type="number"
                  value={pMax}
                  onChange={(e) => setPMax(Math.max(pMin + 1, Number(e.target.value)))}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={pMin + 1}
                  step="1"
                />
                <span className="text-sm text-blue-600">/tCO₂</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-blue-700">
            <strong>Search Range:</strong> ₹{pMin} - ₹{pMax} per tCO₂ 
            <span className="ml-2 text-blue-600">
              (Range: ₹{pMax - pMin})
            </span>
          </div>
        </div>

        {/* Data Tables */}
        <div className="space-y-6">
          {/* Sectoral Data Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sectoral Data</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emissions (Mt CO₂)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensity (tCO₂/unit)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target (tCO₂/unit)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elasticity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(sectoralData).map(([sector, data]) => (
                    <tr key={sector} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sector}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data.emissions}
                            onChange={(e) => updateSectoralValue(sector, 'emissions', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.1"
                          />
                        ) : (
                          data.emissions
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data.production}
                            onChange={(e) => updateSectoralValue(sector, 'production', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.1"
                          />
                        ) : (
                          data.production
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data.intensity}
                            onChange={(e) => updateSectoralValue(sector, 'intensity', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01"
                          />
                        ) : (
                          data.intensity.toFixed(2)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data.target}
                            onChange={(e) => updateSectoralValue(sector, 'target', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01"
                          />
                        ) : (
                          data.target.toFixed(2)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={elasticityData[sector]}
                            onChange={(e) => updateElasticityValue(sector, Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01"
                            min="0"
                            max="1"
                          />
                        ) : (
                          elasticityData[sector].toFixed(2)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Data Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Data (Rs per unit)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fixed Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(costData).map(([sector, data]) => (
                    <tr key={sector} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sector}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data.fixed_cost}
                            onChange={(e) => updateCostValue(sector, 'fixed_cost', Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="100"
                          />
                        ) : (
                          data.fixed_cost.toLocaleString()
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data.variable_cost}
                            onChange={(e) => updateCostValue(sector, 'variable_cost', Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="100"
                          />
                        ) : (
                          data.variable_cost.toLocaleString()
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data.price}
                            onChange={(e) => updateCostValue(sector, 'price', Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="100"
                          />
                        ) : (
                          data.price.toLocaleString()
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {!results && !isLoading && (
          <div className="text-center py-12 mt-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Find Equilibrium</h3>
            <p className="text-gray-600 mb-4">
              Configure the price search range above and click "Find Equilibrium" to calculate the market-clearing carbon price.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <div className="text-sm font-medium text-blue-900">How it works</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Uses bisection method to search between P_min and P_max until finding the equilibrium where market supply equals demand.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12 mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Computing Equilibrium...</h3>
            <p className="text-gray-600">
              Searching between ₹{pMin} - ₹{pMax} for market-clearing price
            </p>
          </div>
        )}
      </div>

      {results && (
        <>
          <MarketSummary results={results} showEquilibriumInfo={true} />
          
          {/* Sector Position Bar Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sector Positions at Equilibrium</h3>
                <p className="text-sm text-gray-600">Visual representation of each sector's carbon credit balance</p>
              </div>
            </div>
            <SectorPositionChart results={results} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Sector Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.sectors.map((sector) => (
                <SectorCard key={sector.sector} result={sector} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};