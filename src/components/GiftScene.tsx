import { Canvas } from '@react-three/fiber';

function GiftBox() {
  return (
    <group>
      {/* Body */}
      <mesh name="Body" position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#d95763" />
      </mesh>

      {/* Lid */}
      <mesh name="Lid" position={[0, 1.65, 0]} castShadow>
        <boxGeometry args={[2.2, 0.3, 2.2]} />
        <meshStandardMaterial color="#b83b4b" />
      </mesh>
    </group>
  );
}

export default function GiftScene() {
  return (
    <Canvas
      camera={{ position: [7, 4, 7], fov: 45 }}
      shadows
    >
      <color attach="background" args={['#f4f1ec']} />

      <ambientLight intensity={1.2} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={2}
        castShadow
      />

      <GiftBox />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d8d2c8" />
      </mesh>
    </Canvas>
  );
}
