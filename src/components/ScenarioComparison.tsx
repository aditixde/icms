import React, { useState } from 'react';
import { Plus, Trash2, Copy, BarChart3 } from 'lucide-react';
import { PolicyScenario, SimulationResults } from '../types';
import { CarbonMarketSimulator } from '../utils/carbonSimulator';
import { SectorCard } from './SectorCard';
import { ReportGenerator } from '../utils/reportGenerator';

export const ScenarioComparison: React.FC = () => {
  const [scenarios, setScenarios] = useState<PolicyScenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioPrice, setNewScenarioPrice] = useState(50);

  const createScenario = async () => {
    if (!newScenarioName.trim()) return;
    
    setIsCreating(true);
    try {
      const simulator = new CarbonMarketSimulator();
      const results = simulator.simulateAtPrice(newScenarioPrice);
      
      const newScenario: PolicyScenario = {
        id: Date.now().toString(),
        name: newScenarioName,
        carbon_price: newScenarioPrice,
        custom_targets: {},
        results,
        created_at: new Date()
      };
      
      setScenarios(prev => [newScenario, ...prev]);
      setNewScenarioName('');
      setNewScenarioPrice(50);
    } catch (error) {
      console.error('Error creating scenario:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const duplicateScenario = (scenario: PolicyScenario) => {
    const duplicate: PolicyScenario = {
      ...scenario,
      id: Date.now().toString(),
      name: `${scenario.name} (Copy)`,
      created_at: new Date()
    };
    setScenarios(prev => [duplicate, ...prev]);
  };

  const deleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    setSelectedScenarios(prev => prev.filter(id => id !== id));
  };

  const toggleScenarioSelection = (id: string) => {
    setSelectedScenarios(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const exportComparison = () => {
    const selectedScenarioData = scenarios.filter(s => selectedScenarios.includes(s.id));
    if (selectedScenarioData.length === 0) return;
    
    const csvContent = ReportGenerator.compareScenarios(selectedScenarioData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ICMS_Scenario_Comparison_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getComparisonMetrics = () => {
    const selectedScenarioData = scenarios.filter(s => selectedScenarios.includes(s.id));
    if (selectedScenarioData.length === 0) return null;

    const avgPrice = selectedScenarioData.reduce((sum, s) => sum + s.results.carbon_price, 0) / selectedScenarioData.length;
    const avgEmissions = selectedScenarioData.reduce((sum, s) => sum + s.results.total_emissions_reduced, 0) / selectedScenarioData.length;
    const priceRange = Math.max(...selectedScenarioData.map(s => s.results.carbon_price)) - Math.min(...selectedScenarioData.map(s => s.results.carbon_price));

    return { avgPrice, avgEmissions, priceRange };
  };

  const comparisonMetrics = getComparisonMetrics();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Scenario Comparison</h2>
            <p className="text-sm text-gray-600">Create and compare multiple carbon pricing scenarios</p>
          </div>
          
          {selectedScenarios.length > 0 && (
            <button
              onClick={exportComparison}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Export Comparison</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Scenario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="e.g., High Carbon Price Policy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbon Price: ₹{newScenarioPrice}/tCO₂
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={newScenarioPrice}
                  onChange={(e) => setNewScenarioPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <button
                onClick={createScenario}
                disabled={isCreating || !newScenarioName.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{isCreating ? 'Creating...' : 'Create Scenario'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {comparisonMetrics && selectedScenarios.length > 1 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3">Comparison Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-blue-700">Avg. Carbon Price</div>
                    <div className="text-xl font-semibold text-blue-900">₹{comparisonMetrics.avgPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700">Avg. Emissions Reduced</div>
                    <div className="text-xl font-semibold text-blue-900">{comparisonMetrics.avgEmissions.toFixed(2)} Mt</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700">Price Range</div>
                    <div className="text-xl font-semibold text-blue-900">₹{comparisonMetrics.priceRange.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scenarios Created</h3>
          <p className="text-gray-600">Create your first scenario above to start comparing different carbon pricing policies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedScenarios.includes(scenario.id)}
                    onChange={() => toggleScenarioSelection(scenario.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => duplicateScenario(scenario)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Duplicate scenario"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteScenario(scenario.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete scenario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Carbon Price:</span>
                  <span className="font-medium">₹{scenario.results.carbon_price.toFixed(2)}/tCO₂</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Emissions Reduced:</span>
                  <span className="font-medium">{scenario.results.total_emissions_reduced.toFixed(2)} Mt</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Market Balance:</span>
                  <span className="font-medium">{scenario.results.total_ccc_supply.toFixed(2)} Mt</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{scenario.created_at.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs text-gray-500 mb-2">Sector Positions</div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">
                    {scenario.results.sectors.filter(s => s.net_position === 'Buyer').length} Buyers
                  </span>
                  <span className="text-gray-600">
                    {scenario.results.sectors.filter(s => s.net_position === 'Neutral').length} Neutral
                  </span>
                  <span className="text-green-600">
                    {scenario.results.sectors.filter(s => s.net_position === 'Seller').length} Sellers
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedScenarios.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Scenarios Detailed View
          </h3>
          {scenarios
            .filter(s => selectedScenarios.includes(s.id))
            .map((scenario) => (
              <div key={scenario.id} className="mb-8 last:mb-0">
                <h4 className="text-md font-medium text-gray-900 mb-4">{scenario.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scenario.results.sectors.slice(0, 6).map((sector) => (
                    <SectorCard key={sector.sector} result={sector} isCompact={true} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};