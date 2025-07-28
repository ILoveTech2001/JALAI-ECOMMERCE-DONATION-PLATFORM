import React, { useState, useEffect } from 'react';

const SEOMonitor = () => {
  const [seoData, setSeoData] = useState({
    pageTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogTags: {},
    structuredData: [],
    images: [],
    links: [],
    performance: {},
    errors: []
  });

  useEffect(() => {
    analyzePage();
  }, []);

  const analyzePage = () => {
    const analysis = {
      pageTitle: document.title,
      metaDescription: getMetaContent('description'),
      canonicalUrl: getCanonicalUrl(),
      ogTags: getOpenGraphTags(),
      structuredData: getStructuredData(),
      images: analyzeImages(),
      links: analyzeLinks(),
      performance: getPerformanceMetrics(),
      errors: validateSEO()
    };

    setSeoData(analysis);
  };

  const getMetaContent = (name) => {
    const meta = document.querySelector(`meta[name="${name}"]`) || 
                 document.querySelector(`meta[property="og:${name}"]`);
    return meta ? meta.getAttribute('content') : '';
  };

  const getCanonicalUrl = () => {
    const canonical = document.querySelector('link[rel="canonical"]');
    return canonical ? canonical.getAttribute('href') : window.location.href;
  };

  const getOpenGraphTags = () => {
    const ogTags = {};
    const metaTags = document.querySelectorAll('meta[property^="og:"]');
    metaTags.forEach(tag => {
      const property = tag.getAttribute('property').replace('og:', '');
      ogTags[property] = tag.getAttribute('content');
    });
    return ogTags;
  };

  const getStructuredData = () => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const structuredData = [];
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        structuredData.push(data);
      } catch (e) {
        console.error('Invalid structured data:', e);
      }
    });
    return structuredData;
  };

  const analyzeImages = () => {
    const images = document.querySelectorAll('img');
    const imageAnalysis = [];
    images.forEach((img, index) => {
      imageAnalysis.push({
        index,
        src: img.src,
        alt: img.alt,
        hasAlt: !!img.alt,
        loading: img.loading,
        width: img.width,
        height: img.height
      });
    });
    return imageAnalysis;
  };

  const analyzeLinks = () => {
    const links = document.querySelectorAll('a');
    const linkAnalysis = [];
    links.forEach((link, index) => {
      linkAnalysis.push({
        index,
        href: link.href,
        text: link.textContent.trim(),
        hasText: !!link.textContent.trim(),
        isExternal: link.hostname !== window.location.hostname,
        hasNofollow: link.rel.includes('nofollow')
      });
    });
    return linkAnalysis;
  };

  const getPerformanceMetrics = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 0,
        domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) : 0,
        firstPaint: getFirstPaint(),
        firstContentfulPaint: getFirstContentfulPaint()
      };
    }
    return {};
  };

  const getFirstPaint = () => {
    const paintEntries = performance.getEntriesByType('paint');
    const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
    return fpEntry ? Math.round(fpEntry.startTime) : 0;
  };

  const getFirstContentfulPaint = () => {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? Math.round(fcpEntry.startTime) : 0;
  };

  const validateSEO = () => {
    const errors = [];

    // Title validation
    if (!document.title) {
      errors.push({ type: 'error', message: 'Missing page title' });
    } else if (document.title.length > 60) {
      errors.push({ type: 'warning', message: 'Page title too long (>60 characters)' });
    }

    // Meta description validation
    const metaDesc = getMetaContent('description');
    if (!metaDesc) {
      errors.push({ type: 'error', message: 'Missing meta description' });
    } else if (metaDesc.length > 160) {
      errors.push({ type: 'warning', message: 'Meta description too long (>160 characters)' });
    }

    // Image alt text validation
    const imagesWithoutAlt = seoData.images.filter(img => !img.hasAlt);
    if (imagesWithoutAlt.length > 0) {
      errors.push({ type: 'warning', message: `${imagesWithoutAlt.length} images missing alt text` });
    }

    // Heading structure validation
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count === 0) {
      errors.push({ type: 'error', message: 'Missing H1 tag' });
    } else if (h1Count > 1) {
      errors.push({ type: 'warning', message: 'Multiple H1 tags found' });
    }

    return errors;
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">SEO Monitor</h3>
          <button
            onClick={analyzePage}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>

        {/* Basic SEO Info */}
        <div className="space-y-2 mb-4">
          <div className="text-xs">
            <strong>Title:</strong> {seoData.pageTitle.substring(0, 50)}...
          </div>
          <div className="text-xs">
            <strong>Description:</strong> {seoData.metaDescription.substring(0, 50)}...
          </div>
          <div className="text-xs">
            <strong>Images:</strong> {seoData.images.length} total, {seoData.images.filter(img => !img.hasAlt).length} missing alt
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-900 mb-2">Performance</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Load: {seoData.performance.loadTime}ms</div>
            <div>FCP: {seoData.performance.firstContentfulPaint}ms</div>
          </div>
        </div>

        {/* SEO Issues */}
        {seoData.errors.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-900 mb-2">Issues</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {seoData.errors.map((error, index) => (
                <div key={index} className={`text-xs p-2 rounded ${getStatusColor(error.type)}`}>
                  {error.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-t text-xs space-y-1">
          <div><strong>Structured Data:</strong> {seoData.structuredData.length} schemas</div>
          <div><strong>OG Tags:</strong> {Object.keys(seoData.ogTags).length} tags</div>
          <div><strong>Canonical:</strong> {seoData.canonicalUrl ? '✓' : '✗'}</div>
        </div>
      </div>
    </div>
  );
};

export default SEOMonitor;
