import React from 'react';
import { X, FileText, Download } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'csv') => void;
  scenarioName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, scenarioName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
      
      {/* Modal positioned below header */}
      <div className="relative bg-white border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>
                <p className="text-sm text-gray-600">
                  Choose format for <strong>{scenarioName}</strong> report
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onExport('pdf')}
              className="flex items-center space-x-3 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors group"
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">PDF Report</div>
                <div className="text-xs opacity-90">Formatted document</div>
              </div>
            </button>
            
            <button
              onClick={() => onExport('csv')}
              className="flex items-center space-x-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors group"
            >
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">CSV Data</div>
                <div className="text-xs opacity-90">Raw data export</div>
              </div>
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};