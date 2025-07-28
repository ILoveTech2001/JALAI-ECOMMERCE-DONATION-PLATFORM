import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = "JALAI - Buy, Sell & Donate in Cameroon | E-commerce & Charity Platform",
  description = "JALAI is Cameroon's leading platform for buying and selling pre-owned items while supporting orphanages. Shop electronics, clothing, furniture and donate to children in need with Mobile Money payments.",
  keywords = "e-commerce Cameroon, donation platform, buy sell used items, orphanage donations, second hand marketplace, mobile money payments, charity Cameroon",
  image = "https://jalai-platform.vercel.app/og-image.jpg",
  url = "https://jalai-platform.vercel.app/",
  type = "website",
  structuredData = null
}) => {
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "JALAI Platform",
    "description": description,
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${url}search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="JALAI Platform" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

// Pre-defined SEO configurations for different pages
export const SEOConfigs = {
  home: {
    title: "JALAI - Buy, Sell & Donate in Cameroon | E-commerce & Charity Platform",
    description: "Shop pre-owned electronics, clothing, furniture and support orphanages in Cameroon. Secure Mobile Money payments and meaningful donations in one platform.",
    keywords: "e-commerce Cameroon, donation platform, buy sell used items, orphanage donations, mobile money payments",
    url: "https://jalai-platform.vercel.app/"
  },
  
  products: {
    title: "Shop Pre-owned Items in Cameroon | Electronics, Clothing, Furniture - JALAI",
    description: "Browse quality pre-owned electronics, clothing, furniture and more in Cameroon. Secure shopping with Mobile Money payments on JALAI marketplace.",
    keywords: "buy used electronics Cameroon, second hand clothing, pre-owned furniture, mobile money shopping",
    url: "https://jalai-platform.vercel.app/products"
  },
  
  donations: {
    title: "Donate to Orphanages in Cameroon | Support Children in Need - JALAI",
    description: "Make a difference by donating to verified orphanages in Cameroon. Cash donations, item donations, and direct support for children in need.",
    keywords: "donate orphanages Cameroon, charity donations, support children Africa, orphanage donations online",
    url: "https://jalai-platform.vercel.app/donations"
  },
  
  sell: {
    title: "Sell Your Items in Cameroon | List Products for Free - JALAI",
    description: "Sell your pre-owned electronics, clothing, furniture and more on JALAI. Free listings, secure payments, and reach buyers across Cameroon.",
    keywords: "sell used items Cameroon, list products online, sell electronics clothing furniture",
    url: "https://jalai-platform.vercel.app/sell"
  },
  
  login: {
    title: "Login to JALAI | Access Your Account",
    description: "Login to your JALAI account to buy, sell, and donate. Secure access to Cameroon's leading e-commerce and charity platform.",
    keywords: "JALAI login, user account access, e-commerce login Cameroon",
    url: "https://jalai-platform.vercel.app/login"
  },
  
  signup: {
    title: "Join JALAI | Create Your Account | Buy, Sell & Donate in Cameroon",
    description: "Create your free JALAI account to start buying, selling, and donating in Cameroon. Join thousands of users making a difference.",
    keywords: "JALAI signup, create account, join marketplace Cameroon, register donation platform",
    url: "https://jalai-platform.vercel.app/signup"
  }
};

// Product-specific SEO generator
export const generateProductSEO = (product) => ({
  title: `${product.name} - ${product.category} for Sale in Cameroon | JALAI`,
  description: `Buy ${product.name} in ${product.category} category. ${product.description.substring(0, 120)}... Secure Mobile Money payments on JALAI.`,
  keywords: `${product.name}, ${product.category} Cameroon, buy ${product.category.toLowerCase()}, pre-owned ${product.category.toLowerCase()}`,
  url: `https://jalai-platform.vercel.app/products/${product.id}`,
  type: "product",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "XAF",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "JALAI Platform"
      }
    },
    "category": product.category,
    "condition": "https://schema.org/UsedCondition"
  }
});

// Orphanage-specific SEO generator
export const generateOrphanageSEO = (orphanage) => ({
  title: `Support ${orphanage.name} | Donate to Orphanage in Cameroon | JALAI`,
  description: `Help ${orphanage.name} in ${orphanage.location}. Make cash or item donations to support ${orphanage.currentOccupancy} children in need.`,
  keywords: `${orphanage.name}, orphanage donations ${orphanage.location}, support children Cameroon, charity ${orphanage.location}`,
  url: `https://jalai-platform.vercel.app/orphanages/${orphanage.id}`,
  type: "organization",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": orphanage.name,
    "description": orphanage.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": orphanage.location,
      "addressCountry": "CM"
    },
    "url": `https://jalai-platform.vercel.app/orphanages/${orphanage.id}`,
    "sameAs": orphanage.website ? [orphanage.website] : []
  }
});

export default SEOHead;
