import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SpiralAnimation() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth || 400;
    const H = mount.clientHeight || 400;

    /* ── Scene setup ─────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ── Build spiral arms ───────────────────────────────────────── */
    const ARMS = 3;
    const SEGS = 600;
    const ROTATIONS = 5;
    const spiralGroup = new THREE.Group();

    for (let arm = 0; arm < ARMS; arm++) {
      const positions = [];
      const colors = [];
      const armOffset = (arm / ARMS) * Math.PI * 2;

      for (let i = 0; i <= SEGS; i++) {
        const t = i / SEGS;
        const angle = t * Math.PI * 2 * ROTATIONS + armOffset;
        const radius = t * 3;
        const z = (t - 0.5) * 4;

        positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, z);

        // Gradient: indigo (#6366f1) → purple (#a855f7) → pink (#ec4899)
        const r = 0.388 + t * (0.925 - 0.388);
        const g = 0.4   + t * (0.333 - 0.4);
        const b = 0.945 - t * (0.945 - 0.6);
        colors.push(r, g, b);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
      });

      spiralGroup.add(new THREE.Line(geo, mat));
    }

    scene.add(spiralGroup);

    /* ── Center glow orb ─────────────────────────────────────────── */
    const glowGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8, transparent: true, opacity: 0.55,
    });
    const glowOrb = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowOrb);

    /* ── Ring halos ──────────────────────────────────────────────── */
    const ringColors = [0x6366f1, 0xa855f7, 0xec4899];
    const rings = ringColors.map((color, i) => {
      const rGeo = new THREE.RingGeometry(0.5 + i * 0.4, 0.52 + i * 0.4, 64);
      const rMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.15 - i * 0.03, side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = Math.PI / 4 + i * 0.3;
      scene.add(ring);
      return ring;
    });

    /* ── Animation loop ──────────────────────────────────────────── */
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      spiralGroup.rotation.z = t * 0.25;
      spiralGroup.rotation.x = Math.sin(t * 0.15) * 0.25;
      spiralGroup.rotation.y = Math.cos(t * 0.1) * 0.1;

      glowOrb.scale.setScalar(1 + Math.sin(t * 2.5) * 0.12);
      glowMat.opacity = 0.4 + Math.sin(t * 2) * 0.15;

      rings.forEach((ring, i) => {
        ring.rotation.z = t * (0.2 + i * 0.08);
        ring.rotation.y = t * (0.1 - i * 0.04);
      });

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize handler ──────────────────────────────────────────── */
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
    />
  );
}
