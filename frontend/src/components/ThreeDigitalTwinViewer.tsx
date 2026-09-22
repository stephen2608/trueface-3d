import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Sparkles } from 'lucide-react';
import { Point3D, SpatialTelemetryResponse } from '../types';

interface Props {
  landmarks: Point3D[] | null;
  telemetry: SpatialTelemetryResponse | null;
}

export const ThreeDigitalTwinViewer: React.FC<Props> = ({ landmarks, telemetry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const linesMeshRef = useRef<THREE.LineSegments | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  const [renderMode, setRenderMode] = useState<'MESH' | 'POINTS' | 'WIREFRAME'>('MESH');
  const [cameraAngle, setCameraAngle] = useState<'FRONT' | 'ANGLE_45' | 'SIDE'>('FRONT');

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 350;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.5);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 3, 20);
    blueLight.position.set(2, 2, 3);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 20);
    purpleLight.position.set(-2, -1, 2);
    scene.add(purpleLight);

    // 4. Face Group
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // 5. Geometry (478 vertices)
    const vertexCount = 478;
    const positions = new Float32Array(vertexCount * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Points Material with soft glow
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.024,
      transparent: true,
      opacity: 0.9,
    });

    const pointsMesh = new THREE.Points(geometry, pointsMaterial);
    pointsMeshRef.current = pointsMesh;
    group.add(pointsMesh);

    // Wireframe connection indices
    const lineIndices: number[] = [];
    // Jawline
    for (let i = 0; i < 16; i++) lineIndices.push(i, i + 1);
    // Lips
    const lipRing = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
    for (let i = 0; i < lipRing.length - 1; i++) lineIndices.push(lipRing[i], lipRing[i + 1]);
    // Eyes
    const leftEyeRing = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
    for (let i = 0; i < leftEyeRing.length - 1; i++) lineIndices.push(leftEyeRing[i], leftEyeRing[i + 1]);
    const rightEyeRing = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263];
    for (let i = 0; i < rightEyeRing.length - 1; i++) lineIndices.push(rightEyeRing[i], rightEyeRing[i + 1]);
    // Eyebrows
    const leftBrow = [70, 63, 105, 66, 107];
    for (let i = 0; i < leftBrow.length - 1; i++) lineIndices.push(leftBrow[i], leftBrow[i + 1]);
    const rightBrow = [300, 293, 334, 296, 336];
    for (let i = 0; i < rightBrow.length - 1; i++) lineIndices.push(rightBrow[i], rightBrow[i + 1]);
    // Nose
    const nose = [168, 6, 197, 195, 5, 4, 1, 19, 94, 2];
    for (let i = 0; i < nose.length - 1; i++) lineIndices.push(nose[i], nose[i + 1]);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeometry.setIndex(lineIndices);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    linesMeshRef.current = linesMesh;
    group.add(linesMesh);

    // 6. Ambient Perspective Floor Grid
    const grid = new THREE.GridHelper(5, 25, 0x3b82f6, 0x27272a);
    grid.position.y = -1.2;
    scene.add(grid);

    // 7. Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      lineGeometry.dispose();
      pointsMaterial.dispose();
      lineMaterial.dispose();
    };
  }, []);

  // Update Points and Rotation
  useEffect(() => {
    if (!landmarks || landmarks.length === 0 || !pointsMeshRef.current || !linesMeshRef.current) return;

    const positions = (pointsMeshRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;

    for (let i = 0; i < Math.min(landmarks.length, 478); i++) {
      const p = landmarks[i];
      positions[i * 3] = (0.5 - p.x) * 2.2;
      positions[i * 3 + 1] = (0.5 - p.y) * 2.2;
      positions[i * 3 + 2] = -p.z * 3.2;
    }

    pointsMeshRef.current.geometry.attributes.position.needsUpdate = true;
    linesMeshRef.current.geometry.attributes.position.needsUpdate = true;

    if (groupRef.current && telemetry) {
      groupRef.current.rotation.x = THREE.MathUtils.degToRad(-telemetry.pitch * 0.4);
      groupRef.current.rotation.y = THREE.MathUtils.degToRad(telemetry.yaw * 0.5);
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(telemetry.roll * 0.4);

      // Color reacts smoothly to real expression
      let targetHex = 0x38bdf8; // Sky blue
      if (telemetry.smileType === 'GENUINE_DUCHENNE' && telemetry.smileAuthenticity > 60) {
        targetHex = 0x34d399; // Emerald green on smile
      } else if (telemetry.stressScore > 50) {
        targetHex = 0xf87171; // Soft coral on stress
      }

      (pointsMeshRef.current.material as THREE.PointsMaterial).color.setHex(targetHex);
      (linesMeshRef.current.material as THREE.LineBasicMaterial).color.setHex(targetHex);
    }
  }, [landmarks, telemetry]);

  const setCameraPreset = (angle: 'FRONT' | 'ANGLE_45' | 'SIDE') => {
    setCameraAngle(angle);
    if (!cameraRef.current) return;
    if (angle === 'FRONT') {
      cameraRef.current.position.set(0, 0, 2.5);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (angle === 'ANGLE_45') {
      cameraRef.current.position.set(1.4, 0.4, 2.0);
      cameraRef.current.lookAt(0, 0, 0);
    } else {
      cameraRef.current.position.set(2.2, 0.2, 0.5);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const toggleRenderMode = () => {
    const nextMode = renderMode === 'MESH' ? 'WIREFRAME' : renderMode === 'WIREFRAME' ? 'POINTS' : 'MESH';
    setRenderMode(nextMode);
    if (pointsMeshRef.current && linesMeshRef.current) {
      pointsMeshRef.current.visible = nextMode === 'MESH' || nextMode === 'POINTS';
      linesMeshRef.current.visible = nextMode === 'MESH' || nextMode === 'WIREFRAME';
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-2xl border border-zinc-800/80 overflow-hidden flex flex-col shadow-xl backdrop-blur-xl group hover:border-zinc-700 transition-all">
      {/* Header */}
      <div className="absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Live 3D Face Model
          </span>
          <span className="hidden sm:inline text-[11px] text-zinc-400">
            • 478 points
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-md text-xs">
          <button
            onClick={() => setCameraPreset('FRONT')}
            className={`px-2.5 py-1 rounded-lg transition-all ${cameraAngle === 'FRONT' ? 'bg-zinc-800 text-white font-semibold shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Front
          </button>
          <button
            onClick={() => setCameraPreset('ANGLE_45')}
            className={`px-2.5 py-1 rounded-lg transition-all ${cameraAngle === 'ANGLE_45' ? 'bg-zinc-800 text-white font-semibold shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            45°
          </button>
          <button
            onClick={() => setCameraPreset('SIDE')}
            className={`px-2.5 py-1 rounded-lg transition-all ${cameraAngle === 'SIDE' ? 'bg-zinc-800 text-white font-semibold shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Side
          </button>
          <button
            onClick={toggleRenderMode}
            className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center space-x-1"
            title="Switch wireframe style"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium capitalize">{renderMode.toLowerCase()}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[320px] cursor-grab active:cursor-grabbing" />

      {/* Footer Pill */}
      {telemetry && (
        <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between bg-zinc-900/90 px-4 py-2 rounded-xl border border-zinc-800/80 backdrop-blur-md text-xs text-zinc-300 shadow-lg">
          <div className="flex items-center space-x-3">
            <span>Pitch: <strong className="text-white">{telemetry.pitch}°</strong></span>
            <span>Yaw: <strong className="text-white">{telemetry.yaw}°</strong></span>
            <span>Roll: <strong className="text-white">{telemetry.roll}°</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-400">Distance:</span>
            <strong className="text-blue-400 font-semibold">{telemetry.screenDistanceCm} cm</strong>
          </div>
        </div>
      )}
    </div>
  );
};
