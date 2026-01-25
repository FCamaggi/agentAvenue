import React from 'react';
import { Home } from 'lucide-react';

// Icono del Carrito Ladrón (Burglar/Black Market)
const BurglarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-6 h-6 text-slate-900"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 8h16l-2 10H6L4 8z" fill="#1e293b" stroke="none" />
    <path d="M8 8V5a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    <g transform="translate(6, 11)">
      <path
        d="M0 2 C0 0.5, 1.5 0, 3 0 C4.5 0, 5.5 1, 6 2 C6.5 1, 7.5 0, 9 0 C10.5 0, 12 0.5, 12 2 C12 3.5, 9 5, 6 5 C3 5, 0 3.5, 0 2 Z"
        fill="white"
      />
      <circle cx="3" cy="2" r="0.5" fill="black" />
      <circle cx="9" cy="2" r="0.5" fill="black" />
    </g>
    <circle cx="8" cy="20" r="1.5" fill="#1e293b" />
    <circle cx="16" cy="20" r="1.5" fill="#1e293b" />
  </svg>
);

const GameBoard = ({ gameState, isAdvancedMode, onTileClick }) => {
  // Definición de las casillas (14 tiles en total)
  const tiles = [
    // Top Row (1-4)
    {
      id: 1,
      type: 'corner',
      content: 'burglar',
      side: 'top-left',
      grid: { col: 1, row: 1 },
    },
    {
      id: 2,
      type: 'path',
      content: 'empty',
      side: 'top',
      grid: { col: 2, row: 1 },
    },
    {
      id: 3,
      type: 'path',
      content: 'empty',
      side: 'top',
      grid: { col: 3, row: 1 },
    },
    {
      id: 4,
      type: 'corner',
      content: 'burglar',
      side: 'top-right',
      grid: { col: 4, row: 1 },
    },

    // Right Column (5-7)
    {
      id: 5,
      type: 'path',
      content: 'empty',
      side: 'right',
      grid: { col: 4, row: 2 },
    },
    {
      id: 6,
      type: 'path',
      content: 'house-blue',
      side: 'right',
      grid: { col: 4, row: 3 },
    },
    {
      id: 7,
      type: 'path',
      content: 'empty',
      side: 'right',
      grid: { col: 4, row: 4 },
    },

    // Bottom Row (8-11)
    {
      id: 8,
      type: 'corner',
      content: 'burglar',
      side: 'bottom-right',
      grid: { col: 4, row: 5 },
    },
    {
      id: 9,
      type: 'path',
      content: 'empty',
      side: 'bottom',
      grid: { col: 3, row: 5 },
    },
    {
      id: 10,
      type: 'path',
      content: 'empty',
      side: 'bottom',
      grid: { col: 2, row: 5 },
    },
    {
      id: 11,
      type: 'corner',
      content: 'burglar',
      side: 'bottom-left',
      grid: { col: 1, row: 5 },
    },

    // Left Column (12-14)
    {
      id: 12,
      type: 'path',
      content: 'empty',
      side: 'left',
      grid: { col: 1, row: 4 },
    },
    {
      id: 13,
      type: 'path',
      content: 'house-green',
      side: 'left',
      grid: { col: 1, row: 3 },
    },
    {
      id: 14,
      type: 'path',
      content: 'empty',
      side: 'left',
      grid: { col: 1, row: 2 },
    },
  ];

  const getTileConfig = (tile) => {
    let bgColor = 'bg-[#FDF6D8]';
    let textColor = 'text-slate-800';
    let icon = null;
    let rotation = 'rotate-0';
    let isPath = tile.type === 'path';

    // Colores y contenido
    if (tile.content === 'house-green') {
      bgColor = 'bg-[#1E7E34]';
      textColor = 'text-white';
      icon = <Home className="w-8 h-8 fill-current stroke-2" />;
    } else if (tile.content === 'house-blue') {
      bgColor = 'bg-[#2E75B6]';
      textColor = 'text-white';
      icon = <Home className="w-8 h-8 fill-current stroke-2" />;
    } else if (tile.content === 'burglar') {
      icon = <BurglarIcon />;
    }

    // Rotación según el lado (flujo horario)
    if (isPath) {
      if (tile.side === 'right') rotation = 'rotate-90';
      if (tile.side === 'bottom') rotation = 'rotate-180';
      if (tile.side === 'left') rotation = '-rotate-90';
    }

    return { bgColor, textColor, icon, rotation, isPath };
  };

  // Encontrar peones en cada casilla
  const getPawnsOnTile = (tileId) => {
    if (!gameState || !gameState.players) return [];

    return gameState.players.filter((player) => player.position === tileId);
  };

  const getBackgroundImage = () => {
    if (isAdvancedMode) {
      return '/fondo_tableros/Advanced.png';
    }
    return '/fondo_tableros/Basic.png';
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[3/4] bg-teal-200/30 rounded-[2.5rem] p-2 sm:p-3 shadow-2xl border-4 sm:border-8 border-teal-100/80 overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <img
          src={getBackgroundImage()}
          alt="Board Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Grid de casillas */}
      <div className="relative z-10 w-full h-full grid grid-cols-4 grid-rows-5 gap-0.5 sm:gap-1">
        {tiles.map((tile) => {
          const { bgColor, textColor, icon, rotation, isPath } =
            getTileConfig(tile);
          const pawns = getPawnsOnTile(tile.id);
          const isBlackMarket = isAdvancedMode && tile.content === 'burglar';

          return (
            <div
              key={tile.id}
              style={{ gridColumn: tile.grid.col, gridRow: tile.grid.row }}
              className="relative flex items-center justify-center"
              onClick={() => onTileClick && onTileClick(tile.id)}
            >
              {/* Contenedor de forma */}
              <div className="relative flex items-center justify-center w-full h-full filter drop-shadow-[0_0_1px_rgba(0,0,0,1)] drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] transition-transform hover:scale-105">
                {/* Forma recortada */}
                <div
                  className={`
                    w-full h-full flex items-center justify-center
                    ${bgColor} ${textColor}
                    ${isPath ? rotation : ''} 
                    ${isPath ? 'clip-arrow-shape' : 'rounded-xl sm:rounded-2xl'} 
                    ${isBlackMarket ? 'ring-2 ring-yellow-400 ring-opacity-70 animate-pulse' : ''}
                  `}
                  style={
                    isPath
                      ? { width: '90%', height: '80%' }
                      : { width: '95%', height: '95%' }
                  }
                >
                  {/* Contenido contrarrestando la rotación */}
                  <div
                    className={`
                      ${
                        isPath
                          ? tile.side === 'right'
                            ? '-rotate-90'
                            : tile.side === 'bottom'
                              ? 'rotate-180'
                              : tile.side === 'left'
                                ? 'rotate-90'
                                : ''
                          : ''
                      }
                      scale-75 sm:scale-100
                    `}
                  >
                    {icon}
                  </div>
                </div>
              </div>

              {/* Peones */}
              {pawns.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="flex gap-0.5 sm:gap-1">
                    {pawns.map((player, idx) => (
                      <div
                        key={player.id}
                        className={`
                          w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-lg 
                          pawn-animate
                          ${
                            player.color === 'green'
                              ? 'bg-game-green'
                              : player.color === 'blue'
                                ? 'bg-game-blue'
                                : player.color === 'red'
                                  ? 'bg-red-600'
                                  : 'bg-yellow-600'
                          }
                        `}
                        style={{
                          transform:
                            pawns.length > 1
                              ? `translateX(${idx * -4}px)`
                              : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;
