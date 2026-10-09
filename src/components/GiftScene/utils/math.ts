import * as THREE from 'three';

export function softNoise3D(x: number, y: number, z: number, t: number): number {
  return (
    Math.sin(x * 2.8 + t * 2.2) * 0.35 +
    Math.sin(y * 3.2 - t * 2.0) * 0.35 +
    Math.cos(z * 3.0 + t * 2.5) * 0.3
  );
}

export function createSparkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(255, 235, 190, 0.9)');
  grad.addColorStop(0.5, 'rgba(255, 140, 40, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export function normalizeModel(originalScene: THREE.Group, targetSize: number): THREE.Group {
  const clone = originalScene.clone();
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);
  clone.position.sub(center); // Cân tâm vật thể về toạ độ gốc (0, 0, 0)

  const normalizedGroup = new THREE.Group();
  normalizedGroup.add(clone);

  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    normalizedGroup.scale.setScalar(targetSize / maxDim);
  }

  clone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return normalizedGroup;
}

export interface WaveOptions {
  amplitude?: number;  // Biên độ sóng (độ cao đỉnh sóng)
  frequency?: number;  // Tần số không gian (mật độ gợn sóng)
  speed?: number;      // Tốc độ lan truyền của sóng
  turbulent?: boolean; // Kết hợp thêm hàm softNoise3D để tạo gợn tự nhiên
}

export function calculateWaveHeight(
  x: number,
  z: number,
  t: number,
  options: WaveOptions = {}
): number {
  const {
    amplitude = 0.45,
    frequency = 1.2,
    speed = 2.0,
    turbulent = true,
  } = options;

  // Lớp sóng 1: Sóng lan truyền theo hướng chéo (x + z)
  const dir1 = Math.sin((x * 0.7 + z * 0.7) * frequency + t * speed) * amplitude * 0.55;

  // Lớp sóng 2: Sóng phụ phản xạ ngược hướng (x - z) với tần số cao hơn
  const dir2 = Math.cos((x * 0.5 - z * 0.8) * frequency * 1.4 - t * speed * 1.2) * amplitude * 0.35;

  // Lớp sóng 3: Sóng tròn tâm lan tỏa từ gốc tọa độ
  const dist = Math.sqrt(x * x + z * z);
  const ripple = Math.sin(dist * frequency * 2.0 - t * speed * 1.6) * amplitude * 0.2;

  let totalHeight = dir1 + dir2 + ripple;

  // Nếu bật turbulent: hòa trộn thêm softNoise3D để phá vỡ tính chu kỳ đều đặn
  if (turbulent) {
    totalHeight += softNoise3D(x * 0.5, totalHeight, z * 0.5, t) * amplitude * 0.25;
  }

  return totalHeight;
}

/**
 * 2.2. Hàm biến dạng các đỉnh (Vertices) của BufferGeometry trong mỗi frame render.
 * Dùng trực tiếp trong hook `useFrame` của R3F:
 * 
 * useFrame(({ clock }) => {
 *   updateWaveGeometry(meshRef.current.geometry, clock.getElapsedTime());
 * });
 */
export function updateWaveGeometry(
  geometry: THREE.BufferGeometry,
  t: number,
  options: WaveOptions = {}
): void {
  const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
  if (!positionAttribute) return;

  // Duyệt qua từng đỉnh của lưới hình học
  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const z = positionAttribute.getZ(i);

    // Tính toán lại tọa độ Y của từng đỉnh
    const newY = calculateWaveHeight(x, z, t, options);
    positionAttribute.setY(i, newY);
  }

  // Đánh dấu để Three.js GPU renderer nạp lại dữ liệu tọa độ đỉnh mới
  positionAttribute.needsUpdate = true;

  // Tính lại véc-tơ pháp tuyến (normals) để hiệu ứng đổ bóng và phản chiếu ánh sáng đổi theo sóng
  geometry.computeVertexNormals();
}

/**
 * Hàm khởi tạo Mesh lưới sóng nước 3D.
 * Sử dụng PlaneGeometry được xoay ngang cùng vật liệu chuẩn PBR.
 */
export function createWaveMesh(
  width = 16,
  height = 16,
  segments = 64,
  materialColor = '#2b75a0'
): THREE.Mesh {
  // Lưới PlaneGeometry càng nhiều segment thì mặt sóng càng mịn
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);

  // Xoay -90 độ trục X để biến mặt phẳng đứng thành mặt nằm ngang (mặt nước)
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: materialColor,
    roughness: 0.15, // Độ nhám thấp tạo độ phản chiếu bóng mặt nước
    metalness: 0.1,
    flatShading: false,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}