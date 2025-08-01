import React from 'react';

const SocialShare = ({ 
  url = window.location.href, 
  title = "Check out JALAI Platform", 
  description = "Buy, sell and donate in Cameroon",
  image = "https://jalai-platform.vercel.app/og-image.jpg",
  className = "",
  showLabels = true 
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(image);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=JALAI,Cameroon,Ecommerce,Donation`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };

  const handleShare = (platform) => {
    if (navigator.share && platform === 'native') {
      navigator.share({
        title: title,
        text: description,
        url: url,
      }).catch(console.error);
    } else {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    }
  };

  const SocialIcon = ({ platform, children, label }) => (
    <button
      onClick={() => handleShare(platform)}
      className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:scale-105 ${getSocialColor(platform)} ${className}`}
      title={`Share on ${label}`}
      aria-label={`Share on ${label}`}
    >
      {children}
      {showLabels && <span className="ml-2 text-sm font-medium">{label}</span>}
    </button>
  );

  const getSocialColor = (platform) => {
    const colors = {
      facebook: 'bg-blue-600 hover:bg-blue-700 text-white',
      twitter: 'bg-sky-500 hover:bg-sky-600 text-white',
      whatsapp: 'bg-green-500 hover:bg-green-600 text-white',
      telegram: 'bg-blue-500 hover:bg-blue-600 text-white',
      linkedin: 'bg-blue-700 hover:bg-blue-800 text-white',
      email: 'bg-gray-600 hover:bg-gray-700 text-white',
      native: 'bg-purple-600 hover:bg-purple-700 text-white'
    };
    return colors[platform] || 'bg-gray-500 hover:bg-gray-600 text-white';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Native Share (if supported) */}
      {navigator.share && (
        <SocialIcon platform="native" label="Share">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </SocialIcon>
      )}

      {/* Facebook */}
      <SocialIcon platform="facebook" label="Facebook">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </SocialIcon>

      {/* Twitter */}
      <SocialIcon platform="twitter" label="Twitter">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      </SocialIcon>

      {/* WhatsApp */}
      <SocialIcon platform="whatsapp" label="WhatsApp">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </SocialIcon>

      {/* LinkedIn */}
      <SocialIcon platform="linkedin" label="LinkedIn">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </SocialIcon>

      {/* Email */}
      <SocialIcon platform="email" label="Email">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      </SocialIcon>
    </div>
  );
};

// Product-specific share component
export const ProductShare = ({ product }) => (
  <SocialShare
    url={`https://jalai-platform.vercel.app/products/${product.id}`}
    title={`${product.name} - Available on JALAI`}
    description={`Check out this ${product.category.toLowerCase()} for ${product.price} XAF on JALAI marketplace in Cameroon`}
    image={product.imageUrl}
    showLabels={false}
    className="w-8 h-8"
  />
);

// Orphanage-specific share component  
export const OrphanageShare = ({ orphanage }) => (
  <SocialShare
    url={`https://jalai-platform.vercel.app/orphanages/${orphanage.id}`}
    title={`Support ${orphanage.name} - JALAI`}
    description={`Help ${orphanage.name} in ${orphanage.location} by making a donation through JALAI platform`}
    showLabels={false}
    className="w-8 h-8"
  />
);

export default SocialShare;
