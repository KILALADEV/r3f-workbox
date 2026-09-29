import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CLOSED_Y = 1.65;
const OPEN_Y = 3;

function GiftBox() {
  const [opened, setOpened] = useState(false);
  const lidRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!lidRef.current) return;

    const targetY = opened ? OPEN_Y : CLOSED_Y;

    lidRef.current.position.y = THREE.MathUtils.lerp(
      lidRef.current.position.y,
      targetY,
      0.1,
    );
  });

  return (
    <group onClick={() => setOpened(!opened)}>
      {/* Body */}
      <mesh name="Body" position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#d95763" />
      </mesh>

      {/* Lid */}
      <mesh
        ref={lidRef}
        name="Lid"
        position={[0, CLOSED_Y, 0]}
        castShadow
      >
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
