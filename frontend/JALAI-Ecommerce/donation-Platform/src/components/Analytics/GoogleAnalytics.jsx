import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Replace with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          'custom_dimension_1': 'user_type',
          'custom_dimension_2': 'page_category'
        }
      });
    `;
    document.head.appendChild(script2);

    // Make gtag available globally
    window.gtag = window.gtag || function() {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(arguments);
    };

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  // Track page views
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
};

// Analytics event tracking functions
export const trackEvent = (eventName, parameters = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: parameters.category || 'General',
      event_label: parameters.label,
      value: parameters.value,
      custom_dimension_1: parameters.user_type,
      custom_dimension_2: parameters.page_category,
      ...parameters
    });
  }
};

// E-commerce tracking
export const trackPurchase = (transactionData) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionData.transaction_id,
      value: transactionData.value,
      currency: 'XAF',
      items: transactionData.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price
      }))
    });
  }
};

// Product view tracking
export const trackProductView = (product) => {
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'XAF',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        price: product.price
      }]
    });
  }
};

// Add to cart tracking
export const trackAddToCart = (product, quantity = 1) => {
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'XAF',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: quantity,
        price: product.price
      }]
    });
  }
};

// Donation tracking
export const trackDonation = (donationData) => {
  if (window.gtag) {
    window.gtag('event', 'donation', {
      event_category: 'Charity',
      event_label: donationData.orphanage_name,
      value: donationData.amount,
      currency: 'XAF',
      custom_dimension_1: 'donor',
      custom_dimension_2: 'donation_page'
    });
  }
};

// User registration tracking
export const trackUserRegistration = (userType) => {
  if (window.gtag) {
    window.gtag('event', 'sign_up', {
      method: 'email',
      event_category: 'User',
      event_label: userType,
      custom_dimension_1: userType
    });
  }
};

// Search tracking
export const trackSearch = (searchTerm, category = null) => {
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      event_category: 'Search',
      event_label: category || 'all_categories'
    });
  }
};

// Social share tracking
export const trackSocialShare = (platform, contentType, contentId) => {
  if (window.gtag) {
    window.gtag('event', 'share', {
      method: platform,
      content_type: contentType,
      content_id: contentId,
      event_category: 'Social'
    });
  }
};

// Form submission tracking
export const trackFormSubmission = (formName, success = true) => {
  if (window.gtag) {
    window.gtag('event', success ? 'form_submit_success' : 'form_submit_error', {
      event_category: 'Form',
      event_label: formName
    });
  }
};

// Page engagement tracking
export const trackPageEngagement = (engagementType, value) => {
  if (window.gtag) {
    window.gtag('event', 'engagement', {
      engagement_time_msec: value,
      event_category: 'Engagement',
      event_label: engagementType
    });
  }
};

// Error tracking
export const trackError = (errorType, errorMessage, page) => {
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      event_category: 'Error',
      event_label: page
    });
  }
};

// Performance tracking
export const trackPerformance = (metricName, value) => {
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metricName,
      value: Math.round(value),
      event_category: 'Performance'
    });
  }
};

export default GoogleAnalytics;
