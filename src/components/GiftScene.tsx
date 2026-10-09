import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';


function GiftBox() {
  const [opened, setOpened] = useState(false);
  const presentRef = useRef<THREE.Mesh>(null);

  const CLOSED_Y = 1.65;
  const OPEN_Y = 3;
  const PRESENT_CLOSED_Y = 0.8;
  const PRESENT_OPEN_Y = 2.2;

  const { scene, nodes } = useGLTF('/models/gift_box_handson.glb');
  const lid = nodes.Lid;
  
  useFrame((_, delta) => {
    if (!presentRef.current) return;

    const lidTargetY = opened ? OPEN_Y : CLOSED_Y;
    const presentTargetY = opened ? PRESENT_OPEN_Y : PRESENT_CLOSED_Y;

    lid.position.y = THREE.MathUtils.lerp(
      lid.position.y,
      lidTargetY,
      0.1,
    );

    presentRef.current.position.y = THREE.MathUtils.lerp(
      presentRef.current.position.y,
      presentTargetY,
      0.1,
    );

    if (opened) {
      presentRef.current.rotation.y += delta;
    }
  });

  return (
    <group onClick={() => setOpened(!opened)}>
      <primitive object={scene} />

      <mesh
        ref={presentRef}
        name="Present"
        position= {[0, PRESENT_CLOSED_Y, 0]}
        castShadow
      >
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#f4c542" />
      </mesh>

      {opened && (
        <Sparkles 
          count={40} 
          scale={5} 
          size={10} 
          speed={1} 
          position={[0, PRESENT_OPEN_Y, 0]} 
          color="#91ff00" 
        />
      )} 
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
