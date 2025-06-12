import jsPDF from 'jspdf';
import { SimulationResults, PolicyScenario } from '../types';

export class ReportGenerator {
  static generateCSV(results: SimulationResults, scenarioName: string = 'Simulation'): string {
    const headers = [
      'Scenario',
      'Carbon Price (Rs/tCO2)',
      'Sector',
      'Baseline Intensity (tCO2/unit)',
      'New Intensity (tCO2/unit)',
      'Baseline Production',
      'Adjusted Production',
      'Emissions Reduced (Mt CO2)',
      'CCC Balance (Mt CO2)',
      'Net Position',
      'Profit Change (Rs Million)',
      'Total Profit (Rs Million)'
    ];

    let csvContent = headers.join(',') + '\n';

    results.sectors.forEach(sector => {
      const row = [
        scenarioName,
        results.carbon_price.toFixed(2),
        sector.sector,
        sector.baseline_intensity.toFixed(3),
        sector.new_intensity.toFixed(3),
        sector.baseline_production.toFixed(2),
        sector.adjusted_production.toFixed(2),
        sector.emissions_reduced.toFixed(2),
        sector.ccc_balance.toFixed(2),
        sector.net_position,
        sector.profit_change.toFixed(2),
        sector.total_profit.toFixed(2)
      ];
      csvContent += row.join(',') + '\n';
    });

    // Add summary row
    csvContent += '\nSummary\n';
    csvContent += `Total Emissions Reduced (Mt CO2),${results.total_emissions_reduced.toFixed(2)}\n`;
    csvContent += `Total CCC Supply (Mt CO2),${results.total_ccc_supply.toFixed(2)}\n`;
    csvContent += `Equilibrium Found,${results.equilibrium_found ? 'Yes' : 'No'}\n`;
    if (results.iterations !== undefined) {
      csvContent += `Iterations,${results.iterations}\n`;
    }

    return csvContent;
  }

  static downloadCSV(results: SimulationResults, scenarioName: string = 'Simulation') {
    const csvContent = this.generateCSV(results, scenarioName);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ICMS_${scenarioName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  static async generatePDF(results: SimulationResults, scenarioName: string = 'Simulation'): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;

    // Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('India Carbon Market Simulator (ICMS)', margin, 30);
    pdf.text(`Report: ${scenarioName}`, margin, 45);

    // Summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Carbon Price: Rs ${results.carbon_price.toFixed(2)}/tCO2`, margin, 65);
    pdf.text(`Total Emissions Reduced: ${results.total_emissions_reduced.toFixed(2)} Mt CO2`, margin, 80);
    pdf.text(`Market Balance: ${results.total_ccc_supply.toFixed(2)} Mt CO2`, margin, 95);
    pdf.text(`Equilibrium: ${results.equilibrium_found ? 'Found' : 'Not Found'}`, margin, 110);

    // Sector Results Table
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sector Results', margin, 135);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    const tableData = results.sectors.map(sector => [
      sector.sector,
      sector.new_intensity.toFixed(2),
      sector.adjusted_production.toFixed(1),
      sector.emissions_reduced.toFixed(2),
      sector.ccc_balance.toFixed(2),
      sector.net_position,
      sector.profit_change.toFixed(1)
    ]);

    const headers = ['Sector', 'New Intensity', 'Adj. Production', 'Emissions Reduced', 'CCC Balance', 'Position', 'Profit Change'];
    
    let y = 150;
    const rowHeight = 12;
    const colWidths = [25, 20, 25, 25, 20, 15, 20];
    
    // Headers
    pdf.setFont('helvetica', 'bold');
    let x = margin;
    headers.forEach((header, i) => {
      pdf.text(header, x, y);
      x += colWidths[i];
    });
    
    y += rowHeight;
    pdf.setFont('helvetica', 'normal');
    
    // Data rows
    tableData.forEach(row => {
      x = margin;
      row.forEach((cell, i) => {
        pdf.text(cell.toString(), x, y);
        x += colWidths[i];
      });
      y += rowHeight;
    });

    // Footer
    pdf.setFontSize(10);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pdf.internal.pageSize.height - 20);

    pdf.save(`ICMS_${scenarioName}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static compareScenarios(scenarios: PolicyScenario[]): string {
    if (scenarios.length === 0) return '';

    const headers = ['Metric', ...scenarios.map(s => s.name)];
    let csvContent = headers.join(',') + '\n';

    // Carbon prices
    const priceRow = ['Carbon Price (Rs/tCO2)', ...scenarios.map(s => s.results.carbon_price.toFixed(2))];
    csvContent += priceRow.join(',') + '\n';

    // Total emissions reduced
    const emissionsRow = ['Total Emissions Reduced (Mt CO2)', ...scenarios.map(s => s.results.total_emissions_reduced.toFixed(2))];
    csvContent += emissionsRow.join(',') + '\n';

    // Market balance
    const balanceRow = ['Market Balance (Mt CO2)', ...scenarios.map(s => s.results.total_ccc_supply.toFixed(2))];
    csvContent += balanceRow.join(',') + '\n';

    return csvContent;
  }
}