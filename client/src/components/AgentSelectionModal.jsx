import React from 'react';
import Card from './Card';

/**
 * Modal reutilizable para seleccionar agentes
 * Soporta múltiples modos: agentes propios, del oponente, cartas de mano, etc.
 */
export default function AgentSelectionModal({
  isOpen,
  onClose,
  onSelect,
  title,
  description,
  options,
  type = 'agents', // 'agents' | 'hand' | 'opponent-agents'
  multiSelect = false,
  maxSelections = 1,
}) {
  const [selected, setSelected] = React.useState([]);

  if (!isOpen) return null;

  const handleSelect = (item) => {
    if (multiSelect) {
      if (selected.includes(item)) {
        setSelected(selected.filter(s => s !== item));
      } else if (selected.length < maxSelections) {
        setSelected([...selected, item]);
      }
    } else {
      setSelected([item]);
    }
  };

  const handleConfirm = () => {
    if (selected.length > 0) {
      onSelect(multiSelect ? selected : selected[0]);
      setSelected([]);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelected([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 fade-in">
      <div className="bg-slate-800 border-2 border-game-teal rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-game-teal mb-2">{title}</h2>
          {description && (
            <p className="text-slate-300 text-sm">{description}</p>
          )}
        </div>

        {/* Opciones */}
        <div className="mb-6 max-h-96 overflow-y-auto">
          {type === 'hand' ? (
            // Mostrar cartas de mano
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {options.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(card)}
                  className={`
                    transform transition-all duration-200 hover:scale-105
                    ${selected.includes(card) ? 'ring-4 ring-yellow-400 scale-105' : ''}
                  `}
                >
                  <Card card={card} faceUp={true} size="sm" />
                </button>
              ))}
            </div>
          ) : type === 'agents' || type === 'opponent-agents' ? (
            // Mostrar agentes reclutados (propios o del oponente)
            <div className="space-y-3">
              {options.map((agentGroup, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(agentGroup)}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200
                    ${selected.includes(agentGroup)
                      ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400'
                      : 'border-slate-600 bg-slate-700/50 hover:border-game-teal hover:bg-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Card card={agentGroup.cards[0]} faceUp={true} size="xs" />
                      <div className="text-left">
                        <div className="font-bold text-white">{agentGroup.name}</div>
                        <div className="text-sm text-slate-400">
                          Cantidad: {agentGroup.count}
                        </div>
                      </div>
                    </div>
                    {selected.includes(agentGroup) && (
                      <div className="text-yellow-400 text-2xl">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Información de selección múltiple */}
        {multiSelect && (
          <div className="mb-4 text-center text-sm text-slate-400">
            Seleccionados: {selected.length} / {maxSelections}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className={`
              px-6 py-2 rounded-lg font-bold transition-colors
              ${selected.length > 0
                ? 'bg-game-teal text-slate-900 hover:bg-teal-400'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
