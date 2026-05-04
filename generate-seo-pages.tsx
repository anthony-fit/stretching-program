import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './src/App.tsx';
import { VERIFIED_EXERCISES } from './src/constants/exercises.ts';
import { slugify } from './src/utils/slugify.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('Running SEO prerendering via single process...');

  const routes = [
    '/', 
    '/stretch',
    '/privacy-policy',
    '/terms',
    '/contact',
    '/how-to-stretch'
  ];
  
  const SEO_MODIFIERS = [
    "tight",
    "pain",
    "morning",
    "beginner",
    "flexibility"
  ];

  Object.values(VERIFIED_EXERCISES).forEach(exercise => {
    routes.push(`/exercise/${slugify(exercise.name)}`);
    routes.push(`/stretch/${slugify(exercise.name)}`);
    SEO_MODIFIERS.forEach(modifier => {
      routes.push(`/stretch/${slugify(exercise.name)}/${modifier}`);
    });
  });

  const distDir = path.join(__dirname, 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('dist/index.html not found. This generally means build step failed.');
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  routes.forEach(route => {
    const htmlContent = renderToString(
      <StaticRouter location={route}>
        <App />
      </StaticRouter>
    );

    const isHome = route === '/';
    const filePath = isHome 
      ? path.join(distDir, 'index.html') 
      : path.join(distDir, route.substring(1), 'index.html');
      
    // Inject rendered html into <div id="root"></div>
    const finalHtml = baseHtml.replace('<div id="root"></div>', `<div id="root">${htmlContent}</div>`);
    
    // Create directory if it doesn't exist
    const targetDir = path.dirname(filePath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, finalHtml);
    console.log(`Generated HTML for ${route} at ${filePath}`);
  });
  
  console.log('SEO PRERENDERING SUCCESS!');
  process.exit(0);
} catch (error) {
  console.error('Error during SEO prerendering:', error);
  process.exit(1);
}
