import * as THREE from 'three';

export const LID_CLOSED_POS = new THREE.Vector3(0, 1.65, 0);
export const LID_LAND_POS = new THREE.Vector3(2.8, 0.52, 0.6);

export const PRESENT_CLOSED_Y = 0.8;
export const PRESENT_OPEN_Y = 2.4;

export const MORPH_DURATION = 15.5;
export const TARGET_SIZE = 2.0;

export const MAIN_BURST_COUNT = 900;
export const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';

export const MODEL_PATHS = [
  '/models/star.glb',            // 0: Ngôi sao
  '/models/lotus.glb',           // 1: Hoa sen
  '/models/leaf_hat.glb',        // 2: Nón lá
  '/models/ao_dai.glb',          // 3: Áo dài
  '/models/duc_ba.glb',          // 4: Nhà thờ Đức Bà
  '/models/vietnamese_flag.glb', // 5: Cờ Việt Nam
];

export const MODEL_THEME_COLORS = [
  '#ffc107', // Vàng kim
  '#f06292', // Hồng cánh sen
  '#ffe082', // Vàng rơm nón lá
  '#4dd0e1', // Cyan thanh tao
  '#ff7043', // Đất nung Đức Bà
  '#d32f2f', // Đỏ cờ Tổ quốc
].map((hex) => new THREE.Color(hex));

// => quản lý các mục tiêu State, tọa độ và không gian 3D