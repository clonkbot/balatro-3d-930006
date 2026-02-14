import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox, Float, Html } from '@react-three/drei'
import * as THREE from 'three'
import { JokerType, JOKER_INFO } from '../game/gameLogic'

interface JokerCardProps {
  jokerType: JokerType
  position: [number, number, number]
  rotation: [number, number, number]
}

export function JokerCard({ jokerType, position, rotation }: JokerCardProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  const info = JOKER_INFO[jokerType]

  useFrame((state) => {
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.3}
    >
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'help'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        {/* Card glow backdrop */}
        <mesh ref={glowRef} position={[0, 0, -0.05]}>
          <planeGeometry args={[1.2, 1.6]} />
          <meshBasicMaterial
            color={info.color}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Card body */}
        <RoundedBox
          args={[0.9, 1.3, 0.03]}
          radius={0.05}
          smoothness={4}
          castShadow
        >
          <meshStandardMaterial
            color="#1a0a2e"
            roughness={0.4}
            metalness={0.3}
            emissive={info.color}
            emissiveIntensity={0.15}
          />
        </RoundedBox>

        {/* Joker face - stylized */}
        <Text
          position={[0, 0.25, 0.02]}
          fontSize={0.35}
          color={info.color}
          anchorX="center"
          anchorY="middle"
        >
          {jokerType === 'joker' ? '\u263A' :
           jokerType === 'greedy' ? '\u2666' :
           jokerType === 'lusty' ? '\u2665' :
           jokerType === 'wrathful' ? '\u2660' :
           jokerType === 'glutton' ? '\u2663' :
           jokerType === 'mystic' ? '\u2605' :
           jokerType === 'chaos' ? '\u2622' :
           '\u263C'}
        </Text>

        {/* Joker label */}
        <Text
          position={[0, -0.35, 0.02]}
          fontSize={0.08}
          color="#ffd700"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
          maxWidth={0.8}
          textAlign="center"
        >
          JOKER
        </Text>

        {/* Edge glow */}
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.92, 1.32]} />
          <meshBasicMaterial
            color={info.color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Tooltip on hover */}
        {hovered && (
          <Html
            position={[0.8, 0, 0]}
            center
            style={{
              background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)',
              border: `2px solid ${info.color}`,
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#fff',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              boxShadow: `0 0 20px ${info.color}50`,
              pointerEvents: 'none'
            }}
          >
            <div style={{ color: info.color, marginBottom: '8px', fontWeight: 'bold' }}>
              {info.name}
            </div>
            <div style={{ color: '#ffd700' }}>
              {info.effect}
            </div>
          </Html>
        )}
      </group>
    </Float>
  )
}
