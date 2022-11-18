import "./App.css";
import { useRef, useMemo, Suspense, useEffect } from "react";
import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  KeyboardControls,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import {
  CapsuleCollider,
  Physics,
  RigidBody,
  Debug,
} from "@react-three/rapier";
import { useCylinder } from "@react-three/cannon";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useInput } from "./useInput";

let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0, 1, 0);
let rotateQuarternion = new THREE.Quaternion();
let cameraTarget = new THREE.Vector3();

const directionOffset = ({ forward, backward, left, right }) => {
  var directionOffset = 0;
  if (forward) {
    if (left) {
      directionOffset = Math.PI / 4;
    } else if (right) {
      directionOffset = -Math.PI / 4;
    }
  } else if (backward) {
    if (left) {
      directionOffset = Math.PI / 4 + Math.PI / 2;
    } else if (right) {
      directionOffset = -Math.PI / 4 - Math.PI / 2;
    } else {
      directionOffset = Math.PI;
    } // s
  } else if (left) {
    directionOffset = Math.PI / 2;
  } else if (right) {
    directionOffset = -Math.PI / 2;
  } //d
  return directionOffset;
};

function Character() {
  const model = useGLTF("/soldier.glb");
  const { actions } = useAnimations(model.animations, model.scene);
  const currentAction = useRef();
  const camera = useThree((state) => state.camera);
  const controlsRef = useRef();
  const { backward, forward, right, left, shift, jump } = useInput();

  const updateCameraTarget = (moveX, moveZ) => {
    // move camera
    camera.position.x += moveX;
    camera.position.z += moveZ;
    // update camera target.
    cameraTarget.x = model.scene.position.x;
    cameraTarget.y = model.scene.position.y + 2;
    cameraTarget.z = model.scene.position.z;
    if (controlsRef.current) controlsRef.current.target = cameraTarget;
  };

  useEffect(() => {
    let action = "";

    if (forward || backward || left || right) {
      action = "Walk";
      if (shift) {
        action = "Run";
      }
    } else {
      action = "Idle";
    }

    if (currentAction.current != action) {
      const nextActionToPlay = actions[action];
      const current = actions[currentAction.current];
      current?.fadeOut(0.2);
      nextActionToPlay?.reset().fadeIn(0.2).play();
      currentAction.current = action;
    }
  }, [forward, backward, left, right, shift, jump]);

  useFrame((state, delta) => {
    if (currentAction.current == "Walk" || currentAction.current == "Run") {
      let angleYCameraDirection = Math.atan2(
        camera.position.x - model.scene.position.x,
        camera.position.z - model.scene.position.z
      );

      let newDirectionOffset = directionOffset({
        forward,
        backward,
        left,
        right,
      });

      rotateQuarternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + newDirectionOffset
      );

      model.scene.quaternion.rotateTowards(rotateQuarternion, 0.2);

      camera.getWorldDirection(walkDirection);
      walkDirection.y = 0;
      walkDirection.normalize();
      walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset);

      const velocity = currentAction.current == "Run" ? 10 : 5;

      const moveX = walkDirection.x * velocity * delta;
      const moveZ = walkDirection.z * velocity * delta;
      model.scene.position.x += moveX;
      model.scene.position.z += moveZ;

      updateCameraTarget(moveX, moveZ);
    }
  });

  return (
    <>
      <OrbitControls ref={controlsRef} />
      <RigidBody
        restitution={0}
        friction={0}
        type="fixed"
        colliders="hull"
        mass={1}
        position={[0, 0, 0]}
      >
        <primitive position={[0, 0, 0]} object={model.scene} />
      </RigidBody>
    </>
  );
}

function Environment() {
  const gltf = useLoader(GLTFLoader, "/environment.glb");

  return (
    <Suspense fallback={null}>
      <RigidBody restitution={0} friction={0} type="fixed" colliders="hull">
        <primitive object={gltf.scene} />
      </RigidBody>
    </Suspense>
  );
}

function App() {
  return (
    <Canvas style={{ height: "100vh", width: "100vw" }}>
      <Suspense fallback={null}>
        <Physics>
          {/* <Debug /> */}
          <spotLight angle={15} />
          <ambientLight intensity={0.5} />
          <directionalLight color="white" position={[0, 0, 5]} />
          <Character />
          <Environment />
        </Physics>
      </Suspense>
    </Canvas>
  );
}

export default App;
