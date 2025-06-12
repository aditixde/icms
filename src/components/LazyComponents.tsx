import { lazy } from 'react';

// Lazy load heavy components
export const PriceSimulator = lazy(() => import('./PriceSimulator').then(module => ({ default: module.PriceSimulator })));
export const EquilibriumFinder = lazy(() => import('./EquilibriumFinder').then(module => ({ default: module.EquilibriumFinder })));
export const ScenarioComparison = lazy(() => import('./ScenarioComparison').then(module => ({ default: module.ScenarioComparison })));
export const ExportModal = lazy(() => import('./ExportModal').then(module => ({ default: module.ExportModal })));