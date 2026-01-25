import React from 'react';
import { Home } from 'lucide-react';

// Icono personalizado para el "Carrito Ladrón"
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

const GameBoard = () => {
  // Definición de las casillas y su posición en el grid
  const tiles = [
    // Top Row (Izquierda a Derecha)
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

    // Right Column (Arriba a Abajo)
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

    // Bottom Row (Derecha a Izquierda - Inverso)
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

    // Left Column (Abajo a Arriba - Inverso)
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

  // Configuración visual
  const getTileConfig = (tile) => {
    let bgColor = 'bg-[#FDF6D8]'; // Beige crema
    let textColor = 'text-slate-800';
    let icon = null;
    let rotation = 'rotate-0';
    let isPath = tile.type === 'path';

    // 1. Colores y Contenido
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

    // 2. Rotación de la flecha según el lado (flujo horario)
    if (isPath) {
      // Top: apunta derecha (default)
      if (tile.side === 'right') rotation = 'rotate-90'; // Apunta abajo
      if (tile.side === 'bottom') rotation = 'rotate-180'; // Apunta izquierda
      if (tile.side === 'left') rotation = '-rotate-90'; // Apunta arriba
    }

    return { bgColor, textColor, icon, rotation, isPath };
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8 font-sans">
      {/* Contenedor del Tablero */}
      <div className="relative w-full max-w-md aspect-[3/4] bg-teal-200/30 rounded-[2.5rem] p-3 shadow-2xl border-8 border-teal-100/80 overflow-hidden">
        {/* IMAGEN DE FONDO (Placeholder) */}
        <div className="absolute inset-0 z-0 bg-slate-200">
          {/* Reemplaza src con tu imagen real */}
          <img
            src="/api/placeholder/400/600"
            alt="Background Art"
            className="w-full h-full object-cover opacity-100"
          />
        </div>

        {/* GRID LAYOUT */}
        <div className="relative z-10 w-full h-full grid grid-cols-4 grid-rows-5 gap-1">
          {tiles.map((tile) => {
            const { bgColor, textColor, icon, rotation, isPath } =
              getTileConfig(tile);

            return (
              <div
                key={tile.id}
                style={{ gridColumn: tile.grid.col, gridRow: tile.grid.row }}
                className="relative flex items-center justify-center"
              >
                {/* CONTENEDOR DE FORMA
                  Usamos 'drop-shadow' aquí porque 'clip-path' recorta los bordes normales.
                  El drop-shadow actúa como un borde falso alrededor de la forma recortada.
                */}
                <div
                  className={`
                    relative flex items-center justify-center w-full h-full
                    filter drop-shadow-[0_0_1px_rgba(0,0,0,1)] drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]
                    transition-transform hover:scale-105
                  `}
                >
                  {/* FORMA RECORTADA (La Casilla Real) */}
                  <div
                    className={`
                      w-full h-full flex items-center justify-center
                      ${bgColor} ${textColor}
                      ${isPath ? rotation : ''} 
                      ${isPath ? 'clip-arrow-shape' : 'rounded-2xl'} 
                    `}
                    // Ajustamos el tamaño de las flechas para que se vean mejor en el grid
                    style={
                      isPath
                        ? { width: '90%', height: '80%' }
                        : { width: '95%', height: '95%' }
                    }
                  >
                    {/* El contenido debe contrarrestar la rotación para mantenerse derecho */}
                    <div
                      className={
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
                    >
                      {icon}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estilos CSS para el recorte de Flecha (Chevron) */}
        <style jsx>{`
          /* Polygon crea la forma de flecha:
             - 0% 0%: Arriba Izquierda
             - 80% 0%: Arriba Derecha (antes de la punta)
             - 100% 50%: La Punta
             - 80% 100%: Abajo Derecha
             - 0% 100%: Abajo Izquierda
             - 20% 50%: La "cola" hundida hacia adentro
          */
          .clip-arrow-shape {
            clip-path: polygon(
              0% 0%,
              75% 0%,
              100% 50%,
              75% 100%,
              0% 100%,
              25% 50%
            );
          }
        `}</style>
      </div>
    </div>
  );
};

export default GameBoard;
