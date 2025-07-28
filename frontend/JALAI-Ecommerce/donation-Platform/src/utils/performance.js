// Performance monitoring utilities for Core Web Vitals

// Measure and report Core Web Vitals
export const measureCoreWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  const measureLCP = () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics (replace with your analytics service)
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            event_category: 'Performance'
          });
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  };

  // First Input Delay (FID)
  const measureFID = () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(entry.processingStart - entry.startTime),
              event_category: 'Performance'
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  };

  // Cumulative Layout Shift (CLS)
  const measureCLS = () => {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        console.log('CLS:', clsValue);
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Performance'
          });
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  };

  // Time to First Byte (TTFB)
  const measureTTFB = () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        console.log('TTFB:', ttfb);
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'TTFB',
            value: Math.round(ttfb),
            event_category: 'Performance'
          });
        }
      }
    }
  };

  // Initialize measurements
  measureLCP();
  measureFID();
  measureCLS();
  measureTTFB();
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    { href: '/jalai-logo.svg', as: 'image' },
    { href: '/hand-shake.jpg', as: 'image' },
    { href: '/kids-smiling.jpeg', as: 'image' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    document.head.appendChild(link);
  });
};

// Lazy load non-critical resources
export const lazyLoadResources = () => {
  // Lazy load images that are not immediately visible
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
};

// Optimize font loading
export const optimizeFontLoading = () => {
  // Preload critical fonts
  const criticalFonts = [
    '/fonts/inter-var.woff2'
  ];

  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Minimize main thread blocking
export const optimizeMainThread = () => {
  // Use requestIdleCallback for non-critical tasks
  const runWhenIdle = (callback) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback);
    } else {
      setTimeout(callback, 1);
    }
  };

  // Example: Initialize non-critical features when idle
  runWhenIdle(() => {
    // Initialize analytics
    if (typeof window !== 'undefined' && !window.gtag) {
      // Load Google Analytics when idle
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);
    }
  });
};

// Resource hints for better performance
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//jalai-ecommerce-donation-platform-3.onrender.com' },
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://jalai-ecommerce-donation-platform-3.onrender.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
    document.head.appendChild(link);
  });
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Run immediately
  addResourceHints();
  preloadCriticalResources();
  optimizeFontLoading();

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      lazyLoadResources();
      optimizeMainThread();
    });
  } else {
    lazyLoadResources();
    optimizeMainThread();
  }

  // Measure performance after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      measureCoreWebVitals();
    }, 1000);
  });
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};
