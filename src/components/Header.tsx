import React from 'react';
import { BarChart3, Settings, Download, Grid3X3 } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onExport: () => void;
  hasResults: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onExport, hasResults }) => {
  const views = [
    { id: 'simulator', label: 'Price Simulator', icon: BarChart3 },
    { id: 'equilibrium', label: 'Equilibrium Finder', icon: Settings },
    { id: 'strategy', label: 'Strategy Matrix', icon: Grid3X3 },
    { id: 'scenarios', label: 'Scenario Comparison', icon: Download }
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                India Carbon Market Simulator
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === view.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onExport}
          disabled={!hasResults}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};
