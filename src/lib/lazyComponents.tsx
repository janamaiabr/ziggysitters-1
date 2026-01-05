import { lazy, Suspense, ComponentType, ReactNode } from 'react';

interface LazyComponentProps {
  fallback?: ReactNode;
}

// Loading skeleton for lazy components
const LoadingSkeleton = () => (
  <div className="animate-pulse bg-muted rounded-lg h-32 w-full" />
);

// Utility function to create lazy-loaded components with error boundaries
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ReactNode = <LoadingSkeleton />
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Pre-built lazy components for common heavy components
export const LazyBookingFormDirect = createLazyComponent(
  () => import('@/components/booking/BookingFormDirect')
);

export const LazyEnhancedSitterCard = createLazyComponent(
  () => import('@/components/search/EnhancedSitterCard')
);

export const LazyCalendar = createLazyComponent(
  () => import('@/components/ui/calendar').then(m => ({ default: m.Calendar }))
);

// Heavy admin components
export const LazyClickHeatmap = createLazyComponent(
  () => import('@/components/admin/ClickHeatmap')
);

export const LazyConversionFunnel = createLazyComponent(
  () => import('@/components/admin/ConversionFunnel')
);

export const LazySessionReplayViewer = createLazyComponent(
  () => import('@/components/admin/SessionReplayViewer')
);
