import "./App.css";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, KeyboardControls } from "@react-three/drei";
import {
  CapsuleCollider,
  useRapier,
  Physics,
  RigidBody,
  Debug,
} from "@react-three/rapier";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Character() {
  const fbx = useLoader(FBXLoader, "/character.fbx");
  fbx.position.set(0, -0.85, 0);
  fbx.rotation.set(0, 3, 0);
  return <primitive object={fbx} scale={0.01} />;
}

function Environment() {
  const gltf = useLoader(GLTFLoader, "/environment.glb");
  gltf.scene.position.set(-20, -1, 0);
  return (
    <Suspense fallback={null}>
      <primitive object={gltf.scene} />
    </Suspense>
  );
}

function App() {
  return (
    <Canvas
      style={{ height: "100vh", width: "100vw" }}
      camera={{ fov: 25, near: 0.1, far: 1000, position: [0, 4, 6] }}
    >
      <spotLight angle={3} />
      <ambientLight intensity={0.5} />
      <directionalLight color="white" position={[0, 0, 5]} />
      <Character />
      <Environment />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
