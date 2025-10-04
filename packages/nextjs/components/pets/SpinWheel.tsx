"use client";

import { useState, useEffect } from "react";
import { PetType, PixelPet } from "./PixelPet";

interface SpinWheelProps {
  onSelect: (petType: PetType, scarfColor: string) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onSelect }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ pet: PetType; scarf: string } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; color: string; id: number }>>([]);

  const pets: PetType[] = ["cat", "fox", "dog", "rabbit", "owl", "dragon", "penguin", "bear"];
  const scarfColors = ["red", "blue", "green", "purple", "yellow"];

  const handleSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);

    // Random rotation (3-5 full spins + random position)
    const spins = 3 + Math.random() * 2;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + randomAngle;
    setRotation(totalRotation);

    // Create particle explosion
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      color: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)],
      id: Date.now() + i,
    }));
    setParticles(newParticles);

    // Clear particles after animation
    setTimeout(() => setParticles([]), 1000);

    // Determine result after spin
    setTimeout(() => {
      const randomPet = pets[Math.floor(Math.random() * pets.length)];
      const randomScarf = scarfColors[Math.floor(Math.random() * scarfColors.length)];
      
      setResult({ pet: randomPet, scarf: randomScarf });
      setSpinning(false);
      onSelect(randomPet, randomScarf);
    }, 3000);
  };

  const getPetName = (pet: PetType) => {
    if (pet === "cat") return "Curious Cat";
    if (pet === "fox") return "Clever Fox";
    if (pet === "dog") return "Loyal Dog";
    if (pet === "rabbit") return "Fluffy Rabbit";
    if (pet === "owl") return "Wise Owl";
    if (pet === "dragon") return "Mighty Dragon";
    if (pet === "penguin") return "Fancy Penguin";
    return "Cuddly Bear";
  };

  const getPetDescription = (pet: PetType) => {
    if (pet === "cat") return "Independent spirit, loves to explore";
    if (pet === "fox") return "Strategic thinker, always clever";
    if (pet === "dog") return "Team player, loyal companion";
    if (pet === "rabbit") return "Quick learner, full of energy";
    if (pet === "owl") return "Wise scholar, loves knowledge";
    if (pet === "dragon") return "Bold leader, fierce protector";
    if (pet === "penguin") return "Cool under pressure, stylish";
    return "Warm hearted, caring friend";
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-base-content mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Choose Your Companion!
        </h3>
        <p className="text-sm text-base-content/70">Spin the wheel to discover your pixel pet</p>
      </div>

      {/* Spinning Wheel Container */}
      <div className="relative">
        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full animate-particle"
            style={{
              backgroundColor: particle.color,
              transform: `translate(${particle.x}px, ${particle.y}px)`,
              opacity: 0,
            }}
          />
        ))}

        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" />
        
        {/* Wheel */}
        <div className="relative">
          <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-2xl">
            {/* Outer decorative ring */}
            <circle
              cx="200"
              cy="200"
              r="195"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="4"
              className="animate-pulse"
            />
            
            {/* Main wheel background */}
            <circle cx="200" cy="200" r="190" fill="#1e293b" opacity="0.9" />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <radialGradient id="sectionGradient">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </radialGradient>
            </defs>

            {/* Wheel sections */}
            <g
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "200px 200px",
                transition: spinning ? "transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              {pets.map((pet, index) => {
                const angle = (360 / pets.length) * index;
                const nextAngle = (360 / pets.length) * (index + 1);
                const midAngle = (angle + nextAngle) / 2;
                
                // Calculate path for each section
                const startX = 200 + 180 * Math.cos((angle * Math.PI) / 180);
                const startY = 200 + 180 * Math.sin((angle * Math.PI) / 180);
                const endX = 200 + 180 * Math.cos((nextAngle * Math.PI) / 180);
                const endY = 200 + 180 * Math.sin((nextAngle * Math.PI) / 180);

                const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f97316', '#3b82f6', '#a855f7'];
                
                return (
                  <g key={pet}>
                    {/* Section */}
                    <path
                      d={`M 200 200 L ${startX} ${startY} A 180 180 0 0 1 ${endX} ${endY} Z`}
                      fill={colors[index]}
                      opacity="0.3"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    
                    {/* Pet container - positioned at mid angle */}
                    <g
                      transform={`rotate(${midAngle} 200 200)`}
                      style={{ pointerEvents: 'none' }}
                    >
                      <foreignObject
                        x="200"
                        y="80"
                        width="80"
                        height="80"
                        transform="rotate(90 240 120)"
                      >
                        <div className="flex items-center justify-center w-full h-full scale-75">
                          <PixelPet petType={pet} level={1} accessories={[{ type: 'scarf', color: 'blue' }]} />
                        </div>
                      </foreignObject>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* Center hub */}
            <circle cx="200" cy="200" r="40" fill="url(#sectionGradient)" stroke="#64748b" strokeWidth="3" />
            <circle cx="200" cy="200" r="35" fill="#0f172a" opacity="0.8" />
            <text
              x="200"
              y="205"
              textAnchor="middle"
              fill="#06b6d4"
              fontSize="16"
              fontWeight="bold"
              className="font-mono"
            >
              SPIN
            </text>
          </svg>

          {/* Pointer arrow at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
            <div className="relative">
              {/* Arrow glow */}
              <div className="absolute inset-0 blur-lg bg-cyan-400/50" />
              {/* Arrow */}
              <svg width="40" height="50" viewBox="0 0 40 50">
                <path
                  d="M 20 0 L 0 25 L 15 25 L 15 50 L 25 50 L 25 25 L 40 25 Z"
                  fill="#06b6d4"
                  stroke="#0e7490"
                  strokeWidth="2"
                />
                <circle cx="20" cy="38" r="3" fill="#fff" opacity="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Result display */}
      {result && !spinning && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 p-8 backdrop-blur-xl shadow-2xl animate-bounce-in">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400 mb-2">🎉 You Got:</p>
            <p className="text-3xl font-bold text-base-content">{getPetName(result.pet)}</p>
            <p className="text-sm text-base-content/70 mt-1">
              with a <span className="font-semibold capitalize text-purple-400">{result.scarf}</span> scarf
            </p>
          </div>
          
          {/* Show the actual pet */}
          <div className="scale-150 my-4">
            <PixelPet petType={result.pet} level={1} accessories={[{ type: 'scarf', color: result.scarf }]} />
          </div>

          <p className="text-sm text-center text-base-content/80 italic max-w-xs">
            "{getPetDescription(result.pet)}"
          </p>

          {/* Decorative stars */}
          <div className="flex gap-2">
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>⭐</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '150ms' }}>✨</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '300ms' }}>⭐</span>
          </div>
        </div>
      )}

      {/* Spin button */}
      {!result && (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`btn btn-lg bg-gradient-to-r from-cyan-500 to-purple-500 border-0 text-white gap-2 shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all ${
            spinning ? 'animate-pulse' : ''
          }`}
        >
          {spinning ? (
            <>
              <span className="loading loading-spinner" />
              Spinning Magic...
            </>
          ) : (
            <>
              <span className="text-2xl">🎡</span>
              <span className="font-bold">SPIN THE WHEEL!</span>
              <span className="text-2xl">✨</span>
            </>
          )}
        </button>
      )}

      {/* Instructions */}
      {!result && !spinning && (
        <div className="text-center text-xs text-base-content/50 max-w-md">
          <p>Each companion comes with unique traits and abilities.</p>
          <p className="mt-1">Your pet will grow and evolve as you learn! 📚</p>
        </div>
      )}
    </div>
  );
};
