import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #475569',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
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
