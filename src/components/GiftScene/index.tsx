import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // Trình điều khiển camera
import { GiftBox } from "./models/GiftBox";

export default function GiftScene() {
  const [opened, setOpened] = useState(false);
  // Rung lắc (0: đứng yên, 1.0: rung nhẹ chuẩn bị mở, 2.8: nổ bung)
  const [shake, setShake] = useState(0);
  // flag no-click 500ms
  const isTransitioning = useRef(false);
  // Ref play/pause video
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleToggle = () => {
    if (isTransitioning.current) return;

    if (!opened) {
      isTransitioning.current = true;
      setShake(1.0);

      setTimeout(() => {
        setShake(0);
        setOpened(true);
        isTransitioning.current = false;
      }, 500);
    } else {
      setOpened(false);
    }
  };

  //active shake run 2.8
  const triggerExplosion = () => {
    setShake(2.8);
    setTimeout(() => setShake(0), 450);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (opened) {
      // video alway begin
      video.currentTime = 0;
      video.play().catch(console.warn);
    } else {
      const timer = setTimeout(() => {
        if (!opened) video.pause();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [opened]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#333",
      }}
    >
      <video
        ref={videoRef}
        src="/videos/aurora.mp4"
        loop
        muted // Muted bắt buộc để trình duyệt cho phép tự động phát video
        playsInline // Hỗ trợ phát nội tuyến mượt mà trên thiết bị iOS
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: opened ? 1 : 0, // Hiện dần khi mở, ẩn khi đóng
          transition: "opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1)", // Chuyển đổi mượt mà
          pointerEvents: "none", // Không chặn sự kiện chuột xuống layer bên dưới
        }}
      />

      <Canvas
        camera={{ position: [7, 4, 7], fov: 50 }}
        shadows
        // - alpha: Nền trong suốt
        // - antialias: khử răng cưa
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0, 0); // Đặt màu xóa là (0,0,0) với alpha = 0
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 3]} intensity={2} castShadow />
        <GiftBox
          opened={opened}
          onToggle={handleToggle}
          onExplode={triggerExplosion}
          shake={shake}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#d8d2c8" />
        </mesh>

        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={9.5}
          maxDistance={16}
        />
      </Canvas>
    </div>
  );
}
