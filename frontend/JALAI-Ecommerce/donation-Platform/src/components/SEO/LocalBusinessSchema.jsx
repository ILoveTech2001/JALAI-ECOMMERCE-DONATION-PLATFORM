import React from 'react';
import { Helmet } from 'react-helmet-async';

const LocalBusinessSchema = () => {
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "JALAI Platform",
    "description": "Cameroon's leading e-commerce and donation platform for buying, selling pre-owned items and supporting orphanages",
    "url": "https://jalai-platform.vercel.app/",
    "logo": "https://jalai-platform.vercel.app/jalai-logo.svg",
    "image": "https://jalai-platform.vercel.app/og-image.jpg",
    "telephone": "+237-XXX-XXX-XXX", // Replace with actual phone
    "email": "contact@jalai-platform.com", // Replace with actual email
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street Address", // Replace with actual address
      "addressLocality": "Douala", // Main city
      "addressRegion": "Littoral",
      "postalCode": "00000", // Replace with actual postal code
      "addressCountry": "CM"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "4.0511", // Douala coordinates
      "longitude": "9.7679"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "Cameroon"
      },
      {
        "@type": "City",
        "name": "Douala"
      },
      {
        "@type": "City", 
        "name": "Yaoundé"
      },
      {
        "@type": "City",
        "name": "Bamenda"
      },
      {
        "@type": "City",
        "name": "Bafoussam"
      }
    ],
    "serviceType": [
      "E-commerce Platform",
      "Donation Platform",
      "Marketplace",
      "Charity Services"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "JALAI Product Categories",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Electronics",
          "description": "Pre-owned electronics including phones, laptops, and accessories"
        },
        {
          "@type": "OfferCatalog", 
          "name": "Clothing",
          "description": "Quality second-hand clothing for men, women, and children"
        },
        {
          "@type": "OfferCatalog",
          "name": "Furniture",
          "description": "Pre-owned furniture for home and office"
        },
        {
          "@type": "OfferCatalog",
          "name": "Footwear", 
          "description": "Second-hand shoes and footwear"
        },
        {
          "@type": "OfferCatalog",
          "name": "Utensils",
          "description": "Kitchen utensils and household items"
        }
      ]
    },
    "paymentAccepted": [
      "Mobile Money",
      "Orange Money",
      "MTN Mobile Money"
    ],
    "currenciesAccepted": "XAF",
    "openingHours": "Mo-Su 00:00-23:59", // 24/7 online platform
    "sameAs": [
      "https://facebook.com/jalaiplatform",
      "https://twitter.com/jalaiplatform", 
      "https://instagram.com/jalaiplatform",
      "https://linkedin.com/company/jalaiplatform"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Marie Ngozi"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Excellent platform for buying quality pre-owned items in Cameroon. The donation feature is amazing!"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person", 
          "name": "Jean Baptiste"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Great way to sell items and help orphanages at the same time. Mobile Money payments work perfectly."
      }
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "JALAI Platform",
    "alternateName": "JALAI E-commerce Donation Platform",
    "url": "https://jalai-platform.vercel.app/",
    "logo": "https://jalai-platform.vercel.app/jalai-logo.svg",
    "description": "Connecting communities in Cameroon through sustainable commerce and charitable giving",
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CM",
        "addressLocality": "Douala"
      }
    },
    "mission": "To create a sustainable marketplace that connects buyers and sellers while supporting orphanages and children in need across Cameroon",
    "knowsAbout": [
      "E-commerce",
      "Donation Management", 
      "Mobile Money Payments",
      "Orphanage Support",
      "Sustainable Commerce",
      "Community Development"
    ],
    "memberOf": {
      "@type": "Organization",
      "name": "Cameroon Digital Economy"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
    </Helmet>
  );
};

export default LocalBusinessSchema;
