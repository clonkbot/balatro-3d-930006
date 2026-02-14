import { Text } from '@react-three/drei'

interface ScoreDisplayProps {
  score: number
  mult: number
  chips: number
}

export function ScoreDisplay({ score, mult, chips }: ScoreDisplayProps) {
  return (
    <group position={[0, 3, -2]}>
      {/* Main score */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.4}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {score.toLocaleString()}
      </Text>

      {/* Score label */}
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.12}
        color="#ff2d75"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
      >
        SCORE
      </Text>

      {/* Chips display */}
      {chips > 0 && (
        <group position={[-1.5, 0, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="#00d4ff"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
          >
            {chips}
          </Text>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.08}
            color="#00d4ff"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
          >
            CHIPS
          </Text>
        </group>
      )}

      {/* Mult display */}
      {mult > 1 && (
        <group position={[1.5, 0, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="#ff2d75"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
          >
            x{mult}
          </Text>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.08}
            color="#ff2d75"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
          >
            MULT
          </Text>
        </group>
      )}
    </group>
  )
}
