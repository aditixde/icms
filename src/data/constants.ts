import { SectorData, CostData } from '../types';

export const SECTORAL_DATA: Record<string, SectorData> = {
  'Steel': { emissions: 297, production: 120, intensity: 2.48, target: 2.25 },
  'Aluminium': { emissions: 77, production: 3.6, intensity: 20.88, target: 18.79 },
  'Cement': { emissions: 218, production: 337, intensity: 0.65, target: 0.59 },
  'Fertiliser': { emissions: 25, production: 43, intensity: 0.58, target: 0.52 },
  'Textile': { emissions: 25, production: 9.5, intensity: 2.63, target: 2.37 },
  'Paper & Pulp': { emissions: 30.5, production: 19.3, intensity: 1.58, target: 1.4 },
  'Petrochemicals': { emissions: 94.87, production: 26.5, intensity: 3.58, target: 3.22 },
  'Petroleum Refining': { emissions: 70, production: 243, intensity: 0.28, target: 0.25 },
  'Chlor Alkali': { emissions: 12, production: 4.54, intensity: 2.63, target: 2.36 }
};

export const COST_DATA: Record<string, CostData> = {
  'Steel': { fixed_cost: 17500, variable_cost: 40000, price: 62500 },
  'Aluminium': { fixed_cost: 70000, variable_cost: 140000, price: 230000 },
  'Cement': { fixed_cost: 1400, variable_cost: 4100, price: 6000 },
  'Fertiliser': { fixed_cost: 5000, variable_cost: 18000, price: 25000 },
  'Textile': { fixed_cost: 60000, variable_cost: 155000, price: 250000 },
  'Paper & Pulp': { fixed_cost: 17500, variable_cost: 40000, price: 62500 },
  'Petrochemicals': { fixed_cost: 25000, variable_cost: 70000, price: 105000 },
  'Petroleum Refining': { fixed_cost: 20000, variable_cost: 60000, price: 90000 },
  'Chlor Alkali': { fixed_cost: 12000, variable_cost: 20000, price: 35000 }
};

export const ELASTICITY_MAP: Record<string, number> = {
  'Steel': 0.4,
  'Aluminium': 0.35,
  'Cement': 0.25,
  'Fertiliser': 0.3,
  'Textile': 0.45,
  'Paper & Pulp': 0.4,
  'Petrochemicals': 0.35,
  'Petroleum Refining': 0.2,
  'Chlor Alkali': 0.3
};

export const ABATEMENT_COST_K = 50; // Calibrated parameter for abatement cost curve
export const EPSILON = 0.0001; // Convergence threshold for equilibrium
export const MAX_ITERATIONS = 100; // Maximum iterations for bisection method