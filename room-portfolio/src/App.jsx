import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PositionalAudio, useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import Helper from './Helper.jsx'
import { Stats } from "@react-three/drei";


function Scene() {
  console.log("Scene rendered");
  const { scene, materials, nodes } = useGLTF('/models/room_v9.glb')

  const glassMaterial = useMemo(()=> 
    new THREE.MeshPhysicalMaterial({
      thickness: 0.1, 
      transmission: 1,
      roughness: 0.05, 
      ior: 1.5, 
      chromaticAberration: 0.01, 
      metalness: 0, 
      clearcoat:1, 
      envMapIntensity: 1.0
    }), []); 

  const waterClearMaterial = useMemo(()=> 
    new THREE.MeshPhysicalMaterial({
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
    }), []); 

  const {videoTexture} = useMemo(() => {
    const vid = document.createElement("video"); 
    vid.src = "/video/Blender_Animation.mp4";
    vid.loop = true; 
    vid.muted = true; 
    vid.playsInline = true; 
    vid.autoplay = true; 
    vid.play();   
    const texture = new THREE.VideoTexture(vid); 
    texture.colorSpace = THREE.SRGBColorSpace; 
    texture.flipY = false; 
    texture.center.set(0.5, 0.5); 
    texture.rotation = -Math.PI * 0.5;

    return {videoTexture: texture} 
  }, [])
  
  
  const [tex1, tex2, tex3] = useTexture([
    '/textures/TextureSetOne.webp',
    '/textures/TextureSetTwo.webp',
    '/textures/TextureSetThree.webp',
  ])

  ;[tex1, tex2, tex3].forEach((tex) => {
    tex.flipY = false
    tex.colorSpace = THREE.SRGBColorSpace
  })

  useEffect(()=>{
    scene.traverse((child) => {
      if (child.isMesh) {

        if (child.name == "fish_tank_water"){
          child.material = waterClearMaterial
        } else if (child.name =="TextureOne" || child.name.includes("fish")){ 
          child.material = new THREE.MeshBasicMaterial({ map: tex1 })  
        } else if (child.name.includes("Text_")){ 
          child.material = new THREE.MeshBasicMaterial({color: "#d33282" })
        } else if (child.name.includes("Plane_")){ // for links 
          child.visible = false; 
        } else if (child.name == "TextureTwo" || child.name.includes("BézierCurve") || child.name=="fan_spin"){ 
          child.material = new THREE.MeshBasicMaterial({ map: tex2 })
        } else if (child.name == "TextureThree" || child.name.includes("Plane") || child.name=="lantern_string"){ 
          child.material = new THREE.MeshBasicMaterial({ map: tex3 })
        } else if (child.name == "coffee_ice" || child.name == "water_bottle"){ 
          child.material = glassMaterial;
        } else if (child.name == "output_lightblub" || child.name == "plant_light_pipe"){ 
          child.material = glassMaterial;
          child.material.thickness = 0.01
        } else if (child.name == "PC_Screen"){
            child.material = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            opacity: 0.9,
          });
        } else if (child.name=="TextureTwo_Speaker"){
          child.material = new THREE.MeshBasicMaterial({ map: tex2 })
        }
        
        if (child.material.map){ 
          child.material.map.minFilter = THREE.LinearFilter;
        }
      }
    })

    Text(scene)

  }, [scene])
  

  const fish1 = scene.getObjectByName("fish1");
  const fish2 = scene.getObjectByName("fish2");
  const fish3 = scene.getObjectByName("fish3");
  const fan = scene.getObjectByName("fan_spin"); 
  const speaker = scene.getObjectByName("TextureTwo_Speaker"); 

  return (
    <>
      <primitive 
      object={scene} 
      onClick={(e) => {
        const obj = e.object; 
        if (obj.userData.clickable){ 
          console.log("clicked", e.object.name);
          window.open(obj.userData.url, "_blank"); 
        }
      }}
      />
      {speaker && (
        <SpeakerAudio object={speaker} />
      )}
      <FishMovement fish={fish1} />
      <FishMovement fish={fish2} />
      <FishMovement fish={fish3} />
      <Fan fan={fan} />

    </>
  )
}

function SpeakerAudio({ object }) {

  console.log("SpeakerAudio Plays")
  return (
    <primitive object={object}>
      <PositionalAudio
        url="/audio/citypop.mp3"
        autoplay
        loop
        distance={3}
        volume={1}
      />
    </primitive>
  );
}

function LoadingScreen({onEnter}){

  return (
    <div style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#0c132e", 
        color: "#8ba691",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Fredoka', sans-serif",
      }}>
      <h1 style={{
        fontSize: "36px",
        fontWeight: 500,
        margin: 0,
        }} 
      >Eva's Room</h1>
      
      <button onClick={onEnter} style={{
        marginTop: 20,
        padding: "12px 32px",
        fontSize: "18px",
        fontWeight: 500,
        letterSpacing: "1px",
        cursor: "pointer",
        fontFamily: "'Fredoka', sans-serif",
        color: "#4d5f67",
        background: "#f3d7ff",
        border: "3px solid #c99bdb",
        borderRadius: "18px",
        boxShadow: "0 5px 0 #8e659c",
        transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 8px 0 #8e659c";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 5px 0 #8e659c";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "translateY(3px)";
          e.currentTarget.style.boxShadow = "0 2px 0 #8e659c";
        }}
        >✦ ENTER ✦
      </button>
    </div>
  )
}

function Fan({ fan }){ 
  const spinAxis = new THREE.Vector3(0, 1, 0);
  useFrame((_, delta) =>{
    if (!fan) return
    fan.rotateOnAxis(spinAxis, delta * 8);
  })
}

function Text(scene) { 

  const textObjects = [
    {
      object: scene.getObjectByName("Plane_Github"),
      url: "https://github.com/evalee20000831",
    },
    {
      object: scene.getObjectByName("Plane_LinkedIn"),
      url: "https://www.linkedin.com/in/jung-ho-eva-lee/",
    },
    {
      object: scene.getObjectByName("Plane_Codebase"),
      url: "https://github.com/evalee20000831/evalee20000831.github.io",
    },
    {
      object: scene.getObjectByName("Plane_YouTube"),
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
    }
  ];

  textObjects.forEach(({ object, url }) => {
    if (object) {
      object.userData.url = url;
      object.userData.clickable = true;
    }
  });
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

function FishMovement({ fish }){
  console.log("FishMovement initialized", fish?.name);
  console.log(fish.geometry.attributes.position.count)
  
  const boundingBoxes = [
      {
        minX: 0.5, maxX: 0.6,
        minY: 0.4, maxY: 0.6,
        minZ: -0.2,maxZ: 0.8,
      }, 
      {
        minX: -0.5,maxX: 0.5,
        minY: 0.4, maxY: 0.6,
        minZ: 0.4, maxZ: 0.7,
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
    // console.log(destination);

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

    // if (delta > 0.1) {
    //     console.log(delta);
    // }

    delta = Math.min(delta, 0.05); // avoid fish disappearing 

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

export default function App() {
  const [entered, setEntered] = useState(false)
  return (
    <div style={{ width: '100vw', height: '100vh',}}>
      
      {!entered ? (<LoadingScreen onEnter={() => setEntered(true)}/>): (
        <Canvas camera={{ position: [2.19, 4.40, 2.37] }}>
          <Scene/>
          <SceneMovement/>
          <Helper/>
          <Stats/> 
        </Canvas>
      )}
    </div>
  )
}