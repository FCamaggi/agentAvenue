import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import RecruitedAgents from '../components/RecruitedAgents';
import Card from '../components/Card';
import AgentSelectionModal from '../components/AgentSelectionModal';
import { LogOut, Info } from 'lucide-react';

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { state, dispatch } = useGame();

  const [selectedHandCards, setSelectedHandCards] = useState([]);
  const [playedCards, setPlayedCards] = useState({
    faceUp: null,
    faceDown: null,
  });
  const [recruitChoice, setRecruitChoice] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [cardToDiscard, setCardToDiscard] = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [blackMarketSupply, setBlackMarketSupply] = useState([]);
  
  // Estado para interacciones del Mercado Negro
  const [blackMarketInteraction, setBlackMarketInteraction] = useState({
    isOpen: false,
    card: null,
    interactionType: null,
    message: '',
  });

  useEffect(() => {
    if (!socket) return;

    // Recibir estado inicial del juego
    socket.emit('get-game-state', { gameId });

    // Escuchar actualizaciones del juego
    socket.on('game-state-updated', (data) => {
      dispatch({ type: 'UPDATE_GAME_STATE', payload: data.gameState });

      // Actualizar fase del juego
      if (data.gameState.phase) {
        dispatch({ type: 'SET_PHASE', payload: data.gameState.phase });
      }

      // Actualizar mano del jugador
      const myPlayer = data.gameState.players.find(
        (p) => p.id === state.playerId,
      );
      if (myPlayer) {
        dispatch({ type: 'UPDATE_HAND', payload: myPlayer.hand });
        dispatch({
          type: 'UPDATE_RECRUITED',
          payload: myPlayer.recruitedAgents,
        });
        dispatch({
          type: 'SET_TURN',
          payload: data.gameState.currentPlayer === state.playerId,
        });
        // Actualizar descartes restantes
        if (myPlayer.discardsRemaining !== undefined) {
          dispatch({
            type: 'SET_DISCARDS_REMAINING',
            payload: myPlayer.discardsRemaining,
          });
        }
      }

      // Actualizar oferta del Mercado Negro
      if (data.gameState.blackMarketSupply) {
        setBlackMarketSupply(data.gameState.blackMarketSupply);
      }
    });

    socket.on('cards-played', (data) => {
      setPlayedCards({ faceUp: data.faceUp, faceDown: data.faceDown });
      dispatch({ type: 'SET_PHASE', payload: 'recruiting' });
      
      if (!state.isMyTurn) {
        toast('🎴 Tu oponente jugó sus cartas', {
          icon: '👀',
          duration: 2000,
        });
      }
    });

    socket.on('agent-recruited', (data) => {
      console.log('Agente reclutado:', data);
      setPlayedCards({ faceUp: null, faceDown: null });
      setRecruitChoice(null);
      dispatch({ type: 'SET_PHASE', payload: 'playing' });
      
      // Notificar reclutamiento
      const currentPlayer = state.gameState?.players?.find(p => p.id === state.gameState.currentPlayer);
      if (currentPlayer && currentPlayer.id === state.playerId) {
        toast.success('🎯 Es tu turno para jugar', {
          duration: 2500,
        });
      }
    });

    socket.on('game-over', (data) => {
      dispatch({ type: 'GAME_OVER', payload: data.winner });
      
      if (data.winner === state.playerId) {
        toast.success('🎉 ¡Ganaste la partida!', {
          duration: 5000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        });
      } else {
        toast.error('😔 Perdiste esta vez', {
          duration: 5000,
        });
      }
    });

    socket.on('player-disconnected', (data) => {
      console.log('Jugador desconectado:', data);
      toast.error('⚠️ Un jugador se desconectó', {
        duration: 3000,
      });
    });

    socket.on('error', (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message, {
        duration: 3000,
      });
      setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 3000);
    });

    socket.on('card-discarded', (data) => {
      console.log('Carta descartada:', data);
      dispatch({
        type: 'SET_DISCARDS_REMAINING',
        payload: data.discardsRemaining,
      });
      toast('🗑️ Carta descartada', {
        icon: '♻️',
        duration: 1500,
      });
    });

    socket.on('black-market-taken', (data) => {
      console.log('Carta del Mercado Negro tomada:', data);
      if (data.playerId === state.playerId) {
        dispatch({ type: 'ADD_BLACK_MARKET_CARD', payload: data.card });
        toast.success(`🏪 Obtuviste: ${data.card.name}`, {
          duration: 3000,
        });
      } else {
        toast('🏪 Oponente visitó el Mercado Negro', {
          icon: '🕵️',
          duration: 2000,
        });
      }
    });

    socket.on('black-market-interaction-required', (data) => {
      console.log('Interacción requerida del Mercado Negro:', data);
      if (data.playerId === state.playerId) {
        setBlackMarketInteraction({
          isOpen: true,
          card: data.card,
          interactionType: data.interactionType,
          message: data.message,
        });
        toast(data.message, {
          icon: '🎯',
          duration: 5000,
        });
      }
    });

    socket.on('black-market-effect-completed', (data) => {
      console.log('Efecto del Mercado Negro completado:', data);
      toast.success(data.result, {
        icon: '✨',
        duration: 3000,
      });
    });

    return () => {
      socket.off('game-state-updated');
      socket.off('cards-played');
      socket.off('agent-recruited');
      socket.off('game-over');
      socket.off('player-disconnected');
      socket.off('error');
      socket.off('card-discarded');
      socket.off('black-market-taken');
      socket.off('black-market-interaction-required');
      socket.off('black-market-effect-completed');
    };
  }, [socket, gameId, dispatch, state.playerId]);

  const handleCardSelect = (card, index) => {
    if (state.phase !== 'playing' || !state.isMyTurn) return;

    setSelectedHandCards((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, index];
    });
  };

  const handlePlayCards = () => {
    if (selectedHandCards.length !== 2) return;

    const cards = selectedHandCards.map((i) => state.hand[i]);

    // Verificar que sean diferentes
    if (cards[0].name === cards[1].name) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Debes jugar dos cartas diferentes',
      });
      setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 3000);
      return;
    }

    // Limpiar error anterior si existe
    dispatch({ type: 'CLEAR_ERROR' });

    socket.emit('play-cards', {
      gameId,
      faceUpIndex: selectedHandCards[0],
      faceDownIndex: selectedHandCards[1],
    });

    setSelectedHandCards([]);
  };

  const handleRecruitChoice = (cardType) => {
    if (state.phase !== 'recruiting' || state.isMyTurn) return;

    setRecruitChoice(cardType);
    socket.emit('recruit-agent', {
      gameId,
      choice: cardType, // 'faceUp' | 'faceDown'
    });
  };

  const handleDiscardCard = (cardIndex) => {
    if (state.discardsRemaining <= 0) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'No te quedan descartes disponibles',
      });
      setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 3000);
      return;
    }

    setCardToDiscard(cardIndex);
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    if (cardToDiscard !== null) {
      socket.emit('discard-card', {
        gameId,
        cardIndex: cardToDiscard,
      });
      setCardToDiscard(null);
      setShowDiscardConfirm(false);
    }
  };

  const cancelDiscard = () => {
    setCardToDiscard(null);
    setShowDiscardConfirm(false);
  };

  // Manejar selección para efectos del Mercado Negro
  const handleBlackMarketSelection = (selection) => {
    if (!blackMarketInteraction.interactionType) return;

    // Preparar la selección según el tipo
    let formattedSelection = {};

    switch (blackMarketInteraction.interactionType) {
      case 'steal-agent':
        // Mind Control - selecciona nombre de agente
        formattedSelection = { agentName: selection.name };
        break;

      case 'recruit-different':
      case 'recruit-from-hand':
        // Secret Recruit / Double Trouble - selecciona carta de mano
        formattedSelection = { card: selection };
        break;

      case 'recruit-sentinel':
        // Outpost - automático, no necesita selección
        formattedSelection = {};
        break;

      case 'return-and-recruit':
        // Spycation - selecciona nombre de agente propio
        formattedSelection = { agentName: selection.name };
        break;

      default:
        console.error('Tipo de interacción desconocido');
        return;
    }

    // Enviar selección al servidor
    socket.emit('complete-black-market-effect', {
      gameId,
      selection: formattedSelection,
    });

    // Cerrar modal
    setBlackMarketInteraction({
      isOpen: false,
      card: null,
      interactionType: null,
      message: '',
    });
  };

  // Preparar opciones para el modal según el tipo de interacción
  const getBlackMarketOptions = () => {
    if (!blackMarketInteraction.interactionType) return { type: 'agents', options: [] };

    const myPlayer = state.players?.find(p => p.id === state.playerId);
    const opponent = state.players?.find(p => p.id !== state.playerId);

    switch (blackMarketInteraction.interactionType) {
      case 'steal-agent':
        // Mind Control - mostrar agentes del oponente
        if (!opponent || !opponent.recruitedAgents) return { type: 'opponent-agents', options: [] };
        
        const opponentAgents = Object.entries(opponent.recruitedAgents)
          .map(([name, cards]) => ({
            name,
            count: cards.length,
            cards,
          }))
          .filter(ag => ag.count > 0);
        
        return { type: 'opponent-agents', options: opponentAgents };

      case 'recruit-different':
        // Secret Recruit - mostrar cartas de mano que NO estén en juego
        if (!myPlayer) return { type: 'hand', options: [] };
        
        const differentCards = state.hand.filter(card => 
          !myPlayer.recruitedAgents || !myPlayer.recruitedAgents[card.name]
        );
        
        return { type: 'hand', options: differentCards };

      case 'recruit-from-hand':
        // Double Trouble - mostrar cartas que tengan al menos 2 en mano
        const cardCounts = {};
        state.hand.forEach(card => {
          cardCounts[card.name] = (cardCounts[card.name] || 0) + 1;
        });
        
        const duplicateCards = state.hand.filter(card => cardCounts[card.name] >= 2);
        const unique = duplicateCards.reduce((acc, card) => {
          if (!acc.find(c => c.name === card.name)) acc.push(card);
          return acc;
        }, []);
        
        return { type: 'hand', options: unique };

      case 'recruit-sentinel':
        // Outpost - buscar Sentinel en mano
        const sentinels = state.hand.filter(card => card.name === 'Sentinel');
        return { type: 'hand', options: sentinels };

      case 'return-and-recruit':
        // Spycation - mostrar agentes propios en juego
        if (!myPlayer || !myPlayer.recruitedAgents) return { type: 'agents', options: [] };
        
        const myAgents = Object.entries(myPlayer.recruitedAgents)
          .map(([name, cards]) => ({
            name,
            count: cards.length,
            cards,
          }))
          .filter(ag => ag.count > 0);
        
        return { type: 'agents', options: myAgents };

      default:
        return { type: 'agents', options: [] };
    }
  };

  const handleLeaveGame = () => {
    if (confirm('¿Seguro que quieres abandonar el juego?')) {
      socket.emit('leave-game', { gameId });
      navigate('/');
    }
  };

  const getPhaseMessage = () => {
    if (state.phase === 'finished') {
      return state.winner === state.playerId ? '¡Has ganado!' : 'Has perdido';
    }

    if (!state.isMyTurn && state.phase === 'recruiting') {
      return '🎯 Elige qué agente reclutar';
    }

    if (state.isMyTurn && state.phase === 'playing') {
      return '🎴 Tu turno: Juega 2 cartas';
    }

    if (state.isMyTurn && state.phase === 'recruiting') {
      return '⏳ Esperando que el oponente reclute...';
    }

    return '⏳ Turno del oponente...';
  };

  const getTurnIndicatorColor = () => {
    if (state.phase === 'finished') {
      return state.winner === state.playerId 
        ? 'bg-green-600' 
        : 'bg-red-600';
    }
    return state.isMyTurn ? 'bg-game-teal' : 'bg-orange-500';
  };

  const opponent = state.gameState?.players.find(
    (p) => p.id !== state.playerId,
  );

  return (
    <div className="min-h-screen p-2 sm:p-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Agent Avenue
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Modo:{' '}
              {state.gameMode === 'simple'
                ? 'Simple'
                : state.gameMode === 'advanced'
                  ? 'Avanzado'
                  : 'Equipos'}
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowRules(!showRules)}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleLeaveGame}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Fase del juego */}
        <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border-2 transition-all duration-300 ${getTurnIndicatorColor()} ${state.isMyTurn && state.phase !== 'finished' ? 'animate-pulse shadow-lg' : ''}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white truncate">
                {getPhaseMessage()}
              </h2>
              {state.isMyTurn && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-xs sm:text-sm">
                    Tu turno
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {state.gameState && (
                <div className="text-slate-400 text-xs sm:text-sm">
                  Turno {state.gameState.turnNumber || 1}
                </div>
              )}

              {/* Indicador de descartes */}
              {state.isMyTurn && state.phase === 'playing' && (
                <div className="text-xs sm:text-sm text-slate-300 bg-slate-700 px-2 sm:px-3 py-1 rounded-full">
                  🔄 {state.discardsRemaining} descartes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {state.error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm shake">
            {state.error}
          </div>
        )}

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Columna izquierda: Tablero */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <GameBoard
              gameState={state.gameState}
              playerId={state.playerId}
              isAdvancedMode={state.gameMode === 'advanced'}
            />

            {/* Cartas jugadas */}
            {(playedCards.faceUp || playedCards.faceDown) && (
              <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
                <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">
                  Cartas Jugadas
                </h3>
                <div className="flex gap-3 sm:gap-4 justify-center flex-wrap sm:flex-nowrap">
                  {playedCards.faceUp && (
                    <div
                      onClick={() =>
                        !state.isMyTurn && handleRecruitChoice('faceUp')
                      }
                      className={`${!state.isMyTurn ? 'cursor-pointer transform hover:scale-105 transition-transform' : ''} flex-shrink-0`}
                    >
                      <Card
                        agent={playedCards.faceUp}
                        faceUp={true}
                        size="lg"
                        selected={recruitChoice === 'faceUp'}
                      />
                      <p className="text-center text-white text-xs sm:text-sm mt-2">
                        Boca Arriba
                      </p>
                    </div>
                  )}
                  {playedCards.faceDown && (
                    <div
                      onClick={() =>
                        !state.isMyTurn && handleRecruitChoice('faceDown')
                      }
                      className={`${!state.isMyTurn ? 'cursor-pointer transform hover:scale-105 transition-transform' : ''} flex-shrink-0`}
                    >
                      <Card
                        agent={playedCards.faceDown}
                        faceUp={state.isMyTurn || state.phase === 'finished'}
                        size="lg"
                        selected={recruitChoice === 'faceDown'}
                      />
                      <p className="text-center text-white text-xs sm:text-sm mt-2">
                        Boca Abajo
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mercado Negro (solo modo avanzado) */}
            {state.gameMode === 'advanced' && blackMarketSupply.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-yellow-500/30">
                <h3 className="text-yellow-400 font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                  <span>🛒</span> Mercado Negro
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {blackMarketSupply.map((card, idx) => (
                    <div key={idx} className="text-center">
                      <div className="bg-slate-700 rounded-lg p-2 border border-yellow-500/50">
                        <div className="text-white font-semibold text-xs sm:text-sm mb-1">
                          {card.name}
                        </div>
                        <div className="text-yellow-400 text-[10px] sm:text-xs">
                          {card.type === 'instant'
                            ? '⚡ Instant'
                            : '♾️ Permanent'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-2 text-center">
                  Se obtienen al caer exactamente en casilla del Mercado Negro
                </p>
              </div>
            )}
          </div>

          {/* Columna derecha: Información de jugadores */}
          <div className="space-y-4 sm:space-y-6">
            {/* Oponente */}
            {opponent && (
              <RecruitedAgents
                agents={opponent.recruitedAgents}
                playerName={opponent.name}
                isOpponent={true}
              />
            )}

            {/* Tus agentes */}
            <RecruitedAgents
              agents={state.recruitedAgents}
              playerName={state.playerName}
              isOpponent={false}
            />
          </div>
        </div>

        {/* Tu mano */}
        <div className="mt-4 sm:mt-6">
          <PlayerHand
            cards={state.hand}
            onCardClick={handleCardSelect}
            selectedCards={selectedHandCards}
            disabled={!state.isMyTurn || state.phase !== 'playing'}
            maxSelection={2}
          />

          {/* Indicadores de selección */}
          {selectedHandCards.length > 0 && state.isMyTurn && state.phase === 'playing' && (
            <div className="mt-3 flex justify-center gap-3 text-sm">
              {selectedHandCards.length >= 1 && (
                <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-lg font-semibold">
                  👆 1ra carta → Boca Arriba
                </div>
              )}
              {selectedHandCards.length >= 2 && (
                <div className="bg-purple-500/20 border border-purple-500 text-purple-400 px-4 py-2 rounded-lg font-semibold">
                  👆 2da carta → Boca Abajo
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          {state.isMyTurn && state.phase === 'playing' && (
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handlePlayCards}
                disabled={selectedHandCards.length !== 2}
                className="bg-game-teal hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 sm:px-8 rounded-xl transition-all shadow-lg text-sm sm:text-base"
              >
                ▶️ Jugar Cartas Seleccionadas
              </button>

              {state.discardsRemaining > 0 &&
                selectedHandCards.length === 1 && (
                  <button
                    onClick={() => handleDiscardCard(selectedHandCards[0])}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl transition-all shadow-lg text-sm sm:text-base"
                  >
                    🔄 Descartar y Robar ({state.discardsRemaining} restantes)
                  </button>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de descarte */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm border border-slate-700 shake">
            <h2 className="text-xl font-bold text-white mb-4">
              ¿Descartar carta?
            </h2>
            <p className="text-slate-300 mb-6">
              Descartarás esta carta y robarás una nueva. Te quedarán{' '}
              <span className="text-game-teal font-bold">
                {state.discardsRemaining - 1}
              </span>{' '}
              descartes disponibles en esta partida.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDiscard}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDiscard}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de reglas */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Reglas del Juego
            </h2>
            <div className="text-slate-300 space-y-3 text-sm sm:text-base">
              <p>
                <strong>Objetivo:</strong> Captura el peón de tu oponente antes
                de que capture el tuyo.
              </p>
              <p>
                <strong>Turno:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Juega 2 cartas diferentes (1 boca arriba, 1 boca abajo)</li>
                <li>
                  Tu oponente elige una carta para reclutar, tú obtienes la otra
                </li>
                <li>Ambos mueven sus peones según el agente reclutado</li>
              </ol>
              <p>
                <strong>Movimiento:</strong> Según cuántos agentes del mismo
                tipo tengas:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>1 agente: usa el 1er símbolo (arriba)</li>
                <li>2 agentes: usa el 2do símbolo (medio)</li>
                <li>3+ agentes: usa el 3er símbolo (abajo)</li>
              </ul>
              <p>
                <strong>Descarte:</strong> Puedes descartar una carta y robar
                una nueva hasta 4 veces por partida.
              </p>
              <p>
                <strong>Victoria:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Captura el peón del oponente</li>
                <li>Recluta 3 Codebreakers</li>
              </ul>
              <p>
                <strong>Derrota:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Recluta 3 Daredevils</li>
              </ul>
              {state.gameMode === 'advanced' && (
                <>
                  <p className="text-yellow-400 font-semibold mt-4">
                    <strong>Modo Avanzado - Mercado Negro:</strong>
                  </p>
                  <p>
                    Al caer EXACTAMENTE en una casilla del Mercado Negro
                    (esquinas), tomas una carta especial con efectos únicos.
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="mt-6 w-full bg-game-teal hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de selección para Mercado Negro */}
      {blackMarketInteraction.isOpen && (() => {
        const { type, options } = getBlackMarketOptions();
        
        return (
          <AgentSelectionModal
            isOpen={blackMarketInteraction.isOpen}
            onClose={() => setBlackMarketInteraction({ isOpen: false, card: null, interactionType: null, message: '' })}
            onSelect={handleBlackMarketSelection}
            title={blackMarketInteraction.card?.name || 'Mercado Negro'}
            description={blackMarketInteraction.message}
            options={options}
            type={type}
            multiSelect={false}
            maxSelections={1}
          />
        );
      })()}
    </div>
  );
};

export default GamePage;
