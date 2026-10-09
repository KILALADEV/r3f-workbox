import { useEffect, useRef } from 'react';

export type Vec3 = [number, number, number];

export const LIGHT_RANGE = {
  x: [-10, 10],
  y: [0.5, 12],
  z: [-10, 10],
} as const;

const AXES = ['x', 'y', 'z'] as const;

type ControlPanelProps = {
  lightPosition: Vec3;
  onLightChange: (position: Vec3) => void;
  onLightReset: () => void;
  onResetView: () => void;
};

export default function ControlPanel({
  lightPosition,
  onLightChange,
  onLightReset,
  onResetView,
}: ControlPanelProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);


  useEffect(() => {
    if (detailsRef.current && window.matchMedia('(max-width: 640px)').matches) {
      detailsRef.current.open = false;
    }
  }, []);

  return (
    <aside className="control-panel">
      <details ref={detailsRef} open>
        <summary>Bảng điều khiển</summary>

        <section>
          <h2>Góc nhìn</h2>
          <p className="hint">
            Kéo để xoay. Cuộn chuột hoặc chụm hai ngón để phóng to/thu nhỏ. Kéo chuột phải hoặc
            kéo hai ngón để dời khung hình.
          </p>
          <button type="button" onClick={onResetView}>
            Đặt lại góc nhìn
          </button>
        </section>

        <section>
          <h2>Đèn</h2>
          {AXES.map((axis, i) => (
            <label key={axis}>
              <span>{axis.toUpperCase()}</span>
              <input
                type="range"
                min={LIGHT_RANGE[axis][0]}
                max={LIGHT_RANGE[axis][1]}
                step={0.1}
                aria-label={`Vị trí đèn theo trục ${axis.toUpperCase()}`}
                value={lightPosition[i]}
                onChange={(e) => {
                  const next: Vec3 = [...lightPosition];
                  next[i] = Number(e.target.value);
                  onLightChange(next);
                }}
              />
              <output>{lightPosition[i].toFixed(1)}</output>
            </label>
          ))}
          <p className="hint">
            Hoặc click bóng đèn vàng trong cảnh để kéo trực tiếp (thu nhỏ khung hình nếu chưa
            thấy bóng đèn).
          </p>
          <button type="button" onClick={onLightReset}>
            Đặt lại đèn
          </button>
        </section>
      </details>
    </aside>
  );
}
