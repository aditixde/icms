import React, { useState, useEffect } from 'react';
import { Sliders as Slider, Play, RefreshCw } from 'lucide-react';
import { CarbonMarketSimulator } from '../utils/carbonSimulator';
import { SimulationResults } from '../types';
import { SectorCard } from './SectorCard';
import { MarketSummary } from './MarketSummary';

interface PriceSimulatorProps {
  onResultsChange: (results: SimulationResults) => void;
}

export const PriceSimulator: React.FC<PriceSimulatorProps> = ({ onResultsChange }) => {
  const [carbonPrice, setCarbonPrice] = useState(50);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [customTargets, setCustomTargets] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [simulator] = useState(() => new CarbonMarketSimulator());

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      // Simulate some processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const sim = new CarbonMarketSimulator(customTargets);
      const simulationResults = sim.simulateAtPrice(carbonPrice);
      setResults(simulationResults);
      onResultsChange(simulationResults);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setCustomTargets({});
    setCarbonPrice(50);
    simulator.resetToDefaults();
  };

  useEffect(() => {
    runSimulation();
  }, [carbonPrice]);

  const handleTargetChange = (sector: string, newTarget: number) => {
    setCustomTargets(prev => ({
      ...prev,
      [sector]: newTarget
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Carbon Price Simulator</h2>
          <div className="flex space-x-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={runSimulation}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>{isLoading ? 'Running...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Carbon Price: ₹{carbonPrice}/tCO₂
                </label>
                <div className="px-3">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={carbonPrice}
                    onChange={(e) => setCarbonPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(carbonPrice/200)*100}%, #E5E7EB ${(carbonPrice/200)*100}%, #E5E7EB 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹200</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Policy Sandbox</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.keys(simulator['sectoralData']).map((sector) => {
                    const baselineTarget = simulator['sectoralData'][sector].target;
                    const currentTarget = customTargets[sector] || baselineTarget;
                    
                    return (
                      <div key={sector} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-700">{sector}</span>
                          <span className="text-xs text-gray-500">{currentTarget.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min={baselineTarget * 0.5}
                          max={baselineTarget * 1.5}
                          step="0.01"
                          value={currentTarget}
                          onChange={(e) => handleTargetChange(sector, Number(e.target.value))}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {results && <MarketSummary results={results} />}
          </div>
        </div>
      </div>

      {results && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.sectors.map((sector) => (
              <SectorCard key={sector.sector} result={sector} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};