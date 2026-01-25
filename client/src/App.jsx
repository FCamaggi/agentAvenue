import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import { SocketProvider } from './contexts/SocketContext';
import { GameProvider } from './contexts/GameContext';

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lobby/:lobbyCode" element={<LobbyPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
          </Routes>
        </div>
      </GameProvider>
    </SocketProvider>
  );
}

export default App;
