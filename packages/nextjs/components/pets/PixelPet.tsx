"use client";

import { useEffect, useState } from "react";

export type PetType = "cat" | "fox" | "dog";
export type PetLevel = 1 | 2 | 3 | 4;

interface Accessory {
  type: "scarf" | "crown" | "book" | "sparkles";
  color?: string;
}

interface PixelPetProps {
  petType: PetType;
  level: PetLevel;
  accessories?: Accessory[];
  size?: number;
  animate?: boolean;
}

export const PixelPet: React.FC<PixelPetProps> = ({
  petType,
  level,
  accessories = [],
  size = 64,
  animate = true,
}) => {
  const [frame, setFrame] = useState(0);

  // Simple 2-frame idle animation
  useEffect(() => {
    if (!animate || level < 2) return;
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 2);
    }, 500);
    return () => clearInterval(interval);
  }, [animate, level]);

  const getPixelSize = () => {
    if (level === 1) return 16;
    if (level === 2) return 20;
    if (level === 3) return 22;
    return 24;
  };

  const pixelSize = getPixelSize();
  const scale = size / pixelSize;

  const hasScarf = accessories.some(a => a.type === "scarf");
  const hasCrown = accessories.some(a => a.type === "crown");
  const hasBook = accessories.some(a => a.type === "book");
  const hasSparkles = accessories.some(a => a.type === "sparkles");
  const scarfColor = accessories.find(a => a.type === "scarf")?.color || "red";

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* Background glow for level 4 */}
      {level === 4 && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-indigo-400/30 blur-xl animate-pulse" />
      )}

      {/* Main pet sprite */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        className={`relative z-10 ${animate && level >= 3 ? 'animate-bounce-slow' : ''}`}
        style={{ imageRendering: 'pixelated' }}
      >
        {petType === "cat" && <CatSprite level={level} frame={frame} />}
        {petType === "fox" && <FoxSprite level={level} frame={frame} />}
        {petType === "dog" && <DogSprite level={level} frame={frame} />}
        
        {/* Scarf overlay (Level 2+) */}
        {hasScarf && level >= 2 && (
          <ScarfAccessory color={scarfColor} petType={petType} />
        )}
        
        {/* Crown overlay (Level 3+) */}
        {hasCrown && level >= 3 && (
          <CrownAccessory petType={petType} />
        )}
      </svg>

      {/* Floating book (Level 4) */}
      {hasBook && level === 4 && (
        <div className="absolute -right-2 top-0 animate-float">
          <svg width="16" height="16" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
            <rect x="2" y="1" width="4" height="6" fill="#8B4513" />
            <rect x="3" y="2" width="2" height="4" fill="#DEB887" />
            <line x1="3" y1="3" x2="5" y2="3" stroke="#8B4513" strokeWidth="0.5" />
            <line x1="3" y1="4" x2="5" y2="4" stroke="#8B4513" strokeWidth="0.5" />
          </svg>
        </div>
      )}

      {/* Sparkle particles (Level 4) */}
      {hasSparkles && level === 4 && (
        <>
          <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping" />
          <div className="absolute bottom-2 left-1 w-1 h-1 bg-cyan-300 rounded-full animate-ping animation-delay-300" />
          <div className="absolute top-3 left-2 w-1 h-1 bg-pink-300 rounded-full animate-ping animation-delay-600" />
        </>
      )}
    </div>
  );
};

// Cat sprite component - Cute orange tabby
const CatSprite: React.FC<{ level: PetLevel; frame: number }> = ({ level, frame }) => {
  const eyeOffset = level >= 2 && frame === 1 ? 0.3 : 0;
  
  return (
    <g>
      {/* Body - rounded */}
      <rect x="5" y="8" width="6" height="4" fill="#FF9F5A" />
      <rect x="4" y="9" width="1" height="2" fill="#FF9F5A" />
      <rect x="11" y="9" width="1" height="2" fill="#FF9F5A" />
      
      {/* Belly - lighter */}
      <rect x="6" y="9" width="4" height="2" fill="#FFD4A8" />
      
      {/* Head - bigger and rounder */}
      <rect x="5" y="5" width="6" height="3" fill="#FF9F5A" />
      <rect x="6" y="4" width="4" height="1" fill="#FF9F5A" />
      
      {/* Ears - triangular */}
      <rect x="5" y="4" width="2" height="1" fill="#FF8C42" />
      <rect x="9" y="4" width="2" height="1" fill="#FF8C42" />
      <rect x="6" y="3" width="1" height="1" fill="#FF8C42" />
      <rect x="9" y="3" width="1" height="1" fill="#FF8C42" />
      
      {/* Inner ears */}
      <rect x="6" y="4" width="1" height="1" fill="#FFB6C1" opacity={0.6} />
      <rect x="9" y="4" width="1" height="1" fill="#FFB6C1" opacity={0.6} />
      
      {/* Eyes - big cute eyes */}
      <rect x="6" y="5" width="1" height="2" fill="#000" transform={`translate(0, ${eyeOffset})`} />
      <rect x="9" y="5" width="1" height="2" fill="#000" transform={`translate(0, ${eyeOffset})`} />
      {/* Eye shine */}
      <rect x="6.3" y="5.3" width="0.4" height="0.4" fill="#FFF" transform={`translate(0, ${eyeOffset})`} />
      <rect x="9.3" y="5.3" width="0.4" height="0.4" fill="#FFF" transform={`translate(0, ${eyeOffset})`} />
      
      {/* Nose - cute triangle */}
      <rect x="7.5" y="6.5" width="1" height="0.5" fill="#FF6B9D" />
      <rect x="7" y="7" width="0.5" height="0.5" fill="#FF6B9D" />
      <rect x="8.5" y="7" width="0.5" height="0.5" fill="#FF6B9D" />
      
      {/* Whiskers */}
      {level >= 2 && (
        <>
          <rect x="4" y="6.5" width="1" height="0.3" fill="#000" opacity={0.4} />
          <rect x="11" y="6.5" width="1" height="0.3" fill="#000" opacity={0.4} />
        </>
      )}
      
      {/* Tail - curved */}
      {level >= 2 && (
        <>
          <rect x="11" y="8" width="1" height="2" fill="#FF9F5A" />
          <rect x="12" y="7" width="1" height="1" fill="#FF9F5A" />
          <rect x="13" y="6" width="1" height="1" fill="#FF9F5A" />
        </>
      )}
      
      {/* Paws - more defined */}
      {level >= 3 && (
        <>
          <rect x="5" y="12" width="2" height="1" fill="#FF8C42" />
          <rect x="9" y="12" width="2" height="1" fill="#FF8C42" />
          <rect x="5.5" y="13" width="0.5" height="0.5" fill="#FFD4A8" />
          <rect x="6" y="13" width="0.5" height="0.5" fill="#FFD4A8" />
          <rect x="9.5" y="13" width="0.5" height="0.5" fill="#FFD4A8" />
          <rect x="10" y="13" width="0.5" height="0.5" fill="#FFD4A8" />
        </>
      )}
      
      {/* Stripes - tabby pattern */}
      {level >= 3 && (
        <>
          <rect x="5" y="5" width="0.5" height="1" fill="#FF6B35" opacity={0.6} />
          <rect x="10.5" y="5" width="0.5" height="1" fill="#FF6B35" opacity={0.6} />
          <rect x="7" y="4" width="0.5" height="1" fill="#FF6B35" opacity={0.6} />
          <rect x="8.5" y="4" width="0.5" height="1" fill="#FF6B35" opacity={0.6} />
        </>
      )}
    </g>
  );
};

// Fox sprite component - Cute red fox
const FoxSprite: React.FC<{ level: PetLevel; frame: number }> = ({ level, frame }) => {
  const eyeOffset = level >= 2 && frame === 1 ? 0.3 : 0;
  
  return (
    <g>
      {/* Body */}
      <rect x="5" y="8" width="6" height="4" fill="#FF6B35" />
      <rect x="4" y="9" width="1" height="2" fill="#FF6B35" />
      <rect x="11" y="9" width="1" height="2" fill="#FF6B35" />
      
      {/* White chest */}
      <rect x="6" y="9" width="4" height="3" fill="#FFFFFF" />
      <rect x="7" y="8" width="2" height="1" fill="#FFF5E6" />
      
      {/* Head */}
      <rect x="5" y="5" width="6" height="3" fill="#FF6B35" />
      <rect x="6" y="4" width="4" height="1" fill="#FF6B35" />
      
      {/* Pointed ears - more defined */}
      <rect x="5" y="3" width="2" height="2" fill="#FF6B35" />
      <rect x="9" y="3" width="2" height="2" fill="#FF6B35" />
      <rect x="5.5" y="2" width="1" height="1" fill="#FF6B35" />
      <rect x="9.5" y="2" width="1" height="1" fill="#FF6B35" />
      
      {/* Dark ear tips */}
      <rect x="5.5" y="2" width="1" height="1" fill="#000" opacity={0.5} />
      <rect x="9.5" y="2" width="1" height="1" fill="#000" opacity={0.5} />
      
      {/* Inner ears */}
      <rect x="6" y="3.5" width="0.5" height="1" fill="#FFE5CC" />
      <rect x="9.5" y="3.5" width="0.5" height="1" fill="#FFE5CC" />
      
      {/* Eyes - clever look */}
      <rect x="6" y="5.5" width="1" height="1.5" fill="#000" transform={`translate(0, ${eyeOffset})`} />
      <rect x="9" y="5.5" width="1" height="1.5" fill="#000" transform={`translate(0, ${eyeOffset})`} />
      {/* Eye shine */}
      <rect x="6.3" y="5.8" width="0.4" height="0.4" fill="#FFF" transform={`translate(0, ${eyeOffset})`} />
      <rect x="9.3" y="5.8" width="0.4" height="0.4" fill="#FFF" transform={`translate(0, ${eyeOffset})`} />
      
      {/* Snout - white muzzle */}
      <rect x="6.5" y="6.5" width="3" height="1.5" fill="#FFFFFF" />
      
      {/* Nose */}
      <rect x="7.5" y="7" width="1" height="0.8" fill="#000" />
      
      {/* Cheeks */}
      {level >= 2 && (
        <>
          <rect x="5" y="6" width="1" height="1" fill="#FFE5CC" />
          <rect x="10" y="6" width="1" height="1" fill="#FFE5CC" />
        </>
      )}
      
      {/* Bushy tail - iconic fox tail */}
      {level >= 2 && (
        <>
          <rect x="11" y="7" width="2" height="4" fill="#FF6B35" />
          <rect x="13" y="6" width="1" height="5" fill="#FF6B35" />
          <rect x="14" y="7" width="1" height="3" fill="#FF6B35" />
          {/* White tail tip */}
          <rect x="13" y="9" width="2" height="2" fill="#FFFFFF" />
        </>
      )}
      
      {/* Paws */}
      {level >= 3 && (
        <>
          <rect x="5" y="12" width="2" height="1" fill="#FF4500" />
          <rect x="9" y="12" width="2" height="1" fill="#FF4500" />
          {/* Black paw pads */}
          <rect x="5.5" y="12.5" width="0.5" height="0.5" fill="#000" opacity={0.5} />
          <rect x="9.5" y="12.5" width="0.5" height="0.5" fill="#000" opacity={0.5} />
        </>
      )}
    </g>
  );
};

// Dog sprite component - Cute blue puppy
const DogSprite: React.FC<{ level: PetLevel; frame: number }> = ({ level, frame }) => {
  const eyeOffset = level >= 2 && frame === 1 ? 0.3 : 0;
  const tailWag = frame === 1 ? -0.5 : 0.5;
  
  return (
    <g>
      {/* Body - sitting pose */}
      <rect x="5" y="8" width="6" height="4" fill="#5B9BD5" />
      <rect x="4" y="9" width="1" height="2" fill="#5B9BD5" />
      <rect x="11" y="9" width="1" height="2" fill="#5B9BD5" />
      
      {/* Chest/belly - lighter */}
      <rect x="6" y="9" width="4" height="2" fill="#A8D5FF" />
      
      {/* Head - rounder */}
      <rect x="5" y="5" width="6" height="3" fill="#5B9BD5" />
      <rect x="6" y="4" width="4" height="1" fill="#5B9BD5" />
      
      {/* Floppy ears - bigger */}
      <rect x="4" y="5" width="2" height="3" fill="#4A7FB8" />
      <rect x="10" y="5" width="2" height="3" fill="#4A7FB8" />
      <rect x="3" y="6" width="1" height="2" fill="#4A7FB8" />
      <rect x="12" y="6" width="1" height="2" fill="#4A7FB8" />
      
      {/* Inner ears - lighter */}
      <rect x="4.5" y="6" width="1" height="1.5" fill="#7BA8D1" />
      <rect x="10.5" y="6" width="1" height="1.5" fill="#7BA8D1" />
      
      {/* Eyes - big puppy eyes */}
      <rect x="6" y="5.5" width="1" height="1.5" fill="#000" transform={`translate(0, ${eyeOffset})`} />
      <rect x="9" y="5.5" width="1" height="1.5" fill="#000" transform={`translate(0, ${eyeOffset})`} />
      {/* Eye shine - sparkly */}
      <rect x="6.3" y="5.8" width="0.5" height="0.5" fill="#FFF" transform={`translate(0, ${eyeOffset})`} />
      <rect x="9.3" y="5.8" width="0.5" height="0.5" fill="#FFF" transform={`translate(0, ${eyeOffset})`} />
      
      {/* Snout - cute muzzle */}
      <rect x="6.5" y="6.5" width="3" height="1.5" fill="#A8D5FF" />
      
      {/* Nose - big black nose */}
      <rect x="7" y="7" width="2" height="1" fill="#000" />
      <rect x="7.5" y="6.8" width="1" height="0.5" fill="#000" />
      
      {/* Tongue (happy pup) */}
      {level >= 2 && (
        <>
          <rect x="7.5" y="8" width="1" height="1" fill="#FF9999" />
          <rect x="7.5" y="8.5" width="1" height="0.5" fill="#FF6B6B" />
        </>
      )}
      
      {/* Tail (wagging!) */}
      {level >= 2 && (
        <>
          <rect 
            x="11" 
            y="7" 
            width="2" 
            height="2" 
            fill="#5B9BD5"
            transform={`translate(0, ${tailWag})`}
          />
          <rect 
            x="13" 
            y="6.5" 
            width="1" 
            height="2" 
            fill="#5B9BD5"
            transform={`translate(0, ${tailWag})`}
          />
        </>
      )}
      
      {/* Collar */}
      {level >= 2 && (
        <>
          <rect x="5.5" y="8" width="5" height="0.8" fill="#FF4444" />
          {/* Collar tag */}
          <rect x="7.5" y="8.5" width="1" height="1" fill="#FFD700" />
        </>
      )}
      
      {/* Paws - detailed */}
      {level >= 3 && (
        <>
          <rect x="5" y="12" width="2" height="1" fill="#4A7FB8" />
          <rect x="9" y="12" width="2" height="1" fill="#4A7FB8" />
          {/* Toe beans! */}
          <rect x="5.3" y="12.5" width="0.4" height="0.4" fill="#FFB6C1" />
          <rect x="6" y="12.5" width="0.4" height="0.4" fill="#FFB6C1" />
          <rect x="9.3" y="12.5" width="0.4" height="0.4" fill="#FFB6C1" />
          <rect x="10" y="12.5" width="0.4" height="0.4" fill="#FFB6C1" />
        </>
      )}
      
      {/* Spots - puppy pattern */}
      {level >= 3 && (
        <>
          <rect x="5" y="9" width="1" height="1" fill="#4A7FB8" opacity={0.7} />
          <rect x="10" y="10" width="1" height="1" fill="#4A7FB8" opacity={0.7} />
        </>
      )}
    </g>
  );
};

// Scarf accessory - cozy knitted scarf
const ScarfAccessory: React.FC<{ color: string; petType: PetType }> = ({ color }) => {
  const colorMap: Record<string, string> = {
    red: "#DC2626",
    blue: "#2563EB",
    green: "#16A34A",
    purple: "#9333EA",
    yellow: "#EAB308",
  };
  
  const scarfColor = colorMap[color] || "#DC2626";

  return (
    <g>
      {/* Main scarf around neck */}
      <rect x="4.5" y="7.5" width="7" height="1.5" fill={scarfColor} />
      {/* Scarf texture/pattern */}
      <rect x="5" y="7.7" width="0.3" height="1" fill="#FFF" opacity={0.3} />
      <rect x="6" y="7.7" width="0.3" height="1" fill="#FFF" opacity={0.3} />
      <rect x="7" y="7.7" width="0.3" height="1" fill="#FFF" opacity={0.3} />
      <rect x="8" y="7.7" width="0.3" height="1" fill="#FFF" opacity={0.3} />
      <rect x="9" y="7.7" width="0.3" height="1" fill="#FFF" opacity={0.3} />
      <rect x="10" y="7.7" width="0.3" height="1" fill="#FFF" opacity={0.3} />
      
      {/* Left dangling end */}
      <rect x="3.5" y="9" width="1.5" height="3" fill={scarfColor} />
      <rect x="3.5" y="11.5" width="0.5" height="0.5" fill={scarfColor} opacity={0.8} />
      <rect x="4.5" y="11.5" width="0.5" height="0.5" fill={scarfColor} opacity={0.8} />
      
      {/* Fringe on left end */}
      <rect x="3.7" y="12" width="0.3" height="0.8" fill={scarfColor} opacity={0.7} />
      <rect x="4.2" y="12" width="0.3" height="0.6" fill={scarfColor} opacity={0.7} />
      <rect x="4.7" y="12" width="0.3" height="0.7" fill={scarfColor} opacity={0.7} />
    </g>
  );
};

// Crown accessory - royal golden crown
const CrownAccessory: React.FC<{ petType: PetType }> = () => {
  return (
    <g>
      {/* Crown base */}
      <rect x="5.5" y="2.5" width="5" height="1" fill="#FFD700" />
      
      {/* Crown points */}
      <rect x="5.5" y="1.5" width="1" height="1" fill="#FFD700" />
      <rect x="7" y="0.5" width="1" height="2" fill="#FFD700" />
      <rect x="8" y="1" width="1" height="1.5" fill="#FFD700" />
      <rect x="9.5" y="1.5" width="1" height="1" fill="#FFD700" />
      
      {/* Crown highlights - shiny gold */}
      <rect x="7.2" y="0.7" width="0.3" height="0.8" fill="#FFF" opacity={0.6} />
      <rect x="6" y="2.7" width="3" height="0.3" fill="#FFF" opacity={0.4} />
      
      {/* Jewels on crown */}
      <rect x="7.3" y="2.5" width="0.7" height="0.7" fill="#DC2626" />
      <rect x="6" y="2" width="0.5" height="0.5" fill="#3B82F6" />
      <rect x="9" y="2" width="0.5" height="0.5" fill="#10B981" />
      
      {/* Gold trim/shadow */}
      <rect x="5.5" y="3.3" width="5" height="0.3" fill="#D4AF37" />
    </g>
  );
};
