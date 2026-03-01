import { Shield, MapPin, CheckCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NZTrustBadge() {
  const navigate = useNavigate();

  return (
    <section className="py-8 md:py-16 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
        <div className="absolute top-5 left-10 text-6xl animate-float">&#x1F33F;</div>
        <div className="absolute bottom-5 right-10 text-5xl animate-float" style={{ animationDelay: "1s" }}>&#x1F33F;</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main badge */}
          <div className="text-center mb-6 md:mb-10">
            <div className="inline-flex items-center gap-2 md:gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 mb-3 md:mb-6">
              <Shield className="w-7 h-7 md:w-10 md:h-10 text-white" />
              <div className="text-left">
                <div className="text-lg md:text-3xl font-bold text-white">100% Local Sitters</div>
                <div className="text-emerald-200 text-xs md:text-sm">Every sitter is local, vetted, and trusted</div>
              </div>
            </div>
            <p className="text-white/80 text-sm md:text-lg max-w-2xl mx-auto">
              Every ZiggySitters pet sitter is a verified local. They know the parks, the vets, and how to care for your pets the way you would.
            </p>
          </div>

          {/* Trust signals - horizontal scroll on mobile */}
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 md:p-5 min-w-[200px] md:min-w-0 flex-shrink-0 md:flex-shrink">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm md:text-lg">Local Sitters</h4>
                <p className="text-white/70 text-xs md:text-sm">In your neighbourhood</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 md:p-5 min-w-[200px] md:min-w-0 flex-shrink-0 md:flex-shrink">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm md:text-lg">ID Verified</h4>
                <p className="text-white/70 text-xs md:text-sm">Background checked locally</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 md:p-5 min-w-[200px] md:min-w-0 flex-shrink-0 md:flex-shrink">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm md:text-lg">Community-First</h4>
                <p className="text-white/70 text-xs md:text-sm">Built for local pet owners</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate("/our-sitters")}
              className="bg-white text-emerald-800 hover:bg-white/90 font-bold px-6 md:px-8 py-4 md:py-6 text-base md:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all min-h-[44px]"
            >
              Meet Our Sitters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
