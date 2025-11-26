import SEOHead from "@/components/seo/SEOHead";

export default function ChristmasLanding() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-red-100 via-background to-emerald-100 overflow-hidden">
      <SEOHead
        title="Christmas Pet Sitting | ZiggySitters"
        description="Book a loving pet sitter for Christmas before spots run out. Holiday pet care with daily updates and verified sitters."
        canonical="/christmas"
      />

      {/* Snow & festive emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 left-10 text-5xl animate-bounce">🎄</div>
        <div className="absolute top-20 right-12 text-4xl animate-bounce" style={{ animationDelay: "0.4s" }}>🎁</div>
        <div className="absolute bottom-24 left-1/4 text-4xl animate-bounce" style={{ animationDelay: "0.8s" }}>🐾</div>
        <div className="absolute bottom-10 right-1/4 text-5xl animate-bounce" style={{ animationDelay: "1.2s" }}>❄️</div>
      </div>

      {/* Soft festive blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-10 w-80 h-80 rounded-full bg-red-300/40 blur-3xl" />
        <div className="absolute top-32 right-0 w-96 h-96 rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid gap-10 md:grid-cols-[1.4fr,1fr] items-center">
        {/* Hero copy */}
        <section className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-4 py-2 text-sm font-semibold shadow-sm">
            <span>🎅 Christmas bookings now open</span>
            <span className="text-xs rounded-full bg-destructive/10 px-2 py-0.5 text-destructive font-bold">
              Limited sitter spots
            </span>
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-red-500 via-primary to-emerald-600 bg-clip-text text-transparent">
            Book your Christmas pet sitter
            <span className="block">before Santa beats you to it 🎄</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Heading away for the holidays? Keep your pets cosy at home with trusted, vetted sitters who send daily
            photo updates while you relax with family.
          </p>

          <ul className="grid gap-3 text-sm md:text-base">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-lg">✅</span>
              <span><strong>Verified local sitters</strong> lovingly looking after cats, dogs & more over Christmas and New Year.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-lg">📸</span>
              <span><strong>Daily photo & video updates</strong> straight to your phone so you never miss a festive cuddle.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-lg">🏡</span>
              <span><strong>Your pets stay in their own home</strong> with their routines, favourite toys and cosy spots.</span>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="/find-sitters?season=christmas"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold text-primary-foreground bg-gradient-to-r from-red-500 via-primary to-emerald-500 shadow-2xl hover:shadow-3xl hover-scale"
            >
              🎁 Find a Christmas sitter
            </a>
            <a
              href="/how-it-works"
              className="story-link text-sm font-semibold text-primary"
            >
              How ZiggySitters keeps pets merry & safe →
            </a>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground pt-2">
            Popular dates like <strong>24–27 December</strong> and <strong>New Year&apos;s Eve</strong> book out fast. Secure your
            sitter now to avoid last‑minute stress.
          </p>
        </section>

        {/* Right column: festive card */}
        <aside className="relative">
          <div className="absolute -top-6 -right-4 rotate-6 rounded-full bg-yellow-200 px-4 py-1 text-xs font-bold shadow-md flex items-center gap-1">
            <span>⭐</span>
            <span>Holiday favourite</span>
          </div>

          <div className="relative rounded-3xl border-2 border-purple-200/70 bg-background/90 shadow-2xl backdrop-blur-sm p-6 space-y-5 animate-enter">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              Your pet&apos;s cosy Christmas plan
            </h2>

            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-xs font-bold">1</span>
                <span><strong>Tell us about your pet</strong> and when you&apos;re travelling.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-xs font-bold">2</span>
                <span><strong>Browse available sitters</strong> still free for your Christmas dates.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-xs font-bold">3</span>
                <span><strong>Book securely</strong> and enjoy your holiday with peace of mind.</span>
              </li>
            </ol>

            <div className="mt-4 rounded-2xl bg-muted/60 p-4 text-xs text-muted-foreground">
              🎄 <strong>Tip:</strong> Add a note like “Christmas stay” when you send a request so sitters can prioritise your
              booking.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
