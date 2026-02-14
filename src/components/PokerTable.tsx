import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'

export function PokerTable() {
  const feltRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (feltRef.current) {
      const material = feltRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.02 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01
    }
  })

  return (
    <group position={[0, -0.5, 0]}>
      {/* Table base */}
      <RoundedBox
        args={[12, 0.8, 8]}
        radius={0.1}
        smoothness={4}
        position={[0, -0.4, 0]}
      >
        <meshStandardMaterial
          color="#1a0a0a"
          roughness={0.3}
          metalness={0.8}
        />
      </RoundedBox>

      {/* Felt surface */}
      <mesh
        ref={feltRef}
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[11, 7]} />
        <meshStandardMaterial
          color="#0d4f32"
          roughness={0.9}
          metalness={0}
          emissive="#0d4f32"
          emissiveIntensity={0.02}
        />
      </mesh>

      {/* Gold trim - outer ring */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.5, 64]} />
        <meshStandardMaterial
          color="#ffd700"
          roughness={0.2}
          metalness={0.9}
          emissive="#ffd700"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Decorative corner lights */}
      {[
        [-5, 0.1, -3],
        [5, 0.1, -3],
        [-5, 0.1, 3],
        [5, 0.1, 3]
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#ff2d75' : '#00d4ff'}
              emissive={i % 2 === 0 ? '#ff2d75' : '#00d4ff'}
              emissiveIntensity={0.5}
            />
          </mesh>
          <pointLight
            color={i % 2 === 0 ? '#ff2d75' : '#00d4ff'}
            intensity={0.3}
            distance={3}
          />
        </group>
      ))}

      {/* Center decoration */}
      <mesh position={[0, 0.07, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Neon edge glow */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[5.3, 0.02, 8, 64]} />
        <meshStandardMaterial
          color="#ff2d75"
          emissive="#ff2d75"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}
