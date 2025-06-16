# India Carbon Market Simulator (ICMS)

The India Carbon Market Simulator (ICMS) is a tool designed to analyze the impacts of India's Carbon Credit Trading System (CCTS) across various industrial sectors. It utilizes mathematical equilibrium modeling to provide insights into carbon pricing, emissions reduction, and economic implications.

## Features

*   **Price Simulator**: Set a specific carbon price and instantly see its impact on individual sectors and the overall market.
*   **Equilibrium Price Finder**: Discover the market-clearing carbon price where supply and demand for carbon credits balance out, using an iterative bisection method.
*   **Time-Series Analysis**: Simulate the carbon market's evolution over multiple years, incorporating dynamic factors like economic growth, technological advancements, policy changes, and random shocks.
*   **Scenario Comparison**: Create and compare multiple policy scenarios to evaluate their long-term effects and trade-offs.
*   **Data Export**: Export simulation results and comparisons in PDF and CSV formats for further analysis and reporting.

## Technical Stack

The ICMS application is built with modern web technologies to provide a responsive and interactive user experience:

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **Vite**: A fast build tool that provides an extremely quick development experience.
*   **Lucide React**: A collection of beautiful and customizable open-source icons.
*   **Chart.js & React-Chartjs-2**: For rendering interactive data visualizations.
*   **jsPDF & html2canvas**: For generating PDF reports directly in the browser.

## Installation and Setup

To get the India Carbon Market Simulator running locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/aditixde/icms.git
    cd india-carbon-market-simulator
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:5173`.

4.  **Build for production**:
    ```bash
    npm run build
    ```
    This command compiles the application into the `dist` directory, ready for deployment.

## Core Simulation Logic

The heart of the ICMS lies in its simulation algorithms, primarily implemented in `src/utils/carbonSimulator.ts`.

### 1. Price Simulator

The Price Simulator allows users to set a specific carbon price and observe its immediate impact on various industrial sectors and the overall market.

**Core Logic: `simulateAtPrice(carbonPrice: number)` method in `CarbonMarketSimulator`**

1.  **Inputs**:
    *   `carbonPrice`: The user-defined carbon price (Rs/tCO₂).
    *   `sectoralData`: Baseline data for each sector (emissions, production, intensity, target).
    *   `costData`: Cost structure for each sector (fixed cost, variable cost, product price).
    *   `elasticityMap`: Price elasticity of demand for each sector.
    *   `ABATEMENT_COST_K`: A constant representing the abatement cost curve parameter.
2.  **Iteration through Sectors**: The method iterates through each defined industrial sector (e.g., Steel, Aluminium, Cement).
3.  **Calculations for Each Sector**: For every sector, the following steps are performed:
    *   **Step 1: Calculate New Emissions Intensity (`e_i`)**: This determines how much a sector reduces its emissions intensity in response to the given carbon price. It's calculated using the baseline intensity (`e_0i`), the carbon price (`P_mid`), and the abatement cost parameter (`k_i`). The formula `e_i = Math.max(0, e_0i - (P_mid / (2 * k_i)))` ensures intensity doesn't go below zero.
    *   **Step 2: Calculate Marginal Net Profit (`MNP_i`)**: This assesses the profitability of a sector considering the carbon price. It accounts for the product price (`P_i`), variable cost (`v_i`), and the cost/revenue associated with carbon credits based on the difference between the new intensity (`e_i`) and the target intensity (`tau_i`), as well as the emissions reduction achieved.
    *   **Step 3: Calculate New Output (`Q_i_new`)**: This determines how a sector's production adjusts based on its marginal net profit and its price elasticity of demand (`alpha_i`). The formula `Q_i_new = Math.max(0, Q_0i + (alpha_i * MNP_i / 1000))` ensures production doesn't go below zero.
    *   **Step 4: Calculate Carbon Credit Certificate (CCC) Balance (`S_i`)**: This is the core of the market mechanism. It represents whether a sector has a surplus (positive `S_i`) or deficit (negative `S_i`) of carbon credits based on its new intensity, target intensity, and adjusted production. `S_i = (tau_i - e_i) * Q_i_new`.
    *   **Calculate Emissions Reduced**: The actual amount of emissions reduced by the sector is calculated as `(e_0i - e_i) * Q_i_new`.
    *   **Step 5: Calculate Profit Impact**: The change in profit for the sector is determined by comparing its baseline profit with its new profit. The new profit considers new revenue, new variable costs, and the cost of buying or revenue from selling carbon credits. `profit_change` is then converted to millions.
    *   **Determine Net Position**: Based on the `ccc_balance`, the sector is classified as a 'Buyer' (deficit), 'Seller' (surplus), or 'Neutral'.
4.  **Aggregate Results**: After processing all sectors, the method sums up the `total_emissions_reduced` and `total_ccc_supply` across all sectors.
5.  **Output**: Returns a `SimulationResults` object containing the `carbon_price`, an array of `SectorResult` objects (one for each sector), the `total_emissions_reduced`, and the `total_ccc_supply`. The `equilibrium_found` flag is set to `true` if `total_ccc_supply` is close to zero (within `EPSILON`).

### 2. Equilibrium Price Finder

The Equilibrium Finder aims to determine the carbon price at which the total supply of carbon credits equals the total demand (i.e., market clears).

**Core Logic: `findEquilibriumPrice(P_min: number, P_max: number)` and `findEquilibriumWithTracking(...)` methods in `CarbonMarketSimulator`**

1.  **Inputs**:
    *   `P_min`: Minimum carbon price for the search range.
    *   `P_max`: Maximum carbon price for the search range.
    *   `EPSILON`: A small value defining the convergence threshold (how close `total_ccc_supply` needs to be to zero).
    *   `MAX_ITERATIONS`: Maximum number of iterations to prevent infinite loops.
2.  **Bisection Method**: This method uses a numerical technique called the bisection method to find the equilibrium price.
    *   **Initial Check**: It first simulates the market at `P_min` and `P_max`. If the `total_ccc_supply` at these two prices have the same sign, it implies that an equilibrium might not exist within the given range, or the function doesn't cross zero in that interval. In this case, it returns a result at the midpoint with `equilibrium_found` as `false`.
    *   **Iterative Search**:
        *   It repeatedly calculates the midpoint `P_mid = (P_min + P_max) / 2`.
        *   It then calls `simulateAtPrice(P_mid)` to get the market balance at this midpoint price.
        *   **Convergence Check**: If the absolute value of `total_ccc_supply` at `P_mid` is less than `EPSILON`, an equilibrium is considered found, and the simulation stops.
        *   **Adjusting Bounds**:
            *   If `total_ccc_supply` at `P_mid` is positive (excess supply), it means the price is too high, so the upper bound `P_max` is set to `P_mid`.
            *   If `total_ccc_supply` at `P_mid` is negative (excess demand), it means the price is too low, so the lower bound `P_min` is set to `P_mid`.
        *   This process halves the search interval in each iteration, quickly converging towards the equilibrium price.
    *   **Iteration Limit**: The loop continues until the price range (`P_max - P_min`) is smaller than `EPSILON` or `MAX_ITERATIONS` is reached.
3.  **Tracking (for `findEquilibriumWithTracking`)**: This specific method also records the `iteration`, `price`, and `balance` at each step of the bisection method. This data is used to visualize the convergence process in the `ConvergenceChart` component.
4.  **Output**: Returns a `SimulationResults` object, similar to the Price Simulator, but with the `carbon_price` being the calculated equilibrium price and `equilibrium_found` indicating success. It also includes the `iterations` count.

### 3. Strategic Behavior Matrix

The **Strategic Behavior Matrix** is a visual and analytical tool to simulate how sectors behave when they make intentional strategic decisions to adjust **output** and/or **emissions intensity**, regardless of direct market feedback.

This feature is represented as a **2×2 matrix**, with each quadrant corresponding to one of the following strategy combinations:

- **Top Left**: ↓ Output, ↓ Intensity  
- **Top Right**: ↑ Output, ↓ Intensity  
- **Bottom Left**: ↓ Output, ↑ Intensity  
- **Bottom Right**: ↑ Output, ↑ Intensity

#### Core Logic: `simulateStrategyMatrix(outputFactor: number, intensityFactor: number)`

**Inputs:**

- `outputFactor`: Global adjustment for sectoral output (range: `-0.2` to `+0.2`)
- `intensityFactor`: Global adjustment for sectoral emissions intensity (range: `-0.2` to `+0.2`)
- Sectoral and cost data
- Carbon price (fixed or inherited from simulation state)

**Adjustments Per Sector:**

- `Adjusted Output = Q₀ × (1 + outputFactor)`
- `Adjusted Intensity = e₀ × (1 + intensityFactor)`
- `CCC Balance = (τ - e') × Q'`
- `Emissions Reduced = (e₀ - e') × Q'`
- `Profit = Revenue - Variable Cost - Fixed Cost - CCC Purchase Cost + CCC Sale Revenue`

Where:

- `Revenue = Adjusted Output × Price`
- `Variable Cost = Adjusted Output × Variable Cost`
- `CCC Cost/Revenue = CCC Balance × Carbon Price` (buy or sell depending on surplus/deficit)

### 4. Scenario Comparison

This feature allows users to create, manage, and compare multiple carbon pricing scenarios side-by-side.

**Core Logic: Scenario Management and Comparison in `ScenarioComparison` component**

1.  **Scenario Creation**:
    *   Users provide a `name` and an `initial carbon price` for a new scenario.
    *   An instance of `CarbonMarketSimulator` is used to run `simulateAtPrice()` with the specified carbon price, generating `SimulationResults`.
    *   A `PolicyScenario` object (containing a unique ID, name, carbon price, the simulation results, and a creation timestamp) is added to the component's state.
2.  **Scenario Management**:
    *   **Duplicate**: Users can duplicate an existing scenario, creating a new one with a similar name and identical results.
    *   **Delete**: Scenarios can be removed from the list.
    *   **Selection**: Users can select multiple scenarios using checkboxes for comparison.
3.  **Comparison Metrics**:
    *   When multiple scenarios are selected, the component calculates and displays aggregate metrics (e.g., average carbon price, average emissions reduced, price range) across the selected scenarios.
4.  **Export Comparison**:
    *   The `exportComparison` function leverages `ReportGenerator.compareScenarios()`.
    *   `ReportGenerator.compareScenarios` takes an array of `PolicyScenario` objects and generates a CSV string. This CSV includes key comparative metrics such as carbon price, total emissions reduced, and market balance for each selected scenario, formatted for easy analysis in spreadsheet software.
5.  **Output**: Displays a list of created scenarios, a summary of selected scenarios, and provides an option to export a detailed CSV comparison.

## Data and Constants

The application uses predefined sectoral and cost data, along with simulation constants, stored in `src/data/constants.ts`. These constants include:

*   `SECTORAL_DATA`: Baseline emissions, production, intensity, and target for various industrial sectors.
*   `COST_DATA`: Fixed costs, variable costs, and product prices for each sector.
*   `ELASTICITY_MAP`: Price elasticity of demand for each sector.
*   `ABATEMENT_COST_K`: A calibrated parameter for the abatement cost curve.
*   `EPSILON`: The convergence threshold for equilibrium calculations.
*   `MAX_ITERATIONS`: The maximum number of iterations for the bisection method.

These values can be modified within the `EquilibriumFinder` component's "Edit Data" mode to explore different market conditions.
