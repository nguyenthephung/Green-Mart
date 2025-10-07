import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: any;
}

const SEO: React.FC<SEOProps> = ({
  title = 'GreenMart - Thực phẩm tươi ngon, hữu cơ chất lượng cao',
  description = 'GreenMart - Nền tảng thương mại điện tử hàng đầu về thực phẩm tươi ngon, hữu cơ. Rau củ quả tươi, thịt sạch, sữa tươi, giao hàng nhanh chóng tận nhà.',
  keywords = 'greenmart, thực phẩm hữu cơ, rau củ quả tươi, thịt sạch, sữa tươi, thực phẩm online, giao hàng nhanh',
  image = '/logo.jpg',
  url,
  type = 'website',
  structuredData
}) => {
  const location = useLocation();
  const currentUrl = url || `https://greenmart.vn${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);
    
    // Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:url', currentUrl, true);

    // Update canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalElement) {
      canonicalElement.href = currentUrl;
    } else {
      canonicalElement = document.createElement('link');
      canonicalElement.rel = 'canonical';
      canonicalElement.href = currentUrl;
      document.head.appendChild(canonicalElement);
    }

    // Add structured data if provided
    if (structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]#dynamic-structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'dynamic-structured-data';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, image, currentUrl, type, structuredData]);

  return null;
};

export default SEO;