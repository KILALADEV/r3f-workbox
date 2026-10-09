import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  triggerTime: number;
  color: THREE.Color;
  position?: [number, number, number];
}

export function ElegantShockwave({ triggerTime, color, position = [0, 0, 0] }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() - triggerTime;
    const isAlive = elapsed >= 0 && elapsed <= 0.55;

    if (groupRef.current) groupRef.current.visible = isAlive;
    if (!isAlive || !ringRef.current) return;

    const t = elapsed / 0.55;
    const scale = 0.3 + Math.pow(t, 0.7) * 2.2;
    groupRef.current?.position.set(...position);
    ringRef.current.scale.set(scale, scale, 1);
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.75;
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 1.0, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}