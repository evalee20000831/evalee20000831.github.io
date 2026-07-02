import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

function Scene() {
  const { scene, materials, nodes } = useGLTF('/models/room_portfolio.glb')


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
    if (child.isMesh && child.material.map) {
      child.material.map.minFilter = THREE.LinearFilter; 
    }
  })

  Glass(nodes)

  return (
    <>
      <mesh 
      geometry={nodes.TextureOne.geometry}
      position={nodes.TextureOne.position}
      rotation={nodes.TextureOne.rotation}
      scale={nodes.TextureOne.scale}>
        <meshBasicMaterial map={tex1} />
      </mesh>

      <mesh geometry={nodes.TextureTwo.geometry}
      position={nodes.TextureTwo.position}
      rotation={nodes.TextureTwo.rotation}
      scale={nodes.TextureTwo.scale}>
        <meshBasicMaterial map={tex2} />
      </mesh>

      <mesh geometry={nodes.TextureThree.geometry}
      position={nodes.TextureThree.position}
      rotation={nodes.TextureThree.rotation}
      scale={nodes.TextureThree.scale}>
        <meshBasicMaterial map={tex3} />
      </mesh>
    </>
  )
}

function SceneMovement(){

  const controls = useRef()

  useFrame(() => {
    const target = controls.current.target

    target.x = THREE.MathUtils.clamp(target.x, -2, 0)
    target.y = THREE.MathUtils.clamp(target.y, -2, 0)
    target.z = THREE.MathUtils.clamp(target.z, -2, 0)

    controls.current.update()
  })

  return (
    <OrbitControls
      ref={controls}
      enablePan
      target={[-1.7, 0, -1.3]}
      // onEnd={() => {
      //   console.log('Target:', controls.current.target.toArray())
      //   console.log('Camera:', controls.current.object.position.toArray())
      // }}
      minPolarAngle={Math.PI / 9}
      maxPolarAngle={Math.PI / 2.5}
      minDistance={2}
      maxDistance={7.5}
    />
  )
}

function Glass(nodes) {

  // console.log(nodes)

  return (
    <mesh geometry={nodes.output_lightblub.geometry}>
      <MeshTransmissionMaterial
        thickness={0.2}
        transmission={1}
        roughness={0}
        ior={1.5}
        chromaticAberration={0.01}
      />
  </mesh>    
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
        {/* <Glass /> */}
        <SceneMovement/>
        {/* <CameraLogger/> */}
      </Canvas>
    </div>
  )
}