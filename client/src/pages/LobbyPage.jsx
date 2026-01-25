import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { Copy, Check, Users, Crown } from 'lucide-react';

const LobbyPage = () => {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { state, dispatch } = useGame();

  const [players, setPlayers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [hasBot, setHasBot] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Escuchar actualizaciones del lobby
    socket.on('lobby-updated', (data) => {
      setPlayers(data.players);
      setIsHost(data.hostId === state.playerId);

      // Verificar si hay bot
      const botExists = data.players.some((p) => p.isBot);
      setHasBot(botExists);

      // Si hay bot, iniciar automáticamente
      if (
        botExists &&
        data.hostId === state.playerId &&
        data.players.length === 2
      ) {
        setTimeout(() => {
          socket.emit('start-game', { lobbyCode });
        }, 1000);
      }
    });

    // Escuchar cuando el juego comienza
    socket.on('game-started', (data) => {
      dispatch({ type: 'SET_GAME_ID', payload: data.gameId });
      navigate(`/game/${data.gameId}`);
    });

    socket.on('player-left', (data) => {
      console.log('Jugador abandonó:', data);
    });

    socket.on('error', (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    });

    return () => {
      socket.off('lobby-updated');
      socket.off('game-started');
      socket.off('player-left');
      socket.off('error');
    };
  }, [socket, navigate, dispatch, state.playerId]);

  const copyLobbyCode = () => {
    navigator.clipboard.writeText(lobbyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (!isHost) return;

    const minPlayers = state.gameMode === 'team' ? 3 : 2;

    if (players.length < minPlayers) {
      dispatch({
        type: 'SET_ERROR',
        payload: `Se necesitan al menos ${minPlayers} jugadores para comenzar`,
      });
      return;
    }

    socket.emit('start-game', { lobbyCode });
  };

  const handleLeaveLobby = () => {
    socket.emit('leave-lobby', { lobbyCode });
    navigate('/');
  };

  const getColorClass = (color) => {
    const colors = {
      green: 'bg-game-green',
      blue: 'bg-game-blue',
      red: 'bg-red-600',
      yellow: 'bg-yellow-600',
    };
    return colors[color] || 'bg-slate-600';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Sala de Espera</h1>

          {/* Código de Lobby */}
          <div className="inline-flex items-center gap-3 bg-slate-800 px-6 py-4 rounded-xl border border-slate-700">
            <span className="text-slate-400">Código:</span>
            <span className="text-3xl font-mono font-bold text-game-teal tracking-wider">
              {lobbyCode}
            </span>
            <button
              onClick={copyLobbyCode}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-slate-400 mt-4">
            Modo:{' '}
            <span className="text-white font-semibold">
              {state.gameMode === 'simple' && 'Simple'}
              {state.gameMode === 'advanced' && 'Avanzado'}
              {state.gameMode === 'team' && 'Por Equipos'}
            </span>
            {hasBot && <span className="ml-2 text-purple-400">🤖 vs Bot</span>}
          </p>
        </div>

        {/* Lista de Jugadores */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-semibold text-white">
              Jugadores ({players.length}/
              {state.gameMode === 'team' ? '4' : '2'})
            </h2>
          </div>

          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-4 bg-slate-700 px-4 py-3 rounded-lg"
              >
                {/* Color del jugador */}
                <div
                  className={`w-12 h-12 ${getColorClass(player.color)} rounded-full flex items-center justify-center text-white font-bold`}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>

                {/* Nombre */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                    {player.isBot && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                        BOT
                      </span>
                    )}
                  </div>
                  {player.id === state.playerId && (
                    <span className="text-sm text-game-teal">Tú</span>
                  )}
                </div>

                {/* Estado */}
                <div className="text-sm">
                  {player.ready ? (
                    <span className="text-green-400">✓ Listo</span>
                  ) : (
                    <span className="text-slate-400">Esperando...</span>
                  )}
                </div>
              </div>
            ))}

            {/* Espacios vacíos */}
            {Array.from({
              length: (state.gameMode === 'team' ? 4 : 2) - players.length,
            }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-4 bg-slate-700/50 px-4 py-3 rounded-lg border-2 border-dashed border-slate-600"
              >
                <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
                <span className="text-slate-500 italic">
                  Esperando jugador...
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {state.error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {state.error}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4">
          <button
            onClick={handleLeaveLobby}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-xl transition-all"
          >
            Salir
          </button>

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={players.length < (state.gameMode === 'team' ? 3 : 2)}
              className="flex-1 bg-game-teal hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg"
            >
              Comenzar Juego
            </button>
          )}
        </div>

        {/* Instrucciones */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          {hasBot ? (
            <p>🤖 Iniciando partida contra el bot...</p>
          ) : isHost ? (
            <p>
              Como anfitrión, puedes iniciar el juego cuando todos estén listos
            </p>
          ) : (
            <p>Esperando a que el anfitrión inicie el juego...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
