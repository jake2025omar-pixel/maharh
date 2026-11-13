import React, { useEffect, useState } from 'react';

export type AssistantFaceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'received';

interface CircularFaceAvatarProps {
  state: AssistantFaceState;
  isSpeakingAudio: boolean; // Mouth animates strictly and ONLY when speech audio is actually playing
  size?: 'sm' | 'md' | 'lg';
}

export const CircularFaceAvatar: React.FC<CircularFaceAvatarProps> = ({
  state,
  isSpeakingAudio,
  size = 'lg'
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);

  // Natural eye blink timer (neutral, non-emotional)
  useEffect(() => {
    let timeoutId: number;
    const scheduleBlink = () => {
      const delay = 3200 + Math.random() * 2600;
      timeoutId = window.setTimeout(() => {
        setIsBlinking(true);
        window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, delay);
    };
    scheduleBlink();
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Mouth cadence ONLY while speech audio is actively playing
  useEffect(() => {
    if (!isSpeakingAudio) {
      setMouthPhase(0);
      return;
    }
    const interval = window.setInterval(() => {
      setMouthPhase(prev => (prev + 1) % 4);
    }, 150);
    return () => window.clearInterval(interval);
  }, [isSpeakingAudio]);

  const dimensions =
    size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-24 h-24' : 'w-36 h-36 sm:w-44 sm:h-44';

  // Mouth path strictly driven by isSpeakingAudio (static clean neutral line when not speaking audio)
  const renderMouth = () => {
    if (!isSpeakingAudio) {
      return (
        <path
          d="M 42 74 Q 60 76 78 74"
          fill="none"
          stroke="#0f172a"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      );
    }

    // Active speaking mouth frames synchronized to playing audio
    const heights = [3, 9, 5, 11];
    const h = heights[mouthPhase];
    return (
      <rect
        x="46"
        y={74 - h / 2}
        width="28"
        height={h}
        rx={h / 2}
        fill="#0f172a"
        className="transition-all duration-100"
      />
    );
  };

  // Eye height (blinking or open)
  const eyeRy = isBlinking ? 1.2 : 6.5;
  const eyeOffsetY = state === 'listening' ? -1.5 : 0;

  return (
    <div className={`relative flex items-center justify-center ${dimensions} select-none`} aria-hidden="true">
      {/* Subtle outer status halo for listening or processing */}
      {state === 'listening' && (
        <span className="absolute inset-0 rounded-full border-2 border-sky-400/60 animate-ping" />
      )}
      {state === 'processing' && (
        <span className="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-sky-500 border-r-sky-300 animate-spin" />
      )}
      {state === 'received' && (
        <span className="absolute -inset-1 rounded-full border border-sky-400/80 transition-opacity duration-200" />
      )}

      {/* Minimal circular face containing ONLY two eyes and one mouth */}
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full rounded-full bg-white border border-sky-100 shadow-[0_10px_35px_rgba(14,165,233,0.09)] transition-transform duration-200"
      >
        <defs>
          <radialGradient id="maharahIcyFace" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0F7FA" />
          </radialGradient>
        </defs>

        {/* Clean circular surface */}
        <circle cx="60" cy="60" r="58" fill="url(#maharahIcyFace)" />

        {/* Two eyes only */}
        <ellipse
          cx="43"
          cy={48 + eyeOffsetY}
          rx="5"
          ry={eyeRy}
          fill="#0f172a"
          className="transition-all duration-100"
        />
        <ellipse
          cx="77"
          cy={48 + eyeOffsetY}
          rx="5"
          ry={eyeRy}
          fill="#0f172a"
          className="transition-all duration-100"
        />

        {/* One mouth only */}
        {renderMouth()}
      </svg>
    </div>
  );
};
