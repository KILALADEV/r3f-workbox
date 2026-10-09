import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
// cache
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { LID_CLOSED_POS, LID_LAND_POS } from '../constants'; //vị trí tọa độ
import { MorphSequence } from './MorphSequence'; //biến hình hạt/phần quà

interface Props {
  opened: boolean; 
  onToggle: () => void; 
  onExplode: () => void;// bloom
  shake: number;
}

export function GiftBox({ opened, onToggle, onExplode, shake }: Props) {
  const { scene, nodes } = useGLTF('/models/gift_box_handson.glb');
  const lid = nodes.Lid as THREE.Object3D | undefined;
  const boxGroup = useRef<THREE.Group>(null);
  const animProgress = useRef(0);

  useFrame(({ clock }, delta) => {
    if (lid) {
      animProgress.current = THREE.MathUtils.damp(
        animProgress.current,
        opened ? 1 : 0,
        2.0,
        delta
      );

      const stateLidY = animProgress.current;
      const airFactor = Math.pow(Math.sin(stateLidY * Math.PI), 2);// balance fly
      // POSITION
      lid.position.set(
        // axis X & Z
        THREE.MathUtils.lerp(LID_CLOSED_POS.x, LID_LAND_POS.x, stateLidY),

        // axis Y (height Lid):
        THREE.MathUtils.lerp(LID_CLOSED_POS.y, LID_LAND_POS.y, stateLidY) +
          Math.sin(stateLidY * Math.PI) * (4.8 - LID_CLOSED_POS.y),

        THREE.MathUtils.lerp(LID_CLOSED_POS.z, LID_LAND_POS.z, stateLidY)
      );
    
      lid.rotation.set(
        airFactor * Math.sin(stateLidY * Math.PI * 2) * 1.2,// axis X: pitch
        THREE.MathUtils.lerp(0, 0.45 + Math.PI * 2, stateLidY), // axis Y: yaw
        airFactor * Math.cos(stateLidY * Math.PI * 2) * 1.2// axis Z: roll
      );
    }

    if (boxGroup.current) {
      if (shake > 0) {
        const t = clock.getElapsedTime() * 24; // hz

        // shake
        const tiltZ = Math.sin(t) * 0.045 * shake;
        const tiltX = Math.cos(t * 1.3) * 0.03 * shake;
        const twistY = Math.sin(t * 0.8) * 0.02 * shake;

        boxGroup.current.rotation.set(tiltX, twistY, tiltZ);

        // move and bounce
        boxGroup.current.position.set(
          tiltZ * 0.15,
          Math.abs(Math.sin(t)) * 0.015 * shake,
          tiltX * 0.15,
        );
      } else {
        // Reset
        boxGroup.current.rotation.set(0, 0, 0);
        boxGroup.current.position.set(0, 0, 0);
      }
    }
  });

  return (
    <group
      ref={boxGroup}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <primitive object={scene} />

      {/* Noise and Precent */}
      <MorphSequence opened={opened} onExplode={onExplode} />
    </group>
  );
}

useGLTF.preload('/models/gift_box_handson.glb');