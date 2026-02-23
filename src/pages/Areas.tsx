import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin } from 'lucide-react';

const AREAS = {
  'Auckland Central': [
    { name: 'Ponsonby', slug: 'ponsonby' },
    { name: 'Grey Lynn', slug: 'grey-lynn' },
    { name: 'Mt Eden', slug: 'mt-eden' },
    { name: 'Remuera', slug: 'remuera' },
    { name: 'Parnell', slug: 'parnell' },
    { name: 'Newmarket', slug: 'newmarket' },
    { name: 'Epsom', slug: 'epsom' },
    { name: 'Kingsland', slug: 'kingsland' },
    { name: 'Mt Albert', slug: 'mt-albert' },
    { name: 'Sandringham', slug: 'sandringham' },
    { name: 'Freemans Bay', slug: 'freemans-bay' },
    { name: 'Herne Bay', slug: 'herne-bay' },
    { name: 'Westmere', slug: 'westmere' },
    { name: 'Ellerslie', slug: 'ellerslie' },
    { name: 'Mission Bay', slug: 'mission-bay' },
    { name: 'Kohimarama', slug: 'kohimarama' },
    { name: 'St Heliers', slug: 'st-heliers' },
    { name: 'Orakei', slug: 'orakei' },
    { name: 'Meadowbank', slug: 'meadowbank' },
  ],
  'North Shore': [
    { name: 'Takapuna', slug: 'takapuna' },
    { name: 'Devonport', slug: 'devonport' },
    { name: 'Milford', slug: 'milford' },
    { name: 'Browns Bay', slug: 'browns-bay' },
    { name: 'Albany', slug: 'albany' },
    { name: 'Glenfield', slug: 'glenfield' },
    { name: 'Northcote', slug: 'northcote' },
    { name: 'Birkenhead', slug: 'birkenhead' },
  ],
  'West Auckland': [
    { name: 'Henderson', slug: 'henderson' },
    { name: 'Titirangi', slug: 'titirangi' },
    { name: 'Glen Eden', slug: 'glen-eden' },
    { name: 'New Lynn', slug: 'new-lynn' },
    { name: 'Te Atatu', slug: 'te-atatu' },
    { name: 'Hobsonville', slug: 'hobsonville' },
  ],
  'South Auckland': [
    { name: 'Manukau', slug: 'manukau' },
    { name: 'Botany', slug: 'botany' },
    { name: 'Pakuranga', slug: 'pakuranga' },
    { name: 'Howick', slug: 'howick' },
    { name: 'Papakura', slug: 'papakura' },
    { name: 'Onehunga', slug: 'onehunga' },
    { name: 'Panmure', slug: 'panmure' },
    { name: 'Mt Wellington', slug: 'mt-wellington' },
  ],
  'Hamilton': [
    { name: 'Hamilton Central', slug: 'hamilton-central' },
    { name: 'Hamilton East', slug: 'hamilton-east' },
    { name: 'Claudelands', slug: 'claudelands' },
    { name: 'Hillcrest', slug: 'hillcrest' },
    { name: 'Dinsdale', slug: 'dinsdale' },
    { name: 'Rototuna', slug: 'rototuna' },
  ],
  'Sunshine Coast, QLD': [
    { name: 'Noosa Heads', slug: 'noosa-heads' },
    { name: 'Maroochydore', slug: 'maroochydore' },
    { name: 'Caloundra', slug: 'caloundra' },
    { name: 'Mooloolaba', slug: 'mooloolaba' },
    { name: 'Buderim', slug: 'buderim' },
    { name: 'Nambour', slug: 'nambour' },
    { name: 'Coolum Beach', slug: 'coolum-beach' },
    { name: 'Peregian Beach', slug: 'peregian-beach' },
    { name: 'Maleny', slug: 'maleny' },
    { name: 'Montville', slug: 'montville' },
  ],
};

export default function Areas() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pet Sitting Areas We Service - Auckland, Hamilton & Sunshine Coast',
    description: 'Find trusted pet sitters across Auckland, Hamilton and Sunshine Coast. Browse all suburbs we service including Ponsonby, Grey Lynn, Takapuna, Noosa Heads and more.',
    url: 'https://ziggysitters.com/areas',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: Object.values(AREAS).flat().map((area, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://ziggysitters.com/find-sitters/${area.slug}`,
        name: `Pet Sitters in ${area.name}`,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>Pet Sitting Areas - Auckland, Hamilton & Sunshine Coast | ZiggySitters</title>
        <meta 
          name="description" 
          content="Find trusted pet sitters across Auckland, Hamilton and Sunshine Coast suburbs. Browse Ponsonby, Grey Lynn, Remuera, Takapuna, Noosa Heads and 50+ more areas." 
        />
        <meta name="keywords" content="pet sitting auckland, pet sitter hamilton, dog sitting auckland suburbs, cat sitting near me" />
        <link rel="canonical" href="https://ziggysitters.com/areas" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Areas We Service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find trusted, verified pet sitters across Auckland, Hamilton and the Sunshine Coast. 
              Click on any suburb to see available sitters in your area.
            </p>
          </div>
        </section>

        {/* Areas Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(AREAS).map(([region, suburbs]) => (
                <div key={region} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-card-foreground">{region}</h2>
                  </div>
                  <ul className="grid grid-cols-2 gap-2">
                    {suburbs.map((suburb) => (
                      <li key={suburb.slug}>
                        <Link
                          to={`/find-sitters/${suburb.slug}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline"
                        >
                          {suburb.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Don't see your area?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              We're expanding! Search for pet sitters in your suburb - we may have sitters nearby.
            </p>
            <Link
              to="/find-sitters"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Search All Sitters
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
