

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


function CameraLogger(){
  const {camera} = useThree()
  useFrame(()=> 
    console.log(camera.position)
  )
}


export default function Helper() {

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
  return (
    <>
      {boundingBoxes.map((bounds, i) => (
        <BoundsBox
          key={i}
          bounds={bounds}
          color={i % 2 ? "lime" : "red"}
        />
      ))}
    </>
  );
}