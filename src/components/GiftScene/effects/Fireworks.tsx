import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MAIN_BURST_COUNT, PRESENT_OPEN_Y } from '../constants';
import { createSparkTexture } from '../utils/math';

export function UltimateFireworks({ exploded }: { exploded: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const sparkTexture = useMemo(createSparkTexture, []);

  const [geoData, physics] = useMemo(() => {
    const positions = new Float32Array(MAIN_BURST_COUNT * 3);
    const colors = new Float32Array(MAIN_BURST_COUNT * 3);
    const sizes = new Float32Array(MAIN_BURST_COUNT);
    const palette = ['#ffe6aa', '#ff0044', '#ff9900', '#00f5d4', '#ffffff'].map((c) => new THREE.Color(c));

    const phys = Array.from({ length: MAIN_BURST_COUNT }, (_, i) => {
      positions[i * 3 + 1] = PRESENT_OPEN_Y;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 5 + Math.random() * 9;
      const color = palette[Math.floor(Math.random() * palette.length)].clone();

      colors.set([color.r, color.g, color.b], i * 3);
      const baseSize = 0.25 + Math.random() * 0.35;
      sizes[i] = baseSize;

      return {
        vel: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta)
        ).multiplyScalar(speed),
        originColor: color,
        drag: 0.94 + Math.random() * 0.03,
        gravity: 2.8 + Math.random() * 2.2,
        flickerSpeed: 15 + Math.random() * 30,
        life: 1.0,
        decay: 0.32 + Math.random() * 0.35,
        baseSize,
      };
    });

    return [{ positions, colors, sizes }, phys];
  }, []);

  useEffect(() => {
    if (exploded && pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      physics.forEach((p, i) => {
        pos[i * 3] = pos[i * 3 + 2] = 0;
        pos[i * 3 + 1] = PRESENT_OPEN_Y;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        p.vel
          .set(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta))
          .multiplyScalar(6 + Math.random() * 10);
        p.life = 1.0;
      });
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  }, [exploded, physics]);

  useFrame(({ clock }, delta) => {
    if (!exploded || !pointsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const col = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const sz = pointsRef.current.geometry.attributes.size.array as Float32Array;

    physics.forEach((p, i) => {
      if (p.life > 0) {
        p.vel.multiplyScalar(Math.pow(p.drag, dt * 60)).y -= p.gravity * dt;
        pos[i * 3] += p.vel.x * dt;
        pos[i * 3 + 1] += p.vel.y * dt;
        pos[i * 3 + 2] += p.vel.z * dt;
        p.life -= p.decay * dt;

        const flicker = Math.sin(t * p.flickerSpeed + i) * 0.5 + 0.5;
        const alpha = Math.max(0, p.life) * (0.6 + 0.4 * flicker);
        col[i * 3] = p.originColor.r * alpha * 1.5;
        col[i * 3 + 1] = p.originColor.g * alpha * 1.5;
        col[i * 3 + 2] = p.originColor.b * alpha * 1.5;
        sz[i] = p.baseSize * Math.max(0.1, p.life);
      } else {
        sz[i] = 0;
      }
    });

    ['position', 'color', 'size'].forEach((k) => {
      pointsRef.current!.geometry.attributes[k].needsUpdate = true;
    });
  });

  return (
    <points ref={pointsRef} visible={exploded}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geoData.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[geoData.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[geoData.sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        map={sparkTexture}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}