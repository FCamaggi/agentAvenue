import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { dispatch } = useGame();

  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [gameMode, setGameMode] = useState('simple');
  const [action, setAction] = useState(''); // 'create' | 'join'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateLobby = () => {
    if (!playerName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!connected || !socket) {
      setError('No hay conexión con el servidor');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit(
      'create-lobby',
      { playerName, gameMode, withBot: false },
      (response) => {
        setLoading(false);

        if (response.error) {
          setError(response.error);
          return;
        }

        dispatch({
          type: 'SET_PLAYER_INFO',
          payload: {
            name: playerName,
            id: response.playerId,
            color: response.playerColor,
          },
        });

        dispatch({
          type: 'SET_LOBBY',
          payload: {
            code: response.lobbyCode,
            mode: gameMode,
          },
        });

        navigate(`/lobby/${response.lobbyCode}`);
      },
    );
  };

  const handleJoinLobby = () => {
    if (!playerName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!lobbyCode.trim()) {
      setError('Por favor ingresa el código de la sala');
      return;
    }

    if (!connected || !socket) {
      setError('No hay conexión con el servidor');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit(
      'join-lobby',
      { playerName, lobbyCode: lobbyCode.toUpperCase() },
      (response) => {
        setLoading(false);

        if (response.error) {
          setError(response.error);
          return;
        }

        dispatch({
          type: 'SET_PLAYER_INFO',
          payload: {
            name: playerName,
            id: response.playerId,
            color: response.playerColor,
          },
        });

        dispatch({
          type: 'SET_LOBBY',
          payload: {
            code: response.lobbyCode,
            mode: response.gameMode,
          },
        });

        navigate(`/lobby/${response.lobbyCode}`);
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-6 sm:mb-8 fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Agent Avenue
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Juego de Espionaje Digital
          </p>
          <div className="mt-4">
            {connected ? (
              <span className="inline-flex items-center gap-2 text-green-400 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-red-400 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                Desconectado
              </span>
            )}
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700 fade-in">
          {action === '' ? (
            // Selección de acción
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={() => setAction('create')}
                className="w-full bg-game-green hover:bg-green-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Crear Nueva Partida
              </button>

              <button
                onClick={() => setAction('join')}
                className="w-full bg-game-blue hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Unirse a Partida
              </button>
            </div>
          ) : (
            // Formulario
            <div>
              <button
                onClick={() => {
                  setAction('');
                  setError('');
                }}
                className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 text-sm sm:text-base"
              >
                ← Volver
              </button>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium text-sm sm:text-base">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Ingresa tu nombre"
                    maxLength={20}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-game-teal focus:outline-none focus:ring-2 focus:ring-game-teal/50 text-sm sm:text-base"
                  />
                </div>

                {action === 'create' && (
                  <div>
                    <label className="block text-slate-300 mb-2 font-medium">
                      Modo de Juego
                    </label>
                    <select
                      value={gameMode}
                      onChange={(e) => setGameMode(e.target.value)}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-game-teal focus:outline-none focus:ring-2 focus:ring-game-teal/50"
                    >
                      <option value="simple">Modo Simple</option>
                      <option value="advanced">Modo Avanzado</option>
                      <option value="team">
                        Modo por Equipos (3-4 jugadores)
                      </option>
                    </select>
                  </div>
                )}

                {action === 'join' && (
                  <div>
                    <label className="block text-slate-300 mb-2 font-medium">
                      Código de Sala
                    </label>
                    <input
                      type="text"
                      value={lobbyCode}
                      onChange={(e) =>
                        setLobbyCode(e.target.value.toUpperCase())
                      }
                      placeholder="Ej: ABC123"
                      maxLength={6}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-game-teal focus:outline-none focus:ring-2 focus:ring-game-teal/50 uppercase text-center text-2xl tracking-wider font-mono"
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg shake text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={
                    action === 'create' ? handleCreateLobby : handleJoinLobby
                  }
                  disabled={loading || !connected}
                  className="w-full bg-game-teal hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all shadow-lg text-sm sm:text-base"
                >
                  {loading
                    ? 'Procesando...'
                    : action === 'create'
                      ? 'Crear Sala'
                      : 'Unirse'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-slate-400 text-xs sm:text-sm fade-in">
          <p>Basado en el juego de mesa Agent Avenue</p>
          <p className="mt-1">2-4 jugadores • 20-30 minutos</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
