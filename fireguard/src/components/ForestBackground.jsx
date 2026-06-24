import { useMemo, useEffect, useState, useRef } from 'react';

/**
 * Immersive forest scene: two parallax tree-silhouette layers (react to
 * mouse movement) + a field of rising ember particles (pure CSS animation,
 * positions/timings randomized once on mount).
 */
export default function ForestBackground() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setTilt({ x, y });
        rafRef.current = null;
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const embers = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => {
      const size = 2 + Math.random() * 4;
      return {
        id: i,
        left: Math.random() * 100,
        size,
        duration: 7 + Math.random() * 9,
        delay: Math.random() * 12,
        drift: (Math.random() - 0.5) * 120,
      };
    });
  }, []);

  return (
    <div className="forest-scene">
      <svg
        className="canopy"
        viewBox="0 0 1600 360"
        preserveAspectRatio="none"
        style={{ transform: `translate3d(${tilt.x * 6}px, ${tilt.y * 3}px, 0)` }}
      >
        <TreeRow color="#0D1A12" baseY={360} seed={1} />
      </svg>

      <svg
        className="canopy layer2"
        viewBox="0 0 1600 320"
        preserveAspectRatio="none"
        style={{ transform: `translate3d(${-tilt.x * 10}px, ${-tilt.y * 4}px, 0)` }}
      >
        <TreeRow color="#152A1D" baseY={320} seed={2} />
      </svg>

      <div className="ember-field">
        {embers.map((e) => (
          <span
            key={e.id}
            className="ember"
            style={{
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animationDuration: `${e.duration}s`,
              animationDelay: `${e.delay}s`,
              '--drift': `${e.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="vignette" />
    </div>
  );
}

/** Generates a deterministic-but-organic row of pine silhouettes as one SVG path. */
function TreeRow({ color, baseY, seed }) {
  const path = useMemo(() => {
    let rng = seed * 9301 + 49297;
    const rand = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    let d = `M0,${baseY} `;
    let x = -20;
    while (x < 1620) {
      const treeW = 60 + rand() * 70;
      const treeH = 90 + rand() * 170;
      const peakX = x + treeW / 2 + (rand() - 0.5) * 14;
      d += `L${x},${baseY} `;
      const tiers = 3;
      for (let t = 0; t < tiers; t++) {
        const tierY = baseY - treeH * ((t + 1) / tiers);
        const tierW = treeW * (1 - t * 0.28);
        d += `L${peakX - tierW / 2},${tierY + treeH * 0.12} L${peakX},${tierY} L${peakX + tierW / 2},${tierY + treeH * 0.12} `;
      }
      d += `L${x + treeW},${baseY} `;
      x += treeW * (0.55 + rand() * 0.25);
    }
    d += `L1620,${baseY} L1620,${baseY + 40} L0,${baseY + 40} Z`;
    return d;
  }, [baseY, seed]);

  return <path d={path} fill={color} />;
}
