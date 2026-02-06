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

const GameBoard = ({ gameState, playerId, isAdvancedMode, onTileClick }) => {
  // Definición de las casillas (14 tiles en total)
  const tiles = [
    // Top Row (1-4)
    {
      id: 1,
      type: 'corner',
      content: isAdvancedMode ? 'burglar' : 'empty',
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
      content: isAdvancedMode ? 'burglar' : 'empty',
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
      content: isAdvancedMode ? 'burglar' : 'empty',
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
      content: isAdvancedMode ? 'burglar' : 'empty',
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
    <div className="relative w-full max-w-3xl mx-auto aspect-[6/3] bg-gradient-to-br from-teal-200/40 to-cyan-300/30 rounded-3xl p-1 sm:p-2 shadow-2xl border-4 sm:border-6 border-teal-100/80 overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <img
          src={getBackgroundImage()}
          alt="Board Background"
          className="w-full h-full object-cover scale-125 drop-shadow-lg"
          style={{ objectPosition: 'center center' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Grid de casillas */}
      <div className="relative z-10 w-full h-full grid grid-cols-4 grid-rows-5 gap-1 p-[2%]">{
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
                  <div className="flex gap-1">
                    {pawns.map((player, idx) => {
                      const isMyPawn = playerId && player.id === playerId;
                      return (
                        <div
                          key={player.id}
                          className={`
                            relative w-7 h-7 sm:w-8 sm:h-8 rounded-full
                            pawn-animate
                            ${
                              player.color === 'green'
                                ? 'bg-gradient-to-br from-game-green to-emerald-600'
                                : player.color === 'blue'
                                  ? 'bg-gradient-to-br from-game-blue to-cyan-600'
                                  : player.color === 'red'
                                    ? 'bg-gradient-to-br from-red-500 to-red-700'
                                    : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                            }
                            ${
                              isMyPawn
                                ? 'border-4 border-white ring-4 ring-yellow-400 animate-pulse shadow-2xl'
                                : 'border-3 border-white shadow-xl'
                            }
                          `}
                          style={{
                            transform:
                              pawns.length > 1
                                ? `translateX(${idx * -6}px)`
                                : 'none',
                            zIndex: isMyPawn ? 30 : 20 + idx,
                          }}
                        >
                          {/* Brillo interior */}
                          <div className="absolute inset-0 rounded-full bg-white opacity-30 blur-sm" />
                          {/* Indicador del jugador activo */}
                          {isMyPawn && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
                          )}
                        </div>
                      );
                    })}
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
