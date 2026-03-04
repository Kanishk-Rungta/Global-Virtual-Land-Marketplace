import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

const GRID_SIZE = 10;
const LAND_SIZE = 1.0;
const GAP = 0.1;

// Simple Box Component for each Land
const LandPlot = ({ x, z, landData, onSelect }) => {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);

  // Determine color based on status
  // Available: Green, Owned: Red, Selected: Blue
  const status = landData ? landData.status : 'available';
  const owner = landData ? landData.owner_id : null;
  
  let color = 'green';
  if (status === 'owned') color = 'red';
  if (hovered) color = 'orange';

  return (
    <group position={[x * (LAND_SIZE + GAP), 0, z * (LAND_SIZE + GAP)]}>
      <mesh
        ref={mesh}
        onClick={(e) => {
             e.stopPropagation();
             onSelect(x, z, landData);
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[LAND_SIZE, 0.2, LAND_SIZE]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Label for owner if owned */}
      {owner && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {owner.substring(0, 4)}
        </Text>
      )}
    </group>
  );
};

const LandMap = ({ lands, onSelectLand }) => {
  // Generate grid positions
  const grid = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
        // Find land data for this coordinate if it exists
        // Assuming land_id is like "land-x-z" or we map by index.
        // For simplicity, let's just map by index in array or use coordinates if available.
        // The backend didn't specify coordinate storage, but usually land_id implies position or we store x,y.
        // I will assume for this visual demo that `lands` is an array and I map by ID if possible, 
        // or just mock it.
        // Let's assume land_id = `land-${x}-${z}` for the sake of mapping.
        
        const landId = `land-${x}-${z}`;
        const landData = lands.find(l => l.land_id === landId) || { land_id: landId, status: 'available', price: 100 };
        
        grid.push(
            <LandPlot 
                key={landId} 
                x={x - GRID_SIZE / 2} 
                z={z - GRID_SIZE / 2} 
                landData={landData} 
                onSelect={onSelectLand} 
            />
        );
    }
  }

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Canvas camera={{ position: [0, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group rotation={[-Math.PI / 4, 0, 0]}> {/* Tilt slightly */}
            {grid}
        </group>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default LandMap;
