import { useState, useEffect, useCallback, useRef } from 'react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  storageKey: string;
  onComplete?: () => void;
}

export default function OnboardingTour({ steps, storageKey, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome screen
  const [visible, setVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [spotlightRect, setSpotlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isDone = localStorage.getItem(storageKey) === 'true';

  const positionTooltip = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pad = 8;
    setSpotlightRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });

    const tooltipEl = tooltipRef.current;
    const tw = tooltipEl?.offsetWidth || 340;
    const th = tooltipEl?.offsetHeight || 180;
    const placement = step.placement || 'bottom';
    const gap = 16;
    const arrow: React.CSSProperties = { position: 'absolute', width: 12, height: 12, background: 'white', transform: 'rotate(45deg)' };

    let top = 0, left = 0;
    switch (placement) {
      case 'bottom': top = rect.bottom + gap; left = rect.left + rect.width / 2 - tw / 2; arrow.top = -6; arrow.left = tw / 2 - 6; break;
      case 'top': top = rect.top - th - gap; left = rect.left + rect.width / 2 - tw / 2; arrow.bottom = -6; arrow.left = tw / 2 - 6; break;
      case 'right': top = rect.top + rect.height / 2 - th / 2; left = rect.right + gap; arrow.top = th / 2 - 6; arrow.left = -6; break;
      case 'left': top = rect.top + rect.height / 2 - th / 2; left = rect.left - tw - gap; arrow.top = th / 2 - 6; arrow.right = -6; break;
    }

    left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - th - 12));

    setTooltipPos({ top, left });
    setArrowStyle(arrow);
  }, [currentStep, steps]);

  useEffect(() => {
    if (isDone) return;
    // Show welcome immediately
    setVisible(true);
  }, [isDone]);

  useEffect(() => {
    if (currentStep < 0 || !visible) return;
    const step = steps[currentStep];
    const check = () => {
      const el = document.querySelector(step?.target || '');
      if (el) {
        positionTooltip();
      } else {
        setTimeout(check, 300);
      }
    };
    setTimeout(check, 300);
  }, [currentStep, visible, steps, positionTooltip]);

  useEffect(() => {
    if (currentStep < 0 || !visible) return;
    const handler = () => positionTooltip();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [visible, currentStep, positionTooltip]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      complete();
    }
  };

  const complete = () => {
    localStorage.setItem(storageKey, 'true');
    setVisible(false);
    onComplete?.();
  };

  if (isDone || !visible) return null;

  // Welcome screen (step -1)
  if (currentStep === -1) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      }}>
        <div style={{
          background: 'white', borderRadius: 16, padding: '40px 48px',
          maxWidth: 440, textAlign: 'center',
          boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🐾</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8, fontFamily: 'inherit' }}>
            Welcome to ZiggySitters!
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, marginBottom: 28 }}>
            Find trusted pet sitters with daily photo updates 📸<br />
            Let us show you around!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={complete} style={{
              padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: 'white', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Skip</button>
            <button onClick={() => setCurrentStep(0)} style={{
              padding: '10px 28px', borderRadius: 8, border: 'none',
              background: '#22c55e', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Show me around →</button>
          </div>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <>
      <div style={{
        position: 'fixed', ...spotlightRect, zIndex: 99998,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)', borderRadius: 8,
        transition: 'all 0.3s ease', pointerEvents: 'none',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()} />
      <div ref={tooltipRef} style={{
        position: 'fixed', zIndex: 99999, background: 'white', borderRadius: 12,
        padding: '20px 24px', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease', top: tooltipPos.top, left: tooltipPos.left,
      }}>
        <div style={arrowStyle} />
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{step.title}</div>
        <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5, marginBottom: 16 }}>{step.description}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === currentStep ? '#22c55e' : '#d1d5db',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={complete} style={{
              padding: '8px 12px', borderRadius: 8, border: 'none',
              background: 'transparent', color: '#9ca3af', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Skip</button>
            <button onClick={next} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: '#22c55e', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>{currentStep === steps.length - 1 ? 'Done' : 'Next'}</button>
          </div>
        </div>
      </div>
    </>
  );
}
