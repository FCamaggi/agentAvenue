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
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border-2 border-slate-700 shadow-xl fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
          {isOpponent ? (
            <>
              <span className="text-orange-400">🎭</span>
              <span>Agentes de {playerName}</span>
            </>
          ) : (
            <>
              <span className="text-game-teal">👤</span>
              <span>Tus Agentes</span>
            </>
          )}
        </h3>
        <span className="text-slate-300 text-sm font-semibold bg-slate-700/50 px-3 py-1 rounded-full">
          {groupedAgents.reduce((sum, g) => sum + g.count, 0)} total
        </span>
      </div>

      {groupedAgents.length === 0 ? (
        <div className="text-slate-400 text-center py-8 text-sm border-2 border-dashed border-slate-700 rounded-lg">
          <div className="text-3xl mb-2 opacity-50">📭</div>
          <div>Sin agentes reclutados</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {groupedAgents.map((group) => (
            <div key={group.name} className="relative recruit-flash">
              <Card
                agent={{ name: group.name }}
                faceUp={true}
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
