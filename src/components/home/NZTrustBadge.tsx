import { Shield, MapPin, CheckCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NZTrustBadge() {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-5 left-10 text-6xl animate-float">&#x1F33F;</div>
        <div className="absolute bottom-5 right-10 text-5xl animate-float" style={{ animationDelay: "1s" }}>&#x1F33F;</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main badge */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4 mb-6">
              <Shield className="w-10 h-10 text-white" />
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold text-white">100% NZ-Based Sitters</div>
                <div className="text-emerald-200 text-sm">Every sitter is local, vetted, and trusted</div>
              </div>
            </div>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Unlike overseas platforms, every ZiggySitters pet sitter lives in New Zealand. They know the local parks, the weather, and the Kiwi way of caring for animals.
            </p>
          </div>

          {/* Trust signals grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Local Sitters</h4>
                <p className="text-white/70 text-sm">Living in your neighbourhood, not overseas</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">NZ Vetted</h4>
                <p className="text-white/70 text-sm">ID verified with NZ documents</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Kiwi-Owned</h4>
                <p className="text-white/70 text-sm">Built by NZ pet owners, for NZ pet owners</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate("/our-sitters")}
              className="bg-white text-emerald-800 hover:bg-white/90 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Meet Our NZ Sitters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
