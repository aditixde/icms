import React, { useState, Suspense } from 'react';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { 
  PriceSimulator, 
  EquilibriumFinder, 
  ScenarioComparison,
  StrategyMatrix,
  ExportModal 
} from './components/LazyComponents';
import { ReportGenerator } from './utils/reportGenerator';
import { SimulationResults } from './types';

function App() {
  const [currentView, setCurrentView] = useState('simulator');
  const [currentResults, setCurrentResults] = useState<SimulationResults | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExport = () => {
    if (!currentResults) return;
    setShowExportModal(true);
  };

  const handleExportConfirm = (format: 'pdf' | 'csv') => {
    if (!currentResults) return;
    
    const scenarioName = currentView === 'equilibrium' ? 'Equilibrium_Analysis' : 'Price_Simulation';
    
    if (format === 'pdf') {
      ReportGenerator.generatePDF(currentResults, scenarioName);
    } else {
      ReportGenerator.downloadCSV(currentResults, scenarioName);
    }
    
    setShowExportModal(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'simulator':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Price Simulator..." />}>
            <PriceSimulator onResultsChange={setCurrentResults} />
          </Suspense>
        );
      case 'equilibrium':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Equilibrium Finder..." />}>
            <EquilibriumFinder onResultsChange={setCurrentResults} />
          </Suspense>
        );
      case 'strategy':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Strategy Matrix..." />}>
            <StrategyMatrix />
          </Suspense>
        );
      case 'scenarios':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Scenario Comparison..." />}>
            <ScenarioComparison />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Price Simulator..." />}>
            <PriceSimulator onResultsChange={setCurrentResults} />
          </Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onExport={handleExport}
        hasResults={!!currentResults}
      />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {renderCurrentView()}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Indian Institute of Technology, Roorkee
            </div>
            <div className="text-sm text-gray-500">
              <a 
                href="https://github.com/aditixde/icms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                Github Repo
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExportConfirm}
          scenarioName={currentView === 'equilibrium' ? 'Equilibrium Analysis' : 'Price Simulation'}
        />
      </Suspense>
    </div>
  );
}

export default App;
