import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, PivotControls, useCursor, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import ControlPanel, { LIGHT_RANGE, type Vec3 } from './ControlPanel';

const CLOSED_Y = 1.65;
const OPEN_Y = 3;
const PRESENT_CLOSED_Y = 0.8;
const PRESENT_OPEN_Y = 2.2;

const CAMERA_POSITION: Vec3 = [8, 4.5, 8];
const CAMERA_TARGET: Vec3 = [0, 1.5, 0];
const DEFAULT_LIGHT_POSITION: Vec3 = [-3, 5, 4];


const CLICK_DELTA = 2;

const tmpPosition = new THREE.Vector3();

const clamp = (value: number, [min, max]: readonly [number, number]) =>
  THREE.MathUtils.clamp(value, min, max);

type GiftBoxProps = {
  opened: boolean;
  onToggle: () => void;
};

function GiftBox({ opened, onToggle }: GiftBoxProps) {
  const { scene, nodes } = useGLTF('/models/gift_box_handson.glb');
  const lid = nodes.Lid;
  const presentRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);


  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
      }
    });
  }, [scene]);

  useFrame(() => {
    if (!lid || !presentRef.current) return;

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
  });

  return (
    <group
      onClick={(e) => {
  
        e.stopPropagation();

        if (e.delta > CLICK_DELTA) return;
        onToggle();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />

      {/* Present */}
      <mesh
        ref={presentRef}
        name="Present"
        position={[0, PRESENT_CLOSED_Y, 0]}
        castShadow
      >
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#f4c542" />
      </mesh>
    </group>
  );
}

type LightRigProps = {
  position: Vec3;
  selected: boolean;
  onSelect: () => void;
  onMove: (position: Vec3) => void;
};

function LightRig({ position, selected, onSelect, onMove }: LightRigProps) {
  const matrix = useMemo(
    () => new THREE.Matrix4().makeTranslation(position[0], position[1], position[2]),
    [position],
  );

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <>
      <directionalLight
        position={position}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      >

        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.5, 50]} />
      </directionalLight>

      <PivotControls
        matrix={matrix}
        autoTransform={false}
        enabled={selected}
        disableRotations
        disableScaling
        fixed
        scale={90}
        depthTest={false}
        onDrag={(local) => {
          tmpPosition.setFromMatrixPosition(local);
          onMove([
            clamp(tmpPosition.x, LIGHT_RANGE.x),
            clamp(tmpPosition.y, LIGHT_RANGE.y),
            clamp(tmpPosition.z, LIGHT_RANGE.z),
          ]);
        }}
      >
        <mesh
          name="LightBulb"
          onClick={(e) => {
            e.stopPropagation();
            if (e.delta > CLICK_DELTA) return;
            onSelect();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshBasicMaterial color="#ffd54a" />
        </mesh>
      </PivotControls>

  
      <Line
        points={[position, [0, 0, 0]]}
        color="#e0a800"
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
    </>
  );
}

export default function GiftScene() {
  const [opened, setOpened] = useState(false);
  const [lightSelected, setLightSelected] = useState(false);
  const [lightPosition, setLightPosition] = useState<Vec3>(DEFAULT_LIGHT_POSITION);
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);

  const resetView = () => {
    const controls = controlsRef.current;
    if (!controls) return;

  
    controls.enableDamping = false;
    controls.update();
    controls.object.position.set(...CAMERA_POSITION);
    controls.target.set(...CAMERA_TARGET);
    controls.update();
    controls.enableDamping = true;
  };

  return (
    <div className="gift-app">
      <Canvas
        camera={{ position: CAMERA_POSITION, fov: 45 }}
        shadows
        onPointerMissed={() => setLightSelected(false)}
      >
        <color attach="background" args={['#f4f1ec']} />

        <ambientLight intensity={1.2} />
        <LightRig
          position={lightPosition}
          selected={lightSelected}
          onSelect={() => setLightSelected(true)}
          onMove={setLightPosition}
        />

        <GiftBox opened={opened} onToggle={() => setOpened(!opened)} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#d8d2c8" />
        </mesh>

     
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={CAMERA_TARGET}
          minDistance={3}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>

      <ControlPanel
        lightPosition={lightPosition}
        onLightChange={setLightPosition}
        onLightReset={() => setLightPosition(DEFAULT_LIGHT_POSITION)}
        onResetView={resetView}
      />
    </div>
  );
}
