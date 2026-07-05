import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

function Scene() {
  const { scene, materials, nodes } = useGLTF('/models/room_portfolio.glb')
  // let fish1, fish2, fish3

  const [tex1, tex2, tex3] = useTexture([
    '/textures/TextureSetOne.webp',
    '/textures/TextureSetTwo.webp',
    '/textures/TextureSetThree.webp',
  ])

  ;[tex1, tex2, tex3].forEach((tex) => {
    tex.flipY = false
    tex.colorSpace = THREE.SRGBColorSpace
  })

  scene.traverse((child) => {
    if (child.isMesh) {

      if (child.name =="TextureOne" || child.name=="fish1" || child.name=="fish2" || child.name=="fish3"){ 
        child.material = new THREE.MeshBasicMaterial({ map: tex1 })
        // if (child.name=="fish1"){
        //   fish1 = child 
        //   console.log(fish1.position)
        // }
        // console.log(fish1.geometry)
        if (child.name.includes("fish")){Fish(child)}
        // if (child.name=="fish1"){FishOneMovement(child)}

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


function Fish(child){
  if (child.name=="fish1"){
    FishOneMovement(child)
  } else if (child.name=="fish2"){
    // fish2 = child 
  } else if (child.name=="fish3"){
    // fish3 = child 
  }
}

function FishOneMovement(fish1){
  console.log(fish1.position)

  const bounds = {
    minX: 0.5,
    maxX: 0.6,
    minZ: -0.35, 
    maxZ: 0.8,
    minY: 0.35,
    maxY: 0.65, 
  }

  const state = useRef({ 
    target: new THREE.Vector3(), // (0,0,0) 
    speed: 0.4,
    wait: 0,
  })

  const temp = new THREE.Vector3()

  function randomTarget() {
    return new THREE.Vector3(
      THREE.MathUtils.randFloat(bounds.minX, bounds.maxX),
      THREE.MathUtils.randFloat(bounds.minY, bounds.maxY),
      THREE.MathUtils.randFloat(bounds.minZ, bounds.maxZ)
    )
  }

  useFrame((_, delta) => {
    if (!fish1) return

    const fishState = state.current
    
    if (fishState.wait > 0) {
      fishState.wait -= delta
      return // if the wait time remains, return and check the next Frame 
    }

    if (fishState.target.lengthSq() === 0) {     
      fishState.target.copy(randomTarget())
    }

    temp.subVectors(fishState.target, fish1.position)

    if (temp.length() < 0.1) {
      fishState.wait = THREE.MathUtils.randFloat(0, 2.5)
      fishState.speed = THREE.MathUtils.randFloat(0.1, 0.4)
      fishState.target.copy(randomTarget())
      return // if the fish has not arrive yet, return and check the next Frame 
    }

    temp.normalize()
    fish1.position.addScaledVector(temp, fishState.speed * delta)

    fish1.lookAt(
      fish1.position.x + temp.z,
      fish1.position.y + temp.x,
      fish1.position.z + temp.y
    )
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
  return (
    <div style={{ width: '100vw', height: '100vh',}}>
      <Canvas camera={{ position: [2.19, 4.40, 2.37] }}>
        <ambientLight />
        <Scene />
        <SceneMovement/>
      </Canvas>
    </div>
  )
}