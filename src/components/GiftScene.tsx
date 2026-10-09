import { useRef, useState, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useGLTF, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const CLOSED_Y = 1.65;
const OPEN_Y = 3;
const CLOSED_ROTATION_X = 0;
const OPEN_ROTATION_X = -0.35;
const PRESENT_CLOSED_Y = 0.8;
const PRESENT_OPEN_Y = 2.2;

const MODEL_BOX_PATH = "/models/gift_box_handson.glb";
const MODEL_D_PATH = "/models/logo_depart.glb";
const MODEL_DICE_PATH = "/models/dice-compress.gltf";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);

const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath(
    "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/libs/basis/",
);

function GiftBox() {
    const { gl } = useThree();

    const diceGltf = useLoader(GLTFLoader, MODEL_DICE_PATH, (loader) => {
        ktx2Loader.detectSupport(gl);
        loader.setKTX2Loader(ktx2Loader);
        loader.setDRACOLoader(dracoLoader);
    });

    const { scene: boxScene, nodes } = useGLTF(MODEL_BOX_PATH);
    const { scene: dScene, materials } = useGLTF(MODEL_D_PATH);

    if (materials && materials.Mat) {
        materials.Mat.color.set('#333333'); 
        materials.Mat.roughness = 0.4;
        materials.Mat.metalness = 0.1;
    }

    const [opened, setOpened] = useState(false);
    const [hovered, setHovered] = useState(false);

    const boxGroupRef = useRef<THREE.Group>(null);
    const diceRef = useRef<THREE.Group>(null);
    const pointLightRef = useRef<THREE.PointLight>(null);
    const wobbleTimer = useRef(0);

    useFrame((_, delta) => {
        // Xoay xúc xắc nhẹ liên tục
        if (diceRef.current) {
            diceRef.current.rotation.y += delta * 0.5;
            diceRef.current.rotation.x += delta * 0.2;
        }

        const lid = nodes.Lid;
        const lidTargetY = opened ? OPEN_Y : CLOSED_Y;
        const lidTargetRotX = opened ? OPEN_ROTATION_X : CLOSED_ROTATION_X;
        const presentTargetY = opened ? PRESENT_OPEN_Y : PRESENT_CLOSED_Y;

        // Giới hạn delta để không bị giật lag khi chuyển tab
        const safeDelta = Math.min(delta, 0.1);
        const lerpFactor = THREE.MathUtils.clamp(safeDelta * 8, 0, 1);

        let targetWobbleZ = 0;
        let targetWobbleX = 0;

        if (hovered && !opened) {
            wobbleTimer.current += safeDelta * 16;
            targetWobbleZ = Math.sin(wobbleTimer.current) * 0.08;
            targetWobbleX = Math.cos(wobbleTimer.current * 0.8) * 0.04;
        } else {
            wobbleTimer.current = 0;
        }

        // Smoothly lerp toàn bộ hộp quà theo chuyển động wobble
        if (boxGroupRef.current) {
            boxGroupRef.current.rotation.z = THREE.MathUtils.lerp(
                boxGroupRef.current.rotation.z,
                targetWobbleZ,
                lerpFactor,
            );
            boxGroupRef.current.rotation.x = THREE.MathUtils.lerp(
                boxGroupRef.current.rotation.x,
                targetWobbleX,
                lerpFactor,
            );
        }

        // Animation mở nắp hộp
        if (lid) {
            lid.position.y = THREE.MathUtils.lerp(
                lid.position.y,
                lidTargetY,
                lerpFactor,
            );
            lid.rotation.x = THREE.MathUtils.lerp(
                lid.rotation.x,
                lidTargetRotX,
                lerpFactor,
            );
            lid.rotation.z = THREE.MathUtils.lerp(
                lid.rotation.z,
                opened ? 0.15 : 0,
                lerpFactor,
            );
        }

        // Animation quà bên trong đẩy lên
        if (diceRef.current) {
            diceRef.current.position.y = THREE.MathUtils.lerp(
                diceRef.current.position.y,
                presentTargetY,
                lerpFactor,
            );
        }

        const targetLightIntensity = opened ? 15 : 0;

        if (pointLightRef.current) {
            pointLightRef.current.intensity = THREE.MathUtils.lerp(
                pointLightRef.current.intensity,
                targetLightIntensity,
                lerpFactor,
            );
        }
    });

    return (
        <group
            ref={boxGroupRef}
            onClick={(e) => {
                e.stopPropagation();
                setOpened((prev) => !prev);
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = "auto";
            }}
            >
            <primitive object={boxScene} />

            <pointLight
                ref={pointLightRef}
                position={[0, 1.2, 0]}
                color="#fffaaa"
                distance={6}
                decay={2}
                intensity={0}
            />

            <group ref={diceRef} position={[0, PRESENT_CLOSED_Y, 0]} scale={[0.8, 0.8, 0.8]}>
                <primitive object={dScene} />
                {opened && (
                    <Sparkles
                        count={40}
                        scale={[3, 3, 3]}
                        size={6}
                        speed={0.8}
                        noise={0.1}
                        color="#ffd700"
                    />
                )}
            </group>
        </group>
    );
}

export default function GiftScene() {
    return (
        <Canvas
        camera={{ position: [7, 4, 7], fov: 45 }}
        shadows
        dpr={[1, 1.5]}
        gl={{
            powerPreference: "high-performance",
            antialias: true,
        }}
        >
        <color attach="background" args={["#f4f1ec"]} />

        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 3]} intensity={2} castShadow />

        <GiftBox />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#d8d2c8" />
        </mesh>
        </Canvas>
    );
}

useGLTF.preload(MODEL_BOX_PATH);
