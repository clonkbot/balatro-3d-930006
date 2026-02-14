import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  Float,
  Text,
  ContactShadows,
  Sparkles
} from '@react-three/drei'
import { Suspense, useState, useCallback, useMemo } from 'react'
import { PokerTable } from './components/PokerTable'
import { PlayingCard } from './components/PlayingCard'
import { JokerCard } from './components/JokerCard'
import { GameUI } from './components/GameUI'
import { ScoreDisplay } from './components/ScoreDisplay'
import { Card, GameState, HandResult, evaluateHand, JOKER_TYPES, JokerType } from './game/gameLogic'

function LoadingFallback() {
  return (
    <Text
      position={[0, 0, 0]}
      fontSize={0.3}
      color="#ff2d75"
      anchorX="center"
      anchorY="middle"
      font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
    >
      LOADING...
    </Text>
  )
}

function Scene({
  gameState,
  onCardSelect,
  selectedCards,
  jokers
}: {
  gameState: GameState
  onCardSelect: (index: number) => void
  selectedCards: Set<number>
  jokers: JokerType[]
}) {
  const cardSpacing = 1.1
  const startX = -((gameState.hand.length - 1) * cardSpacing) / 2

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ff2d75" />
      <pointLight position={[5, 5, -5]} intensity={0.3} color="#00d4ff" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={1}
        color="#ffd700"
        castShadow
      />

      <PokerTable />

      {/* Joker cards on the left */}
      {jokers.map((joker, index) => (
        <JokerCard
          key={`joker-${index}`}
          jokerType={joker}
          position={[-4.5, 0.15, -1.5 + index * 1.2]}
          rotation={[0, Math.PI * 0.1, 0]}
        />
      ))}

      {/* Player's hand */}
      {gameState.hand.map((card, index) => (
        <PlayingCard
          key={`${card.suit}-${card.rank}-${index}`}
          card={card}
          position={[
            startX + index * cardSpacing,
            selectedCards.has(index) ? 0.5 : 0.15,
            2
          ]}
          rotation={[selectedCards.has(index) ? -0.3 : -0.5, 0, 0]}
          onClick={() => onCardSelect(index)}
          selected={selectedCards.has(index)}
          index={index}
        />
      ))}

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.6}
        scale={15}
        blur={2}
        far={4}
      />

      <Sparkles
        count={50}
        scale={10}
        size={2}
        speed={0.3}
        color="#ffd700"
        opacity={0.5}
      />

      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
        <ScoreDisplay score={gameState.score} mult={gameState.mult} chips={gameState.chips} />
      </Float>

      <Environment preset="night" />
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={5}
        maxDistance={12}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]}
      />
    </>
  )
}

function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: Card['rank'][] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  const deck: Card[] = []

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank })
    }
  }

  return shuffle(deck)
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function App() {
  const [deck, setDeck] = useState<Card[]>(() => createDeck())
  const [gameState, setGameState] = useState<GameState>(() => ({
    hand: deck.slice(0, 8),
    score: 0,
    mult: 1,
    chips: 0,
    handsLeft: 4,
    discardsLeft: 3,
    roundScore: 0,
    targetScore: 300
  }))
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set())
  const [lastHand, setLastHand] = useState<HandResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [jokers] = useState<JokerType[]>(() =>
    shuffle([...JOKER_TYPES]).slice(0, 3)
  )

  const handleCardSelect = useCallback((index: number) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else if (newSet.size < 5) {
        newSet.add(index)
      }
      return newSet
    })
  }, [])

  const handlePlayHand = useCallback(() => {
    if (selectedCards.size === 0 || gameState.handsLeft <= 0) return

    const playedCards = Array.from(selectedCards).map(i => gameState.hand[i])
    const result = evaluateHand(playedCards, jokers)

    setLastHand(result)
    setShowResult(true)

    setTimeout(() => {
      const newScore = gameState.score + result.score
      const remainingCards = gameState.hand.filter((_, i) => !selectedCards.has(i))
      const cardsNeeded = 8 - remainingCards.length
      const newDeck = deck.slice(8 + (52 - deck.length))
      const drawnCards = cardsNeeded > 0
        ? (newDeck.length >= cardsNeeded ? newDeck.slice(0, cardsNeeded) : createDeck().slice(0, cardsNeeded))
        : []

      setGameState(prev => ({
        ...prev,
        hand: [...remainingCards, ...drawnCards],
        score: newScore,
        handsLeft: prev.handsLeft - 1,
        chips: result.chips,
        mult: result.mult
      }))
      setSelectedCards(new Set())
      setShowResult(false)

      if (drawnCards.length > 0) {
        setDeck(prev => prev.slice(cardsNeeded))
      }
    }, 1500)
  }, [selectedCards, gameState, deck, jokers])

  const handleDiscard = useCallback(() => {
    if (selectedCards.size === 0 || gameState.discardsLeft <= 0) return

    const remainingCards = gameState.hand.filter((_, i) => !selectedCards.has(i))
    const cardsNeeded = 8 - remainingCards.length
    const newDeck = deck.slice(8)
    const drawnCards = newDeck.length >= cardsNeeded
      ? newDeck.slice(0, cardsNeeded)
      : createDeck().slice(0, cardsNeeded)

    setGameState(prev => ({
      ...prev,
      hand: [...remainingCards, ...drawnCards],
      discardsLeft: prev.discardsLeft - 1
    }))
    setSelectedCards(new Set())
    setDeck(prev => prev.slice(cardsNeeded))
  }, [selectedCards, gameState, deck])

  const handleNewRound = useCallback(() => {
    const newDeck = createDeck()
    setDeck(newDeck)
    setGameState(prev => ({
      hand: newDeck.slice(0, 8),
      score: prev.score >= prev.targetScore ? 0 : prev.score,
      mult: 1,
      chips: 0,
      handsLeft: 4,
      discardsLeft: 3,
      roundScore: 0,
      targetScore: prev.score >= prev.targetScore ? prev.targetScore + 150 : prev.targetScore
    }))
    setSelectedCards(new Set())
    setLastHand(null)
  }, [])

  const gameWon = gameState.score >= gameState.targetScore
  const gameLost = gameState.handsLeft <= 0 && gameState.score < gameState.targetScore

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* CRT Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
          mixBlendMode: 'overlay'
        }}
      />

      {/* Vignette effect */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.8) 100%)'
        }}
      />

      <Canvas
        shadows
        camera={{ position: [0, 6, 8], fov: 50 }}
        className="touch-none"
      >
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 8, 20]} />
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            gameState={gameState}
            onCardSelect={handleCardSelect}
            selectedCards={selectedCards}
            jokers={jokers}
          />
        </Suspense>
      </Canvas>

      <GameUI
        gameState={gameState}
        selectedCards={selectedCards}
        onPlayHand={handlePlayHand}
        onDiscard={handleDiscard}
        onNewRound={handleNewRound}
        lastHand={lastHand}
        showResult={showResult}
        gameWon={gameWon}
        gameLost={gameLost}
      />

      {/* Footer */}
      <footer className="absolute bottom-2 left-0 right-0 text-center z-50 pointer-events-none">
        <p className="text-[10px] md:text-xs text-gray-600 font-mono tracking-wider opacity-60">
          Requested by <span className="text-pink-500/60">@nicoismade</span> · Built by <span className="text-cyan-500/60">@clonkbot</span>
        </p>
      </footer>
    </div>
  )
}
