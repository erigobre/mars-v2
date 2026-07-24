import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';

export function usePageBreadcrumbs(steps: { label: string; to?: string }[]) {
  const setBreadcrumbs = useUIStore((s) => s.setBreadcrumbs);
  const resetBreadcrumbs = useUIStore((s) => s.resetBreadcrumbs);

  useEffect(() => {
    if (steps.length > 0) {
      setBreadcrumbs(steps);
    }
    return () => resetBreadcrumbs();
  }, [JSON.stringify(steps), setBreadcrumbs, resetBreadcrumbs]);
}