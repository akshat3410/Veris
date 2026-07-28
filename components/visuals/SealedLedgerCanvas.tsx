'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * SEALED LEDGER CANVAS — 5-STATE SCROLL NARRATIVE ORB
 * Transparent canvas overlaying the clean unified light background (#FAFAF8).
 */

export function SealedLedgerCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Main Orb Group
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // Materials
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563EB,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.5,
      clearcoat: 1.0,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      metalness: 0.9,
      roughness: 0.15,
    });

    const seamMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
    });

    // 1. Core Sphere
    const coreGeo = new THREE.SphereGeometry(1.25, 64, 64);
    const orbCore = new THREE.Mesh(coreGeo, chromeMat);
    orbGroup.add(orbCore);

    // 2. Seam Ring
    const seamGeo = new THREE.TorusGeometry(1.27, 0.02, 16, 100);
    const seamRing = new THREE.Mesh(seamGeo, seamMat);
    seamRing.rotation.x = Math.PI / 2;
    orbGroup.add(seamRing);

    // 3. Concentric Refracting Shells
    const shell1 = new THREE.Mesh(new THREE.SphereGeometry(1.48, 48, 48), glassMat);
    orbGroup.add(shell1);

    const shell2Mat = glassMat.clone();
    shell2Mat.color = new THREE.Color(0x4F46E5);
    const shell2 = new THREE.Mesh(new THREE.SphereGeometry(1.72, 48, 48), shell2Mat);
    orbGroup.add(shell2);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 3.5);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const blueFill = new THREE.DirectionalLight(0x93C5FD, 2.0);
    blueFill.position.set(-5, -3, 4);
    scene.add(blueFill);

    // Mouse Parallax & Scroll Track
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    let scrollProgress = 0;
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / (maxScroll || 1)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      // Smooth scroll state morphing
      const p = scrollProgress;

      let targetX = 1.6;
      let targetY = 0.1;
      let targetScale = 1.0;

      if (p < 0.25) {
        // Hero State: Right side (1.6)
        targetX = 1.6 - p * 1.5;
        shell1.scale.setScalar(1.0);
        shell2.scale.setScalar(1.0);
      } else if (p >= 0.25 && p < 0.55) {
        // Architecture & How it works: Center-left refraction
        const localP = (p - 0.25) / 0.3;
        targetX = -1.5 + localP * 0.8;
        targetY = -0.2;
        shell1.scale.setScalar(1.0 + localP * 0.2);
        shell2.scale.setScalar(1.0 + localP * 0.4);
        shell1.rotation.y = elapsed * 0.25;
        shell2.rotation.z = -elapsed * 0.18;
      } else if (p >= 0.55 && p < 0.82) {
        // Dashboard Engine State
        const localP = (p - 0.55) / 0.27;
        targetX = 0;
        targetY = 0.5 - localP * 0.3;
        targetScale = 0.85;
      } else {
        // Final Resolved State
        targetX = 0;
        targetY = -0.3;
        targetScale = 1.1;
      }

      // Smooth Position Scrub
      orbGroup.position.x += (targetX - orbGroup.position.x) * 0.06;
      orbGroup.position.y += (targetY - orbGroup.position.y) * 0.06;
      orbGroup.scale.setScalar(targetScale);

      // Idle Rotation + Mouse Tilt
      orbGroup.rotation.y = elapsed * 0.1 + mouseX * 0.2;
      orbGroup.rotation.x = 0.3 + mouseY * 0.15;

      renderer.render(scene, camera);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      mount?.contains(renderer.domElement) && mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
