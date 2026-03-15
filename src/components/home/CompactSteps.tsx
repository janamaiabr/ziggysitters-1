import iconSearch from '@/assets/icons/icon-search.png';
import iconChat from '@/assets/icons/icon-chat.png';
import iconCreditcard from '@/assets/icons/icon-creditcard.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconNum1 from '@/assets/icons/icon-num-1.png';
import iconNum2 from '@/assets/icons/icon-num-2.png';
import iconNum3 from '@/assets/icons/icon-num-3.png';
import iconNum4 from '@/assets/icons/icon-num-4.png';

const steps = [
  { icon: iconSearch, label: 'Search', numIcon: iconNum1 },
  { icon: iconChat, label: 'Meet & Greet (Free)', numIcon: iconNum2 },
  { icon: iconCreditcard, label: 'Book Securely', numIcon: iconNum3 },
  { icon: iconCamera, label: 'Get Daily Updates', numIcon: iconNum4 },
];

export default function CompactSteps() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card rounded-full px-3 py-1.5 shadow-sm border border-border">
            <img src={step.numIcon} alt="" className="w-7 h-7" />
            <img src={step.icon} alt="" className="w-5 h-5" />
            <span className="text-sm font-medium text-foreground font-body">{step.label}</span>
          </div>
          
          {index < steps.length - 1 && (
            <span className="text-muted-foreground hidden md:inline">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
