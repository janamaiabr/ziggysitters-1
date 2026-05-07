import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
}

export default function SEOHead({
  title,
  description,
  keywords = 'pet sitters, pet care, Auckland, Hamilton, daily reports, pet sitting, pet boarding, cat sitting, drop-in visits',
  canonical,
  ogImage = '/assets/hero-image.jpg',
  ogType = 'website',
  structuredData
}: SEOHeadProps) {
  const fullTitle = title.includes('ZiggySitters') ? title : `${title} | ZiggySitters - Pet Sitters with Daily Updates`;
  const siteUrl = 'https://ziggysitters.com';
  const normalizeCanonical = (value?: string) => {
    if (!value) return undefined;
    const raw = value.startsWith('http') ? value : `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
    return raw
      .replace('https://www.ziggysitters.com', siteUrl)
      .replace('https://ziggysitters.co.nz', siteUrl)
      .replace('https://www.ziggysitters.co.nz', siteUrl)
      .replace('https://ziggysitters.nz', siteUrl)
      .replace('https://www.ziggysitters.nz', siteUrl)
      .replace(/\/$/, '');
  };
  const fullCanonical = normalizeCanonical(canonical);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      {/* Canonical URL */}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="ZiggySitters" />
      <meta property="og:locale" content="en_NZ" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical || siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="ZiggySitters" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="NZ-AUK" />
      <meta name="geo.placename" content="Auckland" />
      <meta name="geo.position" content="-36.8485;174.7633" />
      <meta name="ICBM" content="-36.8485, 174.7633" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}