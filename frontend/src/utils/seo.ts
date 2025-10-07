// SEO utilities and configurations

export const seoConfig = {
  defaultTitle: 'GreenMart - Thực phẩm tươi ngon, hữu cơ chất lượng cao',
  defaultDescription: 'GreenMart - Nền tảng thương mại điện tử hàng đầu về thực phẩm tươi ngon, hữu cơ. Rau củ quả tươi, thịt sạch, sữa tươi, giao hàng nhanh chóng tận nhà.',
  defaultKeywords: 'greenmart, thực phẩm hữu cơ, rau củ quả tươi, thịt sạch, sữa tươi, thực phẩm online, giao hàng nhanh, an toàn thực phẩm, organic food vietnam',
  siteName: 'GreenMart',
  siteUrl: 'https://greenmart.vn',
  defaultImage: '/logo.jpg',
  social: {
    facebook: 'https://facebook.com/greenmart.vn',
    instagram: 'https://instagram.com/greenmart.vn',
    youtube: 'https://youtube.com/greenmartvn'
  }
};

// Generate page-specific SEO data
export const generatePageSEO = (page: string, data?: any) => {
  const baseConfig = {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    keywords: seoConfig.defaultKeywords,
    image: seoConfig.defaultImage
  };

  switch (page) {
    case 'home':
      return {
        ...baseConfig,
        title: 'GreenMart - Trang chủ | Thực phẩm tươi ngon, hữu cơ',
        description: 'Khám phá GreenMart - siêu thị online hàng đầu về thực phẩm tươi ngon. Rau củ quả hữu cơ, thịt sạch, sữa tươi với giá ưu đãi. Giao hàng nhanh tận nhà.',
        keywords: 'greenmart trang chủ, siêu thị online, thực phẩm tươi, rau hữu cơ, giao hàng nhanh',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "GreenMart",
          "url": "https://greenmart.vn",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://greenmart.vn/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }
      };

    case 'about':
      return {
        ...baseConfig,
        title: 'Về GreenMart - Câu chuyện thương hiệu thực phẩm hữu cơ',
        description: 'Tìm hiểu về GreenMart - thương hiệu thực phẩm hữu cơ uy tín. Sứ mệnh mang đến thực phẩm an toàn, chất lượng cho mọi gia đình Việt Nam.',
        keywords: 'về greenmart, thương hiệu thực phẩm, sứ mệnh, tầm nhìn, thực phẩm an toàn'
      };

    case 'products':
      return {
        ...baseConfig,
        title: 'Sản phẩm GreenMart - Thực phẩm tươi ngon, chất lượng cao',
        description: 'Khám phá hàng nghìn sản phẩm thực phẩm tươi ngon tại GreenMart. Rau củ quả hữu cơ, thịt sạch, sữa tươi với giá tốt nhất thị trường.',
        keywords: 'sản phẩm greenmart, thực phẩm hữu cơ, rau củ quả, thịt sạch, sữa tươi',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Sản phẩm GreenMart",
          "description": "Bộ sưu tập đầy đủ các sản phẩm thực phẩm tươi ngon, hữu cơ"
        }
      };

    case 'product-detail':
      if (data?.product) {
        return {
          ...baseConfig,
          title: `${data.product.name} - GreenMart | Giá tốt, chất lượng cao`,
          description: `Mua ${data.product.name} chính hãng tại GreenMart. ${data.product.description || 'Sản phẩm chất lượng cao, giá ưu đãi'} - Giao hàng nhanh, đảm bảo tươi ngon.`,
          keywords: `${data.product.name}, mua ${data.product.name}, ${data.product.category}, thực phẩm tươi`,
          image: data.product.image || baseConfig.image,
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": data.product.name,
            "image": data.product.image,
            "description": data.product.description,
            "offers": {
              "@type": "Offer",
              "price": data.product.price,
              "priceCurrency": "VND",
              "availability": data.product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "GreenMart"
              }
            }
          }
        };
      }
      break;

    case 'category':
      if (data?.category) {
        return {
          ...baseConfig,
          title: `${data.category.name} - GreenMart | Thực phẩm chất lượng cao`,
          description: `Khám phá bộ sưu tập ${data.category.name} tại GreenMart. ${data.category.description || 'Sản phẩm tươi ngon, chất lượng cao'} với giá ưu đãi nhất.`,
          keywords: `${data.category.name}, danh mục ${data.category.name}, thực phẩm ${data.category.name}`,
          structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": data.category.name,
            "description": data.category.description
          }
        };
      }
      break;

    case 'search':
      const searchTerm = data?.searchTerm || '';
      return {
        ...baseConfig,
        title: searchTerm ? `Tìm kiếm "${searchTerm}" - GreenMart` : 'Tìm kiếm sản phẩm - GreenMart',
        description: searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}" tại GreenMart. Tìm thấy các sản phẩm thực phẩm tươi ngon, chất lượng cao.` : 'Tìm kiếm sản phẩm thực phẩm tươi ngon tại GreenMart.',
        keywords: searchTerm ? `tìm kiếm ${searchTerm}, ${searchTerm} greenmart` : 'tìm kiếm sản phẩm, thực phẩm'
      };

    case 'cart':
      return {
        ...baseConfig,
        title: 'Giỏ hàng - GreenMart | Thanh toán nhanh chóng',
        description: 'Xem lại giỏ hàng và thanh toán đơn hàng tại GreenMart. Nhiều phương thức thanh toán tiện lợi, giao hàng nhanh.',
        keywords: 'giỏ hàng greenmart, thanh toán, đặt hàng thực phẩm'
      };

    case 'order-tracking':
      return {
        ...baseConfig,
        title: 'Theo dõi đơn hàng - GreenMart | Kiểm tra trạng thái giao hàng',
        description: 'Theo dõi trạng thái đơn hàng GreenMart một cách dễ dàng. Cập nhật realtime về quá trình giao hàng.',
        keywords: 'theo dõi đơn hàng, trạng thái giao hàng, kiểm tra đơn hàng greenmart'
      };

    default:
      return baseConfig;
  }

  return baseConfig;
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://greenmart.vn${item.url}`
    }))
  };
};