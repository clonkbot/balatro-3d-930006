import { GameState, HandResult } from '../game/gameLogic'

interface GameUIProps {
  gameState: GameState
  selectedCards: Set<number>
  onPlayHand: () => void
  onDiscard: () => void
  onNewRound: () => void
  lastHand: HandResult | null
  showResult: boolean
  gameWon: boolean
  gameLost: boolean
}

export function GameUI({
  gameState,
  selectedCards,
  onPlayHand,
  onDiscard,
  onNewRound,
  lastHand,
  showResult,
  gameWon,
  gameLost
}: GameUIProps) {
  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30 pointer-events-none">
        {/* Target score */}
        <div className="bg-black/60 backdrop-blur-md border border-pink-500/30 rounded-lg p-3 md:p-4 pointer-events-auto">
          <div className="text-[10px] md:text-xs text-pink-400 font-mono tracking-widest mb-1">TARGET</div>
          <div className="text-xl md:text-2xl text-yellow-400 font-bold" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            {gameState.targetScore}
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (gameState.score / gameState.targetScore) * 100)}%` }}
            />
          </div>
        </div>

        {/* Hands and Discards */}
        <div className="flex gap-2 md:gap-4">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 md:p-4 text-center pointer-events-auto">
            <div className="text-[10px] md:text-xs text-cyan-400 font-mono tracking-widest mb-1">HANDS</div>
            <div className="text-2xl md:text-3xl text-cyan-300" style={{ fontFamily: '"Press Start 2P", monospace' }}>
              {gameState.handsLeft}
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-orange-500/30 rounded-lg p-3 md:p-4 text-center pointer-events-auto">
            <div className="text-[10px] md:text-xs text-orange-400 font-mono tracking-widest mb-1">DISCARDS</div>
            <div className="text-2xl md:text-3xl text-orange-300" style={{ fontFamily: '"Press Start 2P", monospace' }}>
              {gameState.discardsLeft}
            </div>
          </div>
        </div>
      </div>

      {/* Hand result popup */}
      {showResult && lastHand && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div
            className="bg-gradient-to-br from-purple-900/95 to-black/95 backdrop-blur-lg border-2 border-yellow-400 rounded-2xl p-6 md:p-8 text-center animate-pulse"
            style={{
              boxShadow: '0 0 60px rgba(255, 215, 0, 0.5), inset 0 0 30px rgba(255, 45, 117, 0.2)',
              animation: 'popIn 0.3s ease-out'
            }}
          >
            <div className="text-lg md:text-2xl text-yellow-400 mb-2" style={{ fontFamily: '"Press Start 2P", monospace' }}>
              {lastHand.name}
            </div>
            <div className="text-sm md:text-base text-gray-400 mb-4 font-mono">{lastHand.description}</div>
            <div className="flex items-center justify-center gap-4 text-xl md:text-3xl">
              <span className="text-cyan-400">{lastHand.chips}</span>
              <span className="text-white">×</span>
              <span className="text-pink-400">{lastHand.mult}</span>
              <span className="text-white">=</span>
              <span className="text-yellow-400" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                {lastHand.score}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Win/Lose screens */}
      {(gameWon || gameLost) && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
          <div
            className={`text-center p-8 md:p-12 rounded-3xl border-4 ${
              gameWon
                ? 'bg-gradient-to-br from-yellow-900/90 to-black/90 border-yellow-400'
                : 'bg-gradient-to-br from-red-900/90 to-black/90 border-red-500'
            }`}
            style={{
              boxShadow: gameWon
                ? '0 0 100px rgba(255, 215, 0, 0.6)'
                : '0 0 100px rgba(255, 0, 0, 0.4)'
            }}
          >
            <div
              className={`text-3xl md:text-5xl mb-4 ${gameWon ? 'text-yellow-400' : 'text-red-400'}`}
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              {gameWon ? 'ROUND CLEAR!' : 'GAME OVER'}
            </div>
            <div className="text-lg md:text-xl text-gray-300 mb-6 font-mono">
              Final Score: <span className="text-yellow-400">{gameState.score}</span>
            </div>
            <button
              onClick={onNewRound}
              className={`px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                gameWon
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400'
              }`}
              style={{ fontFamily: '"Press Start 2P", monospace', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
            >
              {gameWon ? 'NEXT ROUND' : 'TRY AGAIN'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom action buttons */}
      <div className="absolute bottom-16 md:bottom-12 left-4 right-4 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-6 z-30">
        {/* Selection info */}
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-gray-600/30">
          <span className="text-xs md:text-sm text-gray-400 font-mono">
            Selected: <span className="text-yellow-400">{selectedCards.size}/5</span>
          </span>
        </div>

        <div className="flex gap-3 md:gap-4">
          {/* Play Hand button */}
          <button
            onClick={onPlayHand}
            disabled={selectedCards.size === 0 || gameState.handsLeft <= 0 || showResult}
            className={`
              px-4 md:px-8 py-3 md:py-4 text-xs md:text-sm rounded-xl font-bold transition-all duration-300 transform
              ${selectedCards.size > 0 && gameState.handsLeft > 0 && !showResult
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500 hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              boxShadow: selectedCards.size > 0 && gameState.handsLeft > 0 ? '0 0 30px rgba(255, 45, 117, 0.4)' : 'none'
            }}
          >
            PLAY HAND
          </button>

          {/* Discard button */}
          <button
            onClick={onDiscard}
            disabled={selectedCards.size === 0 || gameState.discardsLeft <= 0 || showResult}
            className={`
              px-4 md:px-8 py-3 md:py-4 text-xs md:text-sm rounded-xl font-bold transition-all duration-300 transform
              ${selectedCards.size > 0 && gameState.discardsLeft > 0 && !showResult
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              boxShadow: selectedCards.size > 0 && gameState.discardsLeft > 0 ? '0 0 30px rgba(255, 107, 53, 0.4)' : 'none'
            }}
          >
            DISCARD
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none">
        <p className="text-[10px] md:text-xs text-gray-500 font-mono tracking-wider opacity-80">
          Click cards to select (max 5) • Form poker hands • Beat the target score
        </p>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
