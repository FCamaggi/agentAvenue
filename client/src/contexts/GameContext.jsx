import { createContext, useContext, useReducer } from 'react';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe usarse dentro de GameProvider');
  }
  return context;
};

const initialState = {
  gameId: null,
  lobbyCode: null,
  playerName: '',
  playerId: null,
  playerColor: null,
  gameMode: 'simple', // 'simple' | 'advanced' | 'team'
  gameState: null, // Estado completo del juego desde el servidor
  hand: [],
  recruitedAgents: {},
  blackMarketCards: [], // Cartas de Mercado Negro del jugador
  opponentData: null,
  isMyTurn: false,
  phase: 'waiting', // 'waiting' | 'playing' | 'recruiting' | 'finished'
  winner: null,
  error: null,
  discardsRemaining: 4, // Número de descartes disponibles
  animatingPawn: null, // ID del jugador cuyo peón se está animando
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_INFO':
      return {
        ...state,
        playerName: action.payload.name,
        playerId: action.payload.id,
        playerColor: action.payload.color,
      };

    case 'SET_LOBBY':
      return {
        ...state,
        lobbyCode: action.payload.code,
        gameMode: action.payload.mode,
      };

    case 'SET_GAME_ID':
      return {
        ...state,
        gameId: action.payload,
      };

    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        gameState: action.payload,
      };

    case 'UPDATE_HAND':
      return {
        ...state,
        hand: action.payload,
      };

    case 'UPDATE_RECRUITED':
      return {
        ...state,
        recruitedAgents: action.payload,
      };

    case 'SET_TURN':
      return {
        ...state,
        isMyTurn: action.payload,
      };

    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload,
      };

    case 'SET_OPPONENT':
      return {
        ...state,
        opponentData: action.payload,
      };

    case 'GAME_OVER':
      return {
        ...state,
        phase: 'finished',
        winner: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_DISCARDS_REMAINING':
      return {
        ...state,
        discardsRemaining: action.payload,
      };

    case 'ADD_BLACK_MARKET_CARD':
      return {
        ...state,
        blackMarketCards: [...state.blackMarketCards, action.payload],
      };

    case 'SET_ANIMATING_PAWN':
      return {
        ...state,
        animatingPawn: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_GAME':
      return initialState;

    default:
      return state;
  }
}

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
