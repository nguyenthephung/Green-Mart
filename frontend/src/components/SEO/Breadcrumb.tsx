import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';
import { generateBreadcrumbStructuredData } from '../../utils/seo';

export interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  // Add structured data to head
  React.useEffect(() => {
    const structuredData = generateBreadcrumbStructuredData(items);
    
    const existingScript = document.querySelector('script[type="application/ld+json"]#breadcrumb-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumb-structured-data';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]#breadcrumb-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {/* Home icon */}
        <li>
          <div>
            <Link 
              to="/home" 
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Trang chủ"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Trang chủ</span>
            </Link>
          </div>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={item.url}>
            <div className="flex items-center">
              <ChevronRightIcon 
                className="h-5 w-5 flex-shrink-0 text-gray-400" 
                aria-hidden="true" 
              />
              
              {item.current || index === items.length - 1 ? (
                <span 
                  className="ml-2 text-sm font-medium text-gray-500 truncate max-w-[200px]"
                  aria-current="page"
                  title={item.name}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[200px]"
                  title={item.name}
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;