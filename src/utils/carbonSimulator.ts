import { SECTORAL_DATA, COST_DATA, ELASTICITY_MAP, ABATEMENT_COST_K, EPSILON, MAX_ITERATIONS } from '../data/constants';
import { SectorResult, SimulationResults, PolicyScenario } from '../types';

export class CarbonMarketSimulator {
  private sectoralData = SECTORAL_DATA;
  private costData = COST_DATA;
  private elasticityMap = ELASTICITY_MAP;
  private k = ABATEMENT_COST_K;

  constructor(customTargets?: Record<string, number>) {
    if (customTargets) {
      this.sectoralData = { ...this.sectoralData };
      Object.entries(customTargets).forEach(([sector, target]) => {
        if (this.sectoralData[sector]) {
          this.sectoralData[sector] = { ...this.sectoralData[sector], target };
        }
      });
    }
  }

  updateSectoralData(newData: typeof SECTORAL_DATA) {
    this.sectoralData = { ...newData };
  }

  updateCostData(newData: typeof COST_DATA) {
    this.costData = { ...newData };
  }

  updateElasticityData(newData: typeof ELASTICITY_MAP) {
    this.elasticityMap = { ...newData };
  }

  simulateAtPrice(carbonPrice: number): SimulationResults {
    const sectors: SectorResult[] = [];
    let totalEmissionsReduced = 0;
    let totalCCCSupply = 0;

    Object.entries(this.sectoralData).forEach(([sectorName, data]) => {
      const costInfo = this.costData[sectorName];
      const elasticity = this.elasticityMap[sectorName];

      // Algorithm variables
      const P_mid = carbonPrice;
      const e_0i = data.intensity;        // baseline intensity
      const tau_i = data.target;          // target intensity
      const Q_0i = data.production;       // baseline production
      const P_i = costInfo.price;         // product price
      const v_i = costInfo.variable_cost; // variable cost
      const alpha_i = elasticity;         // elasticity
      const k_i = this.k;                 // abatement cost parameter

      // Step 1: Calculate new emissions intensity
      const e_i = Math.max(0, e_0i - (P_mid / (2 * k_i)));
      
      // Step 2: Calculate marginal net profit
      const MNP_i = P_i - v_i - P_mid * (e_i - tau_i) + P_mid * (e_0i - e_i);
      
      // Step 3: Calculate new output
      const Q_i_new = Math.max(0, Q_0i + (alpha_i * MNP_i / 1000));
      
      // Step 4: Calculate CCC position (positive = surplus, negative = deficit)
      const S_i = (tau_i - e_i) * Q_i_new;
      
      // Calculate emissions reduced
      const emissionsReduced = (e_0i - e_i) * Q_i_new;
      
      // Step 5: Calculate profit
      const baselineProfit = (Q_0i * P_i) - (Q_0i * v_i) - costInfo.fixed_cost;
      const newRevenue = Q_i_new * P_i;
      const newVariableCost = Q_i_new * v_i;
      const carbonCost = Math.max(0, -S_i) * P_mid; // Only pay for deficits
      const carbonRevenue = Math.max(0, S_i) * P_mid; // Only earn from surplus
      const newProfit = newRevenue - newVariableCost - costInfo.fixed_cost - carbonCost + carbonRevenue;
      const profitChange = newProfit - baselineProfit;

      // Determine net position
      let netPosition: 'Buyer' | 'Seller' | 'Neutral' = 'Neutral';
      if (S_i > 1) netPosition = 'Seller';
      else if (S_i < -1) netPosition = 'Buyer';

      sectors.push({
        sector: sectorName,
        baseline_intensity: e_0i,
        new_intensity: e_i,
        baseline_production: Q_0i,
        adjusted_production: Q_i_new,
        emissions_reduced: emissionsReduced,
        ccc_balance: S_i,
        net_position: netPosition,
        profit_change: profitChange / 1000000, // Convert to millions
        total_profit: newProfit / 1000000
      });

      totalEmissionsReduced += emissionsReduced;
      totalCCCSupply += S_i; // Step 5: Add to total market supply
    });

    return {
      carbon_price: carbonPrice,
      sectors,
      total_emissions_reduced: totalEmissionsReduced,
      total_ccc_supply: totalCCCSupply,
      equilibrium_found: Math.abs(totalCCCSupply) < EPSILON
    };
  }

  findEquilibriumPrice(P_min: number = 0, P_max: number = 200): SimulationResults {
    let iterations = 0;
    const epsilon = EPSILON;
    let result: SimulationResults;

    // Check if equilibrium exists in range
    const lowResult = this.simulateAtPrice(P_min);
    const highResult = this.simulateAtPrice(P_max);

    if (lowResult.total_ccc_supply * highResult.total_ccc_supply > 0) {
      // No equilibrium in range, return result at midpoint
      result = this.simulateAtPrice((P_min + P_max) / 2);
      result.equilibrium_found = false;
      result.iterations = iterations;
      return result;
    }

    // Bisection method following the exact algorithm
    // CORRECTED LOGIC: Market clears when supply = demand (total_ccc_supply = 0)
    while ((P_max - P_min) > epsilon && iterations < MAX_ITERATIONS) {
      const P_mid = (P_min + P_max) / 2;
      result = this.simulateAtPrice(P_mid);
      
      if (Math.abs(result.total_ccc_supply) < epsilon) {
        result.equilibrium_found = true;
        result.iterations = iterations;
        return result;
      }

      // CORRECTED Step 6: Adjust bounds for market clearing
      if (result.total_ccc_supply > 0) {
        // Excess supply → price is too high, reduce upper bound
        P_max = P_mid;
      } else {
        // Excess demand → price is too low, increase lower bound
        P_min = P_mid;
      }
      iterations++;
    }

    result = this.simulateAtPrice((P_min + P_max) / 2);
    result.equilibrium_found = Math.abs(result.total_ccc_supply) < epsilon;
    result.iterations = iterations;
    return result;
  }

  // Method to find equilibrium with convergence tracking
  async findEquilibriumWithTracking(P_min: number = 0, P_max: number = 200): Promise<{
    result: SimulationResults;
    convergenceData: Array<{iteration: number, price: number, balance: number}>;
  }> {
    let iterations = 0;
    const epsilon = EPSILON;
    const convergenceHistory: Array<{iteration: number, price: number, balance: number}> = [];
    let result: SimulationResults;

    // Check bounds
    const lowResult = this.simulateAtPrice(P_min);
    const highResult = this.simulateAtPrice(P_max);
    
    convergenceHistory.push({iteration: 0, price: P_min, balance: lowResult.total_ccc_supply});
    convergenceHistory.push({iteration: 1, price: P_max, balance: highResult.total_ccc_supply});

    if (lowResult.total_ccc_supply * highResult.total_ccc_supply > 0) {
      // No equilibrium in range
      result = this.simulateAtPrice((P_min + P_max) / 2);
      result.equilibrium_found = false;
      result.iterations = iterations;
      return { result, convergenceData: convergenceHistory };
    }

    // Bisection with tracking - CORRECTED algorithm for market clearing
    while ((P_max - P_min) > epsilon && iterations < MAX_ITERATIONS) {
      const P_mid = (P_min + P_max) / 2;
      result = this.simulateAtPrice(P_mid);
      
      convergenceHistory.push({
        iteration: iterations + 2,
        price: P_mid,
        balance: result.total_ccc_supply
      });
      
      if (Math.abs(result.total_ccc_supply) < epsilon) {
        result.equilibrium_found = true;
        result.iterations = iterations;
        return { result, convergenceData: convergenceHistory };
      }

      // CORRECTED Step 6: Adjust bounds for market clearing (supply = demand)
      if (result.total_ccc_supply > 0) {
        // Excess supply → price is too high, reduce upper bound
        P_max = P_mid;
      } else {
        // Excess demand → price is too low, increase lower bound
        P_min = P_mid;
      }
      iterations++;
    }

    result = this.simulateAtPrice((P_min + P_max) / 2);
    result.equilibrium_found = Math.abs(result.total_ccc_supply) < epsilon;
    result.iterations = iterations;
    return { result, convergenceData: convergenceHistory };
  }

  updateTargets(newTargets: Record<string, number>) {
    Object.entries(newTargets).forEach(([sector, target]) => {
      if (this.sectoralData[sector]) {
        this.sectoralData[sector] = { ...this.sectoralData[sector], target };
      }
    });
  }

  resetToDefaults() {
    this.sectoralData = { ...SECTORAL_DATA };
    this.costData = { ...COST_DATA };
    this.elasticityMap = { ...ELASTICITY_MAP };
  }
}