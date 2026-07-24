import { create } from 'zustand';

interface BreadcrumbStep {
  label: string;
  to?: string;
}

interface UIState {
  breadcrumbs: BreadcrumbStep[];
  setBreadcrumbs: (steps: BreadcrumbStep[]) => void;
  resetBreadcrumbs: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  breadcrumbs: [],
  setBreadcrumbs: (steps) => set({ breadcrumbs: steps }),
  resetBreadcrumbs: () => set({ breadcrumbs: [] }),
}));