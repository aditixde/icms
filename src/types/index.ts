export interface SectorData {
  emissions: number;        // Mt CO2
  production: number;       // Production units
  intensity: number;        // tCO2/unit
  target: number;          // Target intensity tCO2/unit
}

export interface CostData {
  fixed_cost: number;      // Rs per unit
  variable_cost: number;   // Rs per unit  
  price: number;          // Rs per unit
}

export interface SectorResult {
  sector: string;
  baseline_intensity: number;
  new_intensity: number;
  baseline_production: number;
  adjusted_production: number;
  emissions_reduced: number;
  ccc_balance: number;
  net_position: 'Buyer' | 'Seller' | 'Neutral';
  profit_change: number;
  total_profit: number;
}

export interface SimulationResults {
  carbon_price: number;
  sectors: SectorResult[];
  total_emissions_reduced: number;
  total_ccc_supply: number;
  equilibrium_found: boolean;
  iterations?: number;
}

export interface PolicyScenario {
  id: string;
  name: string;
  carbon_price: number;
  custom_targets: Record<string, number>;
  price_cap?: number;
  price_floor?: number;
  results: SimulationResults;
  created_at: Date;
}