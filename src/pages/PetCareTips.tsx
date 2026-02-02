import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { petCareTips } from "@/data/petCareTips";

export default function PetCareTips() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "ZiggySitters Pet Care Tips",
    "description": "NZ-focused pet care advice and tips from trusted local pet sitters",
    "url": "https://ziggysitters.com/pet-care-tips",
    "publisher": {
      "@type": "Organization",
      "name": "ZiggySitters",
    }
  };

  return (
    <>
      <SEOHead
        title="Pet Care Tips NZ | Expert Advice from Local Sitters | ZiggySitters"
        description="NZ-focused pet care advice from trusted local sitters. Tips on keeping your pets happy, healthy, and safe in New Zealand."
        keywords="pet care tips nz, dog care new zealand, cat care tips, pet health nz, pet safety tips, pet owner advice nz"
        canonical="/pet-care-tips"
        structuredData={structuredData}
      />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-b from-purple-50 to-background dark:from-purple-950/20 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 px-4 py-2">
                <BookOpen className="w-4 h-4 mr-2" />
                NZ Pet Care
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Pet Care Tips</h1>
              <p className="text-lg text-muted-foreground">
                Expert advice from local NZ pet sitters to help you keep your furry friends happy, healthy, and safe.
              </p>
            </div>
          </div>
        </section>

        {/* Tips Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {petCareTips.map((tip) => (
                  <Link key={tip.slug} to={"/blog/" + tip.slug}>
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={tip.image}
                          alt={tip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-purple-100 text-purple-800">
                          Pet Care Tips
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={tip.date}>
                            {new Date(tip.date).toLocaleDateString("en-NZ", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </time>
                          <span>&#x2022;</span>
                          <span>{tip.readTime}</span>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {tip.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base line-clamp-3 mb-4">
                          {tip.excerpt}
                        </CardDescription>
                        <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                          Read more
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Need a Trusted Pet Sitter?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our verified NZ-based sitters follow all these tips and more. Find the perfect sitter for your pet.
            </p>
            <Link to="/find-sitters">
              <Button size="lg" className="gap-2">
                Find Pet Sitters Near You
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
