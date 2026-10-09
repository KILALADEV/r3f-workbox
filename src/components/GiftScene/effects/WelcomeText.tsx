import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { PRESENT_OPEN_Y, FONT_URL } from '../constants';

export function WelcomeText({ exploded }: { exploded: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetScale = THREE.MathUtils.lerp(groupRef.current.scale.x, exploded ? 1 : 0, delta * 5);
    groupRef.current.scale.setScalar(targetScale);

    if (exploded) {
      groupRef.current.rotation.y =
        Math.atan2(camera.position.x, camera.position.z) + Math.sin(Date.now() * 0.0015) * 0.08;
    }
  });

  const fontConfig = { font: FONT_URL, curveSegments: 16, bevelEnabled: true };

  return (
    <group ref={groupRef} position={[0, PRESENT_OPEN_Y + 0.3, 0]} scale={0}>
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <Center position={[0, 0.05, 0]}>
          <Text3D {...fontConfig} size={0.36} height={0.09} bevelThickness={0.02} bevelSize={0.015}>
            WELCOME TO
            <meshPhysicalMaterial
              color="#ffd700"
              emissive="#ff9900"
              emissiveIntensity={1.4}
              roughness={0.1}
              metalness={0.9}
              clearcoat={1}
            />
          </Text3D>
        </Center>
        <Center position={[0, -0.55, 0]}>
          <Text3D {...fontConfig} size={0.55} height={0.14} bevelThickness={0.03} bevelSize={0.02}>
            VIETNAM
            <meshPhysicalMaterial
              color="#ff0022"
              emissive="#ff0033"
              emissiveIntensity={1.8}
              roughness={0.15}
              metalness={0.8}
              clearcoat={1}
            />
          </Text3D>
        </Center>
      </Float>
    </group>
  );
}