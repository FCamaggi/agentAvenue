import React from 'react';
import Card from './Card';

const PlayerHand = ({
  cards,
  onCardClick,
  selectedCards = [],
  disabled = false,
  maxSelection = 2,
}) => {
  const handleCardClick = (card, index) => {
    if (disabled) return;
    if (onCardClick) onCardClick(card, index);
  };

  const isSelected = (index) => selectedCards.includes(index);

  return (
    <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm sm:text-base">
          Tu Mano
        </h3>
        <span className="text-slate-400 text-xs sm:text-sm">
          {cards.length} carta{cards.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-hidden -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex sm:flex-wrap gap-2 sm:gap-3 justify-start sm:justify-center min-w-min sm:min-w-0 pb-2 sm:pb-0">
          {cards.length === 0 ? (
            <div className="text-slate-500 text-center py-8 w-full">
              No tienes cartas en mano
            </div>
          ) : (
            cards.map((card, index) => {
              const selectionIndex = selectedCards.indexOf(index);
              const isFirstSelected = selectionIndex === 0;
              const isSecondSelected = selectionIndex === 1;
              
              return (
                <div key={`hand-${index}`} className="flex-shrink-0 card-appear relative">
                  {/* Badge indicador */}
                  {isFirstSelected && (
                    <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white">
                      👆 Boca Arriba
                    </div>
                  )}
                  {isSecondSelected && (
                    <div className="absolute -top-2 -right-2 z-10 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white">
                      👇 Boca Abajo
                    </div>
                  )}
                  
                  <Card
                    agent={card}
                    faceUp={true}
                    onClick={() => handleCardClick(card, index)}
                    selected={isSelected(index)}
                    disabled={
                      disabled ||
                      (selectedCards.length >= maxSelection && !isSelected(index))
                    }
                    size="lg"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedCards.length > 0 && !disabled && (
        <div className="mt-3 text-center text-xs sm:text-sm text-game-teal font-semibold">
          {selectedCards.length} de {maxSelection} seleccionada
          {selectedCards.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default PlayerHand;
