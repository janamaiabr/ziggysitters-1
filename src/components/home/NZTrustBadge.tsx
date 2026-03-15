import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import iconShield from '@/assets/icons/icon-shield.png';
import iconLocation from '@/assets/icons/icon-location.png';
import iconCamera from '@/assets/icons/icon-camera.png';

export default function NZTrustBadge() {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main badge */}
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-3 bg-secondary-foreground/10 rounded-2xl px-6 md:px-8 py-4 mb-6">
              <img src={iconShield} alt="" className="w-10 h-10 md:w-12 md:h-12" />
              <div className="text-left">
                <div className="text-xl md:text-3xl font-bold text-secondary-foreground font-display">100% Local Sitters</div>
                <div className="text-secondary-foreground/60 text-xs md:text-sm font-body">Every sitter is local, verified, and loves pets</div>
              </div>
            </div>
            <p className="text-secondary-foreground/60 text-sm md:text-lg max-w-2xl mx-auto font-body">
              Every ZiggySitters pet sitter is a verified local. Real people in your neighbourhood who genuinely love animals.
            </p>
          </div>

          {/* Trust signals */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-10">
            {[
              { icon: iconLocation, title: "Local Sitters", desc: "In your neighbourhood" },
              { icon: iconShield, title: "ID Verified", desc: "Government ID checked" },
              { icon: iconCamera, title: "Daily Updates", desc: "Photos & care notes" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 bg-secondary-foreground/5 rounded-xl p-4 md:p-5 border border-secondary-foreground/10">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <img src={item.icon} alt="" className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary-foreground text-sm md:text-lg font-body">{item.title}</h4>
                  <p className="text-secondary-foreground/60 text-xs md:text-sm font-body">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate("/our-sitters")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-6 text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all min-h-[44px] font-body"
            >
              Meet Our Sitters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
