import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSparkTexture } from '../utils/math'; //texture light

interface Props {
  visible: boolean;   // on/off noise
  color: THREE.Color;
}

export function AmbientAuraParticles({ visible, color }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const sparkTexture = useMemo(createSparkTexture, []);

  const data = useMemo(() => {
    const count = 90; 

    const pos = new Float32Array(count * 3);

    const angles = new Float32Array(count); 
    const radii = new Float32Array(count);  
    const speeds = new Float32Array(count);
    const yOffsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 0.9 + Math.random() * 0.8;
      speeds[i] = 0.8 + Math.random() * 1.2;
      yOffsets[i] = (Math.random() - 0.5) * 1.5;

      // Chuyển đổi từ tọa độ cực (polar/cylindrical) sang tọa độ Decartes (Cartesian X, Y, Z):
      // X = R * cos(θ), Z = R * sin(θ) tạo vòng tròn trên mặt phẳng nằm ngang
      pos[i * 3] = Math.cos(angles[i]) * radii[i];
      pos[i * 3 + 1] = yOffsets[i];
      pos[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
    }

    return { pos, angles, radii, speeds, yOffsets };
  }, []);


  useFrame(({ clock }) => {
    if (!pointsRef.current || !visible) return;

    const timingAura = clock.getElapsedTime();
    const arr = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < 90; i++) {
      // Góc quay tịnh tiến theo thời gian: θ(t) = θ_gốc + t * tốc_độ
      const angle = data.angles[i] + timingAura * data.speeds[i];
      // Cập nhật vị trí X, Z theo quỹ đạo elip/tròn
      arr[i * 3] = Math.cos(angle) * data.radii[i];
      // Trục Y: Thêm dao động sóng sin nhỏ (+/- 0.1) tạo cảm giác hạt lơ lửng bồng bềnh
      arr[i * 3 + 1] = data.yOffsets[i] + Math.sin(timingAura * 1.8 + i) * 0.1;

      arr[i * 3 + 2] = Math.sin(angle) * data.radii[i];
    }
      // on flag
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });


  return (
    <points ref={pointsRef} visible={visible}>
      <bufferGeometry>
        {/* position = 3 (X, Y, Z) */}
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
      </bufferGeometry>

      <pointsMaterial
        size={0.14}              
        color={color}           
        map={sparkTexture}        
        transparent              
        opacity={0.65}           
        blending={THREE.AdditiveBlending}

        // k ghi đè hạt
        depthWrite={false}
      />
    </points>
  );
}