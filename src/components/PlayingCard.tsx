import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Card } from '../game/gameLogic'

interface PlayingCardProps {
  card: Card
  position: [number, number, number]
  rotation: [number, number, number]
  onClick: () => void
  selected: boolean
  index: number
}

const SUIT_COLORS: Record<Card['suit'], string> = {
  hearts: '#ff2d75',
  diamonds: '#ff6b35',
  clubs: '#2d3436',
  spades: '#1e272e'
}

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660'
}

export function PlayingCard({ card, position, rotation, onClick, selected, index }: PlayingCardProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!groupRef.current) return

    // Smooth position animation
    const targetY = selected ? 0.5 : hovered ? 0.25 : position[1]
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.1
    )

    // Subtle hover glow animation
    if (hovered || selected) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3 + index) * 0.03
    } else {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1)
    }
  })

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  const suitColor = SUIT_COLORS[card.suit]
  const suitSymbol = SUIT_SYMBOLS[card.suit]

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Card body */}
      <RoundedBox
        args={[0.9, 1.3, 0.02]}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={selected ? '#fffff0' : '#faf8f5'}
          roughness={0.3}
          metalness={0.1}
          emissive={selected ? '#ffd700' : hovered ? '#ffffff' : '#000000'}
          emissiveIntensity={selected ? 0.15 : hovered ? 0.05 : 0}
        />
      </RoundedBox>

      {/* Selection glow ring */}
      {selected && (
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[1.1, 1.5]} />
          <meshBasicMaterial
            color="#ffd700"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Rank - top left */}
      <Text
        position={[-0.3, 0.5, 0.015]}
        fontSize={0.2}
        color={isRed ? suitColor : '#1a1a1a'}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
      >
        {card.rank}
      </Text>

      {/* Suit - top left under rank */}
      <Text
        position={[-0.3, 0.3, 0.015]}
        fontSize={0.18}
        color={suitColor}
        anchorX="center"
        anchorY="middle"
      >
        {suitSymbol}
      </Text>

      {/* Large center suit */}
      <Text
        position={[0.05, 0, 0.015]}
        fontSize={0.5}
        color={suitColor}
        anchorX="center"
        anchorY="middle"
      >
        {suitSymbol}
      </Text>

      {/* Rank - bottom right (inverted) */}
      <Text
        position={[0.3, -0.5, 0.015]}
        fontSize={0.2}
        color={isRed ? suitColor : '#1a1a1a'}
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI]}
        font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
      >
        {card.rank}
      </Text>

      {/* Suit - bottom right (inverted) */}
      <Text
        position={[0.3, -0.3, 0.015]}
        fontSize={0.18}
        color={suitColor}
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI]}
      >
        {suitSymbol}
      </Text>

      {/* Card back pattern (barely visible from front) */}
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[0.85, 1.25]} />
        <meshStandardMaterial
          color="#1a0a2e"
          roughness={0.5}
        />
      </mesh>

      {/* Holographic shimmer effect on hover */}
      {(hovered || selected) && (
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.85, 1.25]} />
          <meshBasicMaterial
            color={selected ? '#ffd700' : '#ffffff'}
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  )
}
