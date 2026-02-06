import React from 'react';

const AGENT_IMAGES = {
  'Double Agent': '/tarjetas/Double_Agent.png',
  Enforcer: '/tarjetas/Enforcer.png',
  Codebreaker: '/tarjetas/Codebreaker.png',
  Saboteur: '/tarjetas/Saboteur.png',
  Daredevil: '/tarjetas/Daredevil.png',
  Sentinel: '/tarjetas/Sentinel.png',
  Mole: '/tarjetas/Mole.png',
  Sidekick: '/tarjetas/Sidekick.png',
  Back: '/tarjetas/Back.png',
};

const Card = ({
  agent,
  card, // Alias para agent (para compatibilidad)
  faceUp = true,
  onClick,
  selected = false,
  disabled = false,
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg'
  showCount = false,
  count = 0,
}) => {
  // Usar card si se proporciona, sino usar agent
  const cardData = card || agent;
  
  const sizeClasses = {
    xs: 'w-12 h-18',
    sm: 'w-16 h-24',
    md: 'w-24 h-36',
    lg: 'w-32 h-48',
  };

  const imageSrc =
    faceUp && cardData ? AGENT_IMAGES[cardData.name] : AGENT_IMAGES['Back'];

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative ${sizeClasses[size]} rounded-lg overflow-hidden shadow-lg transition-all duration-200
        ${!disabled && onClick ? 'cursor-pointer card-hover' : 'cursor-default'}
        ${selected ? 'ring-4 ring-game-teal transform scale-105' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* Imagen de la carta */}
      <img
        src={imageSrc}
        alt={faceUp && cardData ? cardData.name : 'Card Back'}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />

      {/* Fallback si la imagen no carga */}
      <div
        className="hidden w-full h-full items-center justify-center bg-slate-700 text-white text-center p-2"
        style={{ display: 'none' }}
      >
        <span className="text-xs font-semibold">
          {faceUp && agent ? agent.name : '?'}
        </span>
      </div>

      {/* Badge de contador */}
      {showCount && count > 0 && (
        <div className="absolute top-1 right-1 bg-slate-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white">
          {count}
        </div>
      )}

      {/* Indicador de selección */}
      {selected && (
        <div className="absolute inset-0 bg-game-teal bg-opacity-20 border-4 border-game-teal rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default Card;
