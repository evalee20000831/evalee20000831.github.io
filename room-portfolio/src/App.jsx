import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

function Scene() {
  const { scene, materials, nodes } = useGLTF('/models/room_v6.glb')

  const [tex1, tex2, tex3] = useTexture([
    '/textures/TextureSetOne.webp',
    '/textures/TextureSetTwo.webp',
    '/textures/TextureSetThree.webp',
  ])

  ;[tex1, tex2, tex3].forEach((tex) => {
    tex.flipY = false
    tex.colorSpace = THREE.SRGBColorSpace
  })

  const fish1 = scene.getObjectByName("fish1");
  const fish2 = scene.getObjectByName("fish2");
  const fish3 = scene.getObjectByName("fish3");

  scene.traverse((child) => {
    if (child.isMesh) {

      if (child.name =="TextureOne" || child.name=="fish1" || child.name=="fish2" || child.name=="fish3"){ 
        child.material = new THREE.MeshBasicMaterial({ map: tex1 })

      } else if (child.name =="TextureTwo" || child.name.includes("BézierCurve") || child.name=="fan_spin"){ 
        child.material = new THREE.MeshBasicMaterial({ map: tex2 })
      } else if (child.name =="TextureThree" || child.name.includes("Plane") || child.name=="lantern_string"){ 
        child.material = new THREE.MeshBasicMaterial({ map: tex3 })
      } else if (child.name == "coffee_ice" || child.name == "water_bottle"){ 
        Glass(child)
      } else if (child.name == "output_lightblub" || child.name == "plant_light_pipe"){ 
        Glass(child)
        child.material.thickness = 0.01
      }  else if (child.name == "fish_tank_water"){
        Water(child)
      } 
      
      if (child.material.map){ 
        child.material.map.minFilter = THREE.LinearFilter;
      }
    }
  })


  FishMovement(fish1) 
  FishMovement(fish2) 
  FishMovement(fish3) 


  return (
    <>
      <primitive object={scene} />
    </>
  )
}

function SceneMovement(){
  const controls = useRef()
  useFrame(() => {
    const target = controls.current.target
    target.x = THREE.MathUtils.clamp(target.x, 0, 2)
    target.y = THREE.MathUtils.clamp(target.y, 0, 2)
    target.z = THREE.MathUtils.clamp(target.z, 0, 2)
    controls.current.update()
  })

  return (
    <OrbitControls
      ref={controls}
      enablePan
      target={[-1.7, 0, -1.3]}
      minPolarAngle={Math.PI / 9}
      maxPolarAngle={Math.PI / 2.5}
      minDistance={1}
      maxDistance={5.5}
    />
  )
}

function Glass(child) {
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    thickness: 0.1, 
    transmission: 1,
    roughness: 0.05, 
    ior: 1.5, 
    chromaticAberration: 0.01, 
    metalness: 0, 
    clearcoat:1, 
    envMapIntensity: 1.0
  })
  child.material = glassMaterial;
}

function Water(child){
  const waterClearMaterial = new THREE.MeshPhysicalMaterial({
    color: "#aed6e9",
    transmission: 0.98,
    transparent: true,
    roughness: 0.02,
    metalness: 0,
    ior: 1.333,
    thickness: 0.01,
    attenuationColor: new THREE.Color("#73bee7"),
    attenuationDistance: 4,
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  })
  child.material = waterClearMaterial;
}


function BoundsBox({ bounds, color = "red" }) {
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const depth = bounds.maxZ - bounds.minZ;

    const center = [
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minY + bounds.maxY) / 2,
      (bounds.minZ + bounds.maxZ) / 2,
    ];

    return (
      <mesh position={center}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
    );
  }

function FishMovement(fish){

  console.log("FishMovement initialized", fish?.name);
  
  const boundingBoxes = [
      {
        minX: 0.5,
        maxX: 0.6,
        minY: 0.4,
        maxY: 0.6,
        minZ: -0.2,
        maxZ: 0.8,
      }, 
      {
        minX: -0.5,
        maxX: 0.5,
        minY: 0.4,
        maxY: 0.6,
        minZ: 0.4,
        maxZ: 0.7,
      }
  ];

  const WAYPOINT = new THREE.Vector3(0.5, 0.5, 0.55); 

  const state = useRef({ 
    target: new THREE.Vector3(), // (0,0,0) 
    path: [],
    speed: 0.4,
    wait: 0,
  })

  const temp = new THREE.Vector3()

  function randomTarget(boxIndex) {
    const bounds = boundingBoxes[boxIndex];
    
    return new THREE.Vector3(
      THREE.MathUtils.randFloat(bounds.minX, bounds.maxX),
      THREE.MathUtils.randFloat(bounds.minY, bounds.maxY),
      THREE.MathUtils.randFloat(bounds.minZ, bounds.maxZ)
    )
  }

  function chooseNextPath(fishState) {
    // 30% chance of changing boxes
    if (!fishState.initialized) {
      fishState.initialized = true;

      fishState.currentBox =
        fish.position.x > 0.5 ? 0 : 1;
    }
    let nextBox = fishState.currentBox;

    if (Math.random() < 0.3) {
      nextBox = nextBox === 0 ? 1 : 0;
    }

    const destination = randomTarget(nextBox);
    console.log(destination);

    if (nextBox === fishState.currentBox) {
      // Stay in the same box
      fishState.path = [destination];
    } else {
      // Go through the doorway first
      fishState.path = [
        WAYPOINT.clone(),
        destination,
      ];
    }

    fishState.currentBox = nextBox;
  }

  useFrame((_, delta) => {
    if (!fish) return

    if (delta > 0.1) {
        console.log(delta);
    }

    delta = Math.min(delta, 0.05); // avoid finish disappearing 

    const fishState = state.current
    
    if (fishState.wait > 0) {
      fishState.wait -= delta
      return // if the wait time remains, return and check the next Frame 
    }

    if (fishState.path.length === 0) {
      chooseNextPath(fishState);
    }

    fishState.target.copy(fishState.path[0]);

    temp.subVectors(fishState.target, fish.position)

    if (temp.length() < 0.1) {

      // Remove the current target
      fishState.path.shift();

      if (fishState.path.length === 0) {
        // Finished the route
        fishState.wait = THREE.MathUtils.randFloat(0, 2.5);
        fishState.speed = THREE.MathUtils.randFloat(0.1, 0.4);

        chooseNextPath(fishState);
      }

      fishState.target.copy(fishState.path[0]);

      return;
    }

    temp.normalize()
    fish.position.addScaledVector(temp, fishState.speed * delta)

    const targetQuat = new THREE.Quaternion();
    const dummy = new THREE.Object3D();

    dummy.position.copy(fish.position);
    dummy.lookAt(fishState.target);
    dummy.rotateY(Math.PI / 2);

    targetQuat.copy(dummy.quaternion);

    fish.quaternion.slerp(targetQuat, delta * 2); // adjust 2 for turn speed
  })
}

function Screen(nodes) {
  return (
    <>
      <mesh geometry={nodes.PC_Screen.geometry}
          position={nodes.PC_Screen.position}
          rotation={nodes.PC_Screen.rotation}>
        <meshNormalMaterial/>
      </mesh>
    </>
  )
}

function CameraLogger(){
  const {camera} = useThree()
  useFrame(()=> 
    console.log(camera.position)
  )
}


export default function App() {
  const boundingBoxes  = [
    {
      minX: 0.5,
      maxX: 0.6,
      minY: 0.4,
      maxY: 0.6,
      minZ: -0.2,
      maxZ: 0.8,
    }, 
    {
      minX: -0.5,
      maxX: 0.5,
      minY: 0.4,
      maxY: 0.6,
      minZ: 0.4,
      maxZ: 0.7,
    }

];
  
  return (
    <div style={{ width: '100vw', height: '100vh',}}>
      <Canvas camera={{ position: [2.19, 4.40, 2.37] }}>
        <ambientLight />
        <Scene />
        <SceneMovement/>
        {boundingBoxes.map((bounds, i) => (
          <BoundsBox
            key={i}
            bounds={bounds}
            color={i % 2 ? "lime" : "red"}
          />
        ))}
      </Canvas>
    </div>
  )
}