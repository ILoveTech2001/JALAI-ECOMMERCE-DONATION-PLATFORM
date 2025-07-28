import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  loading = 'lazy',
  priority = false,
  placeholder = 'blur',
  quality = 75,
  sizes = '100vw',
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority || loading === 'eager');
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Generate responsive image URLs (if using a CDN like Cloudinary)
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';
    
    // For now, return the original src
    // In production, you'd generate different sizes:
    // return `${baseSrc}?w=320 320w, ${baseSrc}?w=640 640w, ${baseSrc}?w=1024 1024w`;
    return baseSrc;
  };

  // Placeholder while loading
  const PlaceholderDiv = () => (
    <div 
      className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
      style={{ width, height }}
      ref={imgRef}
    >
      <svg 
        className="w-8 h-8 text-gray-400" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
          clipRule="evenodd" 
        />
      </svg>
    </div>
  );

  // Error state
  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 border border-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
        ref={imgRef}
      >
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">Image failed to load</span>
        </div>
      </div>
    );
  }

  // Don't render image until it's in view (for lazy loading)
  if (!isInView) {
    return <PlaceholderDiv />;
  }

  return (
    <div className="relative" ref={imgRef}>
      {/* Placeholder shown while image is loading */}
      {!isLoaded && placeholder === 'blur' && <PlaceholderDiv />}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded && placeholder === 'blur' ? 'absolute inset-0 opacity-0' : ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

// Higher-order component for product images
export const ProductImage = ({ product, className = '', ...props }) => (
  <OptimizedImage
    src={product.imageUrl || '/placeholder-product.jpg'}
    alt={`${product.name} - ${product.category} for sale in Cameroon`}
    className={className}
    loading="lazy"
    quality={80}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    {...props}
  />
);

// Higher-order component for hero images
export const HeroImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={className}
    loading="eager"
    priority={true}
    quality={90}
    sizes="(max-width: 768px) 100vw, 50vw"
    {...props}
  />
);

// Higher-order component for avatar/profile images
export const AvatarImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src || '/default-avatar.jpg'}
    alt={alt}
    className={`rounded-full ${className}`}
    loading="lazy"
    quality={70}
    sizes="(max-width: 768px) 80px, 120px"
    {...props}
  />
);

export default OptimizedImage;
