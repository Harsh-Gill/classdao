"use client";

import { useState } from "react";
import { PetType } from "./PixelPet";

interface SpinWheelProps {
  onSelect: (petType: PetType, scarfColor: string) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onSelect }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ pet: PetType; scarf: string } | null>(null);

  const pets: PetType[] = ["cat", "fox", "dog"];
  const scarfColors = ["red", "blue", "green", "purple", "yellow"];

  const handleSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);

    // Simulate spinning animation
    setTimeout(() => {
      const randomPet = pets[Math.floor(Math.random() * pets.length)];
      const randomScarf = scarfColors[Math.floor(Math.random() * scarfColors.length)];
      
      setResult({ pet: randomPet, scarf: randomScarf });
      setSpinning(false);
      onSelect(randomPet, randomScarf);
    }, 2000);
  };

  const getPetEmoji = (pet: PetType) => {
    if (pet === "cat") return "🐱";
    if (pet === "fox") return "🦊";
    return "🐶";
  };

  const getPetName = (pet: PetType) => {
    if (pet === "cat") return "Curious Cat";
    if (pet === "fox") return "Clever Fox";
    return "Loyal Dog";
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-base-content mb-2">Choose Your Companion!</h3>
        <p className="text-sm text-base-content/70">Spin the wheel to get your pixel pet</p>
      </div>

      {/* Wheel */}
      <div className="relative">
        <div 
          className={`relative grid grid-cols-3 gap-4 rounded-2xl border-4 border-cyan-400/30 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 p-8 backdrop-blur-xl
            ${spinning ? 'animate-spin-slow' : ''}`}
        >
          {pets.map((pet) => (
            <div
              key={pet}
              className={`flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur transition-all
                ${result?.pet === pet ? 'scale-110 border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/50' : ''}`}
            >
              <span className="text-4xl">{getPetEmoji(pet)}</span>
              <span className="mt-1 text-xs font-medium text-base-content/80">{pet}</span>
            </div>
          ))}
        </div>

        {/* Center pointer */}
        {!result && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-4 w-4 rotate-45 bg-cyan-400 shadow-lg shadow-cyan-400/50" />
          </div>
        )}
      </div>

      {/* Result display */}
      {result && !spinning && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{getPetEmoji(result.pet)}</span>
            <div>
              <p className="text-lg font-bold text-base-content">{getPetName(result.pet)}</p>
              <p className="text-sm text-base-content/70">
                with a <span className="font-semibold capitalize">{result.scarf}</span> scarf
              </p>
            </div>
          </div>
          <p className="text-xs text-center text-base-content/60 italic">
            {result.pet === "cat" && "Independent spirit, loves to explore"}
            {result.pet === "fox" && "Strategic thinker, always clever"}
            {result.pet === "dog" && "Team player, loyal companion"}
          </p>
        </div>
      )}

      {/* Spin button */}
      {!result && (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`btn btn-lg btn-secondary gap-2 shadow-lg ${spinning ? 'animate-pulse' : ''}`}
        >
          {spinning ? (
            <>
              <span className="loading loading-spinner" />
              Spinning...
            </>
          ) : (
            <>
              🎡 Spin the Wheel!
            </>
          )}
        </button>
      )}
    </div>
  );
};
