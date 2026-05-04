import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = 'https://nationalfranchiseinvestmentsummit.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Static routes
  const staticRoutes = [
    '',
    '/franchises',
    '/investors',
    '/exhibitions',
    '/about',
    '/contact',
    '/register',
    '/login',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes (Franchises) — only NFIS-registered exhibitors
  let franchiseRoutes: MetadataRoute.Sitemap = [];
  try {
    const nfisSourcePlatforms = encodeURIComponent('NFIS,nfis.in');
    const res = await fetch(`${apiUrl}/api/exhibitor-registrations/?source_platform=${nfisSourcePlatforms}`);
    if (res.ok) {
      const data = await res.json();
      const results = data.results || data;
      franchiseRoutes = (Array.isArray(results) ? results : []).map((item: any) => ({
        url: `${SITE_URL}/franchises/${item.id}`,
        lastModified: new Date(item.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.error('Sitemap error (franchises):', e);
  }

  // Dynamic routes (Investors)
  let investorRoutes: MetadataRoute.Sitemap = [];
  try {
    const resArr = await fetch(`${apiUrl}/api/investor-registrations/`);
    if (resArr.ok) {
      const data = await resArr.json();
      const results = data.results || data;
      investorRoutes = (Array.isArray(results) ? results : []).map((item: any) => ({
        url: `${SITE_URL}/investors/${item.id}`,
        lastModified: new Date(item.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.error('Sitemap error (investors):', e);
  }

  // Dynamic routes (Exhibitions)
  let exhibitionRoutes: MetadataRoute.Sitemap = [];
  try {
    const resEvents = await fetch(`${apiUrl}/api/events/`);
    if (resEvents.ok) {
      const data = await resEvents.json();
      const results = data.results || data;
      exhibitionRoutes = (Array.isArray(results) ? results : []).map((item: any) => ({
        url: `${SITE_URL}/exhibitions/${item.id}`,
        lastModified: new Date(item.updated_at || item.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (e) {
    console.error('Sitemap error (exhibitions):', e);
  }

  return [...staticRoutes, ...franchiseRoutes, ...investorRoutes, ...exhibitionRoutes];
}
