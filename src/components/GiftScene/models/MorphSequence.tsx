import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import {
  MODEL_PATHS,
  MODEL_THEME_COLORS,
  PRESENT_CLOSED_Y,
  PRESENT_OPEN_Y,
  MORPH_DURATION,
  TARGET_SIZE,
} from '../constants';

import { softNoise3D, normalizeModel } from '../utils/math';
import { ElegantShockwave } from '../effects/ElegantShockwave';
import { AmbientAuraParticles } from '../effects/AmbientAura';
import { UltimateFireworks } from '../effects/Fireworks';
import { WelcomeText } from '../effects/WelcomeText';

interface MorphProps {
  opened: boolean;      
  onExplode: () => void;  // boom
}

export function MorphSequence({ opened, onExplode }: MorphProps) {
  const models = MODEL_PATHS.map((p) => useGLTF(p).scene);

  // scale = TARGET_SIZE
  const normModels = useMemo(
    () => models.map((m) => normalizeModel(m, TARGET_SIZE)),
    [models]
  );

  const mainGroup = useRef<THREE.Group>(null);
  const noiseMesh = useRef<THREE.Mesh>(null);
  const noiseMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const dynamicLight = useRef<THREE.PointLight>(null);

  const itemRefs = useRef<(THREE.Group | null)[]>([]);// scale/rotation của từng model mà không re-render

  const [exploded, setExploded] = useState(false);
  const [themeColor, setThemeColor] = useState(MODEL_THEME_COLORS[0]);
  const [shockTime, setShockTime] = useState(-1);

  const lastIndex = useRef(-1);  // Lưu index của model
  const animProgress = useRef(0);// Tiến độ 0.0 -> 1.0 

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.48, 64, 64), []); //fps
  const origPos = useMemo(() => sphereGeo.attributes.position.clone(), [sphereGeo]); //clone item
  const cGold = useMemo(() => new THREE.Color('#f59e0b'), []);
  const cRed = useMemo(() => new THREE.Color('#e53935'), []);
  const cAmber = useMemo(() => new THREE.Color('#ffb300'), []);

  useFrame(({ clock }, delta) => {
    if (!mainGroup.current || !noiseMesh.current || !noiseMat.current) return;

    const posAttr = sphereGeo.attributes.position;
    const orig = origPos.array as Float32Array;
    const current = posAttr.array as Float32Array;

    //Close
    if (!opened) {
      animProgress.current = 0;
      setExploded(false);
      lastIndex.current = -1;

      // current
      for (let i = 0; i < orig.length; i++) current[i] = orig[i];
      posAttr.needsUpdate = true;
      sphereGeo.computeVertexNormals();

      // reset
      noiseMesh.current.scale.setScalar(1);
      noiseMesh.current.visible = true;
      noiseMat.current.color.copy(cGold);
      noiseMat.current.emissive.copy(cGold);
      noiseMat.current.emissiveIntensity = 0.15;

      // hidden Present
      itemRefs.current.forEach((ref) => ref?.scale.setScalar(0));

      // turn off light and close
      if (dynamicLight.current) dynamicLight.current.intensity = 0;
      mainGroup.current.position.set(0, PRESENT_CLOSED_Y, 0);
      return;
    }

    //timeline
    if (animProgress.current < 1) {
      animProgress.current = Math.min(1, animProgress.current + delta / MORPH_DURATION);
    }

    const statePresent = animProgress.current;
    const timingPresent = clock.getElapsedTime();

    //bi 12%
    mainGroup.current.position.y = THREE.MathUtils.lerp(
      PRESENT_CLOSED_Y,
      PRESENT_OPEN_Y,
      Math.min(statePresent / 0.12, 1)
    );

    // (0.0 -> 0.12)
    if (statePresent <= 0.12) {
      noiseMesh.current.visible = true;
      noiseMesh.current.scale.setScalar(1);
      itemRefs.current.forEach((r) => r?.scale.setScalar(0));
    }

    // (0.12 -> 0.22)
    else if (statePresent <= 0.22) {
      noiseMesh.current.visible = true;
      itemRefs.current.forEach((r) => r?.scale.setScalar(0));

      // tension tăng từ 0.0 -> 1.0 trong khoảng thời gian step2
      const tension = (statePresent - 0.12) / 0.1;
      const speed = timingPresent * 2.5;

      // Biến dạng từng đỉnh bằng hàm softNoise3D
      for (let i = 0; i < orig.length; i += 3) {
        const d = 1 + softNoise3D(orig[i], orig[i + 1], orig[i + 2], speed) * tension * 0.45;
        current[i] = orig[i] * d;
        current[i + 1] = orig[i + 1] * d;
        current[i + 2] = orig[i + 2] * d;
      }
      posAttr.needsUpdate = true;
      sphereGeo.computeVertexNormals();

      // Chuyển sắc thái vật liệu từ vàng sang đỏ và tăng phát quang
      noiseMat.current.color.lerpColors(cGold, cRed, tension);
      noiseMat.current.emissive.lerpColors(cGold, cRed, tension);
      noiseMat.current.emissiveIntensity = 0.2 + tension * 1.5;
    }

    // (0.22 -> 0.84): Các mô hình 3D lần lượt xuất hiện và xoay tròn
    else if (statePresent <= 0.84) {
      // Ẩn quả cầu năng lượng để nhường chỗ cho model vật thể
      noiseMesh.current.visible = false;
      noiseMesh.current.scale.setScalar(0);

      // Tính toán chỉ số model dựa trên thanh trượt thời gian của pha 3
      const virtualIdx = ((statePresent - 0.22) / 0.62) * normModels.length;
      const currentIdx = Math.min(Math.floor(virtualIdx), normModels.length - 1);
      const localT = virtualIdx - currentIdx; // Tiến độ nội bộ của model hiện tại (0.0 -> 1.0)

      // Kích hoạt Shockwave và đổi theme khi chuyển sang model mới
      if (currentIdx !== lastIndex.current) {
        lastIndex.current = currentIdx;
        setThemeColor(MODEL_THEME_COLORS[currentIdx]);
        setShockTime(timingPresent);
      }

      // Đổi màu và cường độ của đèn tâm theo màu chủ đạo của model
      if (dynamicLight.current) {
        dynamicLight.current.color.lerp(MODEL_THEME_COLORS[currentIdx], delta * 4);
        dynamicLight.current.intensity = THREE.MathUtils.lerp(dynamicLight.current.intensity, 6, delta * 4);
      }

      // Cập nhật hoạt ảnh xuất hiện, bay lơ lửng và biến mất của từng model
      itemRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        if (idx === currentIdx) {
          // Hiệu ứng scale pop-in đàn hồi ở đầu (0 -> 0.22) và thu nhỏ dần khi kết thúc (0.82 -> 1.0)
          const scale =
            localT < 0.22
              ? localT / 0.22 + Math.sin((localT / 0.22) * Math.PI) * 0.18
              : localT > 0.82
              ? Math.max(0, 1 - Math.pow((localT - 0.82) / 0.18, 1.5))
              : 1;

          ref.scale.setScalar(scale);

          // Xoay tròn tự nhiên quanh trục Y và nhấp nhô nhẹ theo trục Y
          ref.rotation.set(
            Math.sin(timingPresent * 1.5) * 0.05,
            timingPresent * 0.9 + idx * 0.5,
            0
          );
          ref.position.y = Math.sin(timingPresent * 2) * 0.04;
        } else {
          // Ẩn các model không thuộc lượt hiển thị
          ref.scale.setScalar(0);
        }
      });
    }

    // (0.84 -> 1.0): Gom tụ năng lượng cực hạn và phát nổ (Implosion)
    else if (!exploded) {
      itemRefs.current.forEach((r) => r?.scale.setScalar(0));
      noiseMesh.current.visible = true;

      // Tiến độ nén năng lượng (0.0 -> 1.0)
      const implosion = (statePresent - 0.84) / 0.16;
      const speed = timingPresent * (3 + implosion * 4);

      // Tần số biến dạng tăng vọt, biên độ co rút dần về tâm
      for (let i = 0; i < orig.length; i += 3) {
        const d = 1 + softNoise3D(orig[i], orig[i + 1], orig[i + 2], speed) * (1 - implosion) * 0.35;
        current[i] = orig[i] * d;
        current[i + 1] = orig[i + 1] * d;
        current[i + 2] = orig[i + 2] * d;
      }
      posAttr.needsUpdate = true;
      sphereGeo.computeVertexNormals();

      // Co bóp quả cầu và chuyển màu sáng rực thành hổ phách (cAmber)
      noiseMesh.current.scale.setScalar(1 - Math.sin(implosion * Math.PI) * 0.2);
      noiseMat.current.color.lerpColors(cRed, cAmber, implosion);
      noiseMat.current.emissive.lerpColors(cRed, cAmber, implosion);
      noiseMat.current.emissiveIntensity = 1.2 + implosion * 3.8;

      if (dynamicLight.current) {
        dynamicLight.current.color.lerp(cAmber, delta * 5);
        dynamicLight.current.intensity = 6 + implosion * 14;
      }

      // ĐIỂM BÙNG NỔ CỰC ĐẠI:
      if (implosion >= 0.98) {
        setExploded(true);
        onExplode(); // Kích hoạt hiệu ứng rung lắc dữ dội ở GiftScene
        noiseMesh.current.visible = false;
        noiseMesh.current.scale.setScalar(0);

        // Flash chớp sáng bùng nổ
        if (dynamicLight.current) {
          dynamicLight.current.intensity = 45;
          dynamicLight.current.color.set('#ffe082');
        }
      }
    }

    // Sau khi nổ xong: Làm mờ dần ánh sáng flash về mức dịu ấm
    if (exploded && dynamicLight.current) {
      dynamicLight.current.intensity = THREE.MathUtils.lerp(dynamicLight.current.intensity, 4, delta * 3);
      dynamicLight.current.color.set('#ffd54f');
    }
  });

 
  return (
    <>
      <group ref={mainGroup} position={[0, PRESENT_CLOSED_Y, 0]}>
        <mesh ref={noiseMesh} geometry={sphereGeo} castShadow>
          <meshPhysicalMaterial
            ref={noiseMat}
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.15}
            roughness={0.12}
            metalness={0.2}
            transmission={0.4}
            thickness={0.8}
          />
        </mesh>

        {normModels.map((m, i) => (
          <group
            key={MODEL_PATHS[i]}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            scale={0}
          >
            <primitive object={m} />
          </group>
        ))}

        {/* vòng sáng */}
        <ElegantShockwave triggerTime={shockTime} color={themeColor} position={[0, 0, 0]} />

        {/* hào quàng */}
        <AmbientAuraParticles
          visible={animProgress.current > 0.22 && animProgress.current <= 0.84}
          color={themeColor}
        />

        {/* shadow */}
        <pointLight ref={dynamicLight} position={[0, 0, 0]} distance={14} decay={1.8} intensity={0} />
      </group>

      {/* fireword */}
      <UltimateFireworks exploded={exploded} />
      <WelcomeText exploded={exploded} />
    </>
  );
}
MODEL_PATHS.forEach((p) => useGLTF.preload(p));