import { useState, useEffect, useRef, ReactNode, Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

// Optimized Intersection Observer with performance monitoring
export const LazyLoader = ({ 
  children, 
  fallback, 
  threshold = 0.1, 
  rootMargin = '50px',
  triggerOnce = true,
  delay = 0
}: LazyLoaderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Performance monitoring
    const startTime = performance.now();

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              // Measure lazy loading performance
              const loadTime = performance.now() - startTime;
              if (loadTime > 100) {
                console.warn(`Lazy loading took ${loadTime.toFixed(2)}ms - consider optimization`);
              }
            }, delay);
          } else {
            setIsVisible(true);
          }

          if (triggerOnce) {
            observer.unobserve(element);
            observerRef.current = null;
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, delay]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={elementRef} className="lazy-loader">
      {isVisible ? (
        <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div onLoad={handleLoad}>
            {children}
          </div>
        </div>
      ) : (
        fallback || <DefaultSkeleton />
      )}
    </div>
  );
};

// Default skeleton fallback
const DefaultSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </CardContent>
  </Card>
);

// Lazy loading hook for components
export const useLazyLoading = (initialLoad = 3, increment = 3) => {
  const [visibleItems, setVisibleItems] = useState(initialLoad);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 200));
    setVisibleItems(prev => prev + increment);
    setIsLoading(false);
  };

  const reset = () => {
    setVisibleItems(initialLoad);
    setIsLoading(false);
  };

  return {
    visibleItems,
    isLoading,
    loadMore,
    reset
  };
};

// Optimized image lazy loading component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Preload the actual image
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
            onLoad?.();
          };
          img.onerror = () => {
            setHasError(true);
            onError?.();
          };
          img.src = src;
          
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-50'
      } ${hasError ? 'bg-muted' : ''} ${className}`}
      loading="lazy"
    />
  );
};

// Batch lazy loading for lists
interface BatchLazyLoaderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  batchSize?: number;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  className?: string;
}

export function BatchLazyLoader<T>({ 
  items, 
  renderItem, 
  batchSize = 5,
  loadingComponent,
  emptyComponent,
  className = ''
}: BatchLazyLoaderProps<T>) {
  const { visibleItems, isLoading, loadMore } = useLazyLoading(batchSize, batchSize);
  const [isNearEnd, setIsNearEnd] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && visibleItems < items.length) {
          setIsNearEnd(true);
          loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, visibleItems, items.length, loadMore]);

  if (items.length === 0) {
    return <div className={className}>{emptyComponent || <div>No items to display</div>}</div>;
  }

  return (
    <div className={className}>
      {items.slice(0, visibleItems).map((item, index) => (
        <Suspense key={index} fallback={<DefaultSkeleton />}>
          {renderItem(item, index)}
        </Suspense>
      ))}
      
      {/* Loading trigger */}
      {visibleItems < items.length && (
        <div ref={triggerRef} className="py-4">
          {isLoading ? (
            loadingComponent || (
              <div className="flex justify-center">
                <div className="animate-pulse">Loading more...</div>
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}

// Performance monitoring utilities
export const performanceMonitor = {
  measureLazyLoad: (componentName: string) => {
    const startTime = performance.now();
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`${componentName} lazy load took ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  },

  trackVisibilityChange: (elementId: string, callback: (isVisible: boolean) => void) => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        callback(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }
};