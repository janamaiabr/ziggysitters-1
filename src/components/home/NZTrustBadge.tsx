import { Shield, MapPin, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NZTrustBadge() {
  const navigate = useNavigate();

  return (
    <section className="py-8 md:py-16 bg-gray-900 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main badge */}
          <div className="text-center mb-6 md:mb-10">
            <div className="inline-flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 mb-3 md:mb-6">
              <Shield className="w-7 h-7 md:w-10 md:h-10 text-white" />
              <div className="text-left">
                <div className="text-lg md:text-3xl font-bold text-white">100% Local Sitters</div>
                <div className="text-gray-400 text-xs md:text-sm">Every sitter is local, verified, and loves pets</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
              Every ZiggySitters pet sitter is a verified local. Real people in your neighbourhood who genuinely love animals.
            </p>
          </div>

          {/* Trust signals */}
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3.5 md:p-5 min-w-[200px] md:min-w-0 flex-shrink-0 md:flex-shrink border border-white/10">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm md:text-lg">Local Sitters</h4>
                <p className="text-gray-400 text-xs md:text-sm">In your neighbourhood</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3.5 md:p-5 min-w-[200px] md:min-w-0 flex-shrink-0 md:flex-shrink border border-white/10">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm md:text-lg">ID Verified</h4>
                <p className="text-gray-400 text-xs md:text-sm">Government ID checked</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3.5 md:p-5 min-w-[200px] md:min-w-0 flex-shrink-0 md:flex-shrink border border-white/10">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm md:text-lg">Daily Updates</h4>
                <p className="text-gray-400 text-xs md:text-sm">Photos & care notes</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate("/our-sitters")}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-6 md:px-8 py-4 md:py-6 text-base md:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all min-h-[44px]"
            >
              Meet Our Sitters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
