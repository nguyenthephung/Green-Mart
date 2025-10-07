import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generatePageSEO } from '../utils/seo';

interface UseSEOProps {
  page?: string;
  data?: any;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export const useSEO = ({ page, data, title, description, keywords, image }: UseSEOProps = {}) => {
  const location = useLocation();

  useEffect(() => {
    // Auto-detect page if not provided
    const currentPage = page || location.pathname.split('/')[1] || 'home';
    
    // Generate SEO data
    const seoData = generatePageSEO(currentPage, data);
    
    // Override with custom data if provided
    const finalSEOData = {
      ...seoData,
      ...(title && { title }),
      ...(description && { description }),
      ...(keywords && { keywords }),
      ...(image && { image })
    };

    // Update document title
    document.title = finalSEOData.title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      if (!content) return;
      
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

    // Update basic meta tags
    updateMetaTag('description', finalSEOData.description);
    updateMetaTag('keywords', finalSEOData.keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', finalSEOData.title, true);
    updateMetaTag('og:description', finalSEOData.description, true);
    updateMetaTag('og:image', finalSEOData.image, true);
    updateMetaTag('og:url', `https://greenmart.vn${location.pathname}`, true);
    
    // Update Twitter tags
    updateMetaTag('twitter:title', finalSEOData.title, true);
    updateMetaTag('twitter:description', finalSEOData.description, true);
    updateMetaTag('twitter:image', finalSEOData.image, true);

    // Update canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalElement) {
      canonicalElement.href = `https://greenmart.vn${location.pathname}`;
    }

    // Add structured data if available
    if ('structuredData' in finalSEOData && finalSEOData.structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]#page-structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-structured-data';
      script.textContent = JSON.stringify(finalSEOData.structuredData);
      document.head.appendChild(script);
    }

  }, [page, data, title, description, keywords, image, location.pathname]);
};

export default useSEO;