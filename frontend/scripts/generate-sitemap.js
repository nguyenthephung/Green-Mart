#!/usr/bin/env node

/**
 * Automatic Sitemap Generator for GreenMart
 * Generates sitemap.xml based on routes and dynamic data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base configuration
const config = {
  baseUrl: 'https://greenmart.vn',
  outputPath: '../public/sitemap.xml',
  changefreq: {
    daily: ['/', '/home', '/products', '/categories'],
    weekly: ['/search', '/order-tracking'],
    monthly: ['/about', '/contact', '/login', '/register']
  },
  priority: {
    high: ['/', '/home'],
    medium: ['/products', '/categories', '/search'],
    low: ['/about', '/contact', '/login', '/register']
  }
};

// Static routes
const staticRoutes = [
  { url: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '1.0' },
  { url: '/home', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
  { url: '/about', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.8' },
  { url: '/contact', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.7' },
  { url: '/search', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.8' },
  { url: '/login', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.5' },
  { url: '/register', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.5' },
  { url: '/order-tracking', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.6' }
];

// Category routes
const categoryRoutes = [
  { url: '/category/vegetables', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
  { url: '/category/fruits', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
  { url: '/category/meat', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
  { url: '/category/milk', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
  { url: '/category/organic', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' }
];

// Generate XML
function generateSitemap() {
  const allRoutes = [...staticRoutes, ...categoryRoutes];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

`;

  allRoutes.forEach(route => {
    xml += `  <url>
    <loc>${config.baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>

`;
  });

  xml += `</urlset>`;

  // Write to file
  fs.writeFileSync(path.join(__dirname, config.outputPath), xml, 'utf8');
  console.log(`✅ Sitemap generated successfully at ${config.outputPath}`);
  console.log(`📊 Total URLs: ${allRoutes.length}`);
}

// Run generator
generateSitemap();