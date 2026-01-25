import React from 'react';
import Card from './Card';

const RecruitedAgents = ({ agents, playerName, isOpponent = false }) => {
  // Agrupar agentes por nombre
  const groupedAgents = Object.entries(agents || {}).map(([name, cards]) => ({
    name,
    cards,
    count: cards.length,
  }));

  return (
    <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm sm:text-base">
          {isOpponent ? `Agentes de ${playerName}` : 'Tus Agentes Reclutados'}
        </h3>
        <span className="text-slate-400 text-xs sm:text-sm">
          {groupedAgents.reduce((sum, g) => sum + g.count, 0)} total
        </span>
      </div>

      {groupedAgents.length === 0 ? (
        <div className="text-slate-500 text-center py-4 sm:py-6 text-sm">
          Sin agentes reclutados
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {groupedAgents.map((group) => (
            <div key={group.name} className="relative recruit-flash">
              <Card
                agent={{ name: group.name }}
                faceUp={!isOpponent}
                size="sm"
                showCount={true}
                count={group.count}
              />

              {/* Indicadores especiales */}
              {group.name === 'Codebreaker' && group.count >= 3 && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold animate-pulse">
                  ¡Victoria!
                </div>
              )}

              {group.name === 'Daredevil' && group.count >= 3 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold animate-pulse">
                  ¡Derrota!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruitedAgents;
