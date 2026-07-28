'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * SIGNATURE 3D OBJECT — ARCHITECTURAL LIQUID GLASS TRUST VAULT
 *
 * Designed according to Apple Liquid Glass & Industrial Product Design standards.
 * Materials:
 *  - Outer Precision Refractive Glass Ring (Frosted Translucent Acrylic / Glass)
 *  - Inner Brushed Titanium Mechanical Core Ring
 *  - Central Ceramic Vault Lens
 *
 * Motion & Interaction:
 *  - Calm, intentional motion. No continuous spin, no bouncing.
 *  - Magnetic mouse reaction: responds softly to cursor position.
 *  - Scroll progression: subtle depth transformation as user scrolls down.
 */

export function Hero3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // ── Vault Assembly ────────────────────────────────────────────────────────
    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // Materials
    // 1. Frosted Translucent Glass Ring
    const frostedGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.12,
      ior: 1.5,
      thickness: 0.8,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xFFFFFF),
    });

    // 2. Polished Titanium Core
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      metalness: 0.92,
      roughness: 0.15,
    });

    // 3. Apple Blue Ceramic Lens Accent
    const ceramicBlueMat = new THREE.MeshPhysicalMaterial({
      color: 0x5E7CFA,
      transmission: 0.5,
      roughness: 0.08,
      metalness: 0.1,
      thickness: 0.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    // Outer Liquid Glass Ring
    const glassRingGeo = new THREE.TorusGeometry(1.65, 0.14, 48, 120);
    const glassRing = new THREE.Mesh(glassRingGeo, frostedGlassMat);
    vaultGroup.add(glassRing);

    // Inner Titanium Gimbal Ring
    const innerRingGeo = new THREE.TorusGeometry(1.3, 0.07, 32, 100);
    const innerRing = new THREE.Mesh(innerRingGeo, titaniumMat);
    vaultGroup.add(innerRing);

    // Central Architectural Ceramic Vault Capsule Core
    const coreGroup = new THREE.Group();

    const ceramicCoreGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.25, 64);
    const ceramicCore = new THREE.Mesh(ceramicCoreGeo, titaniumMat);
    ceramicCore.rotation.x = Math.PI / 2;
    coreGroup.add(ceramicCore);

    const blueLensGeo = new THREE.SphereGeometry(0.42, 48, 48);
    const blueLens = new THREE.Mesh(blueLensGeo, ceramicBlueMat);
    coreGroup.add(blueLens);

    vaultGroup.add(coreGroup);

    // Architectural Initial Tilt
    vaultGroup.rotation.x = 0.38;
    vaultGroup.rotation.y = -0.45;

    // ── Studio Lighting ───────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    // Soft Studio Key Light
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 3.0);
    keyLight.position.set(6, 8, 7);
    scene.add(keyLight);

    // Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0xC7D2FE, 1.5);
    fillLight.position.set(-6, -4, 4);
    scene.add(fillLight);

    // Back Light (Glass Edge Highlight)
    const edgeLight = new THREE.DirectionalLight(0xFFFFFF, 2.0);
    edgeLight.position.set(0, 5, -5);
    scene.add(edgeLight);

    // ── Interaction & Motion ──────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
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

    // ── Render Loop ───────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      // Magnetic Lerp
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Calm Breathing Float
      const floatY = Math.sin(elapsed * 0.7) * 0.05;

      // Restrained Motion (Apple Luxury Watch style)
      vaultGroup.position.y = floatY;
      vaultGroup.rotation.y = -0.45 + mouseX * 0.18 + Math.sin(elapsed * 0.25) * 0.08;
      vaultGroup.rotation.x = 0.38 + mouseY * 0.12 + Math.cos(elapsed * 0.2) * 0.04;

      innerRing.rotation.z = elapsed * 0.08;
      glassRing.rotation.z = -elapsed * 0.05;

      // Scroll Depth Transformation
      const depthShift = scrollProgress * 0.5;
      innerRing.position.z = depthShift * 0.3;
      vaultGroup.scale.setScalar(1 + scrollProgress * 0.08);

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
        width: '100%',
        height: '380px',
        maxHeight: '44vh',
        position: 'relative',
        zIndex: 5,
        margin: '0 auto',
      }}
    />
  );
}
