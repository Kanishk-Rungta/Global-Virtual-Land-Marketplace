import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Grid, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const GRID_SIZE = 10;
const LAND_SIZE = 1.0;
const GAP = 0.1;

// Improved LandPlot with metaverse glow and holographic effect
const LandPlot = ({ x, z, landData, onSelect, isSelected }) => {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);

  const status = landData?.status || 'available';
  const owner = landData?.owner_id;
  
  // High-fidelity Metaverse theme colors
  const theme = useMemo(() => {
    if (isSelected) return { color: '#00f2ff', emissive: '#00f2ff', emissiveIntensity: 3, opacity: 0.9 };
    if (status === 'owned') return { color: '#ff0055', emissive: '#ff0055', emissiveIntensity: 1.2, opacity: 0.7 };
    return { color: '#00ff88', emissive: '#00ff88', emissiveIntensity: 0.4, opacity: 0.5 };
  }, [status, isSelected]);

  // Smooth hover and selection animation
  useFrame((state) => {
    if (mesh.current) {
        const targetScale = hovered || isSelected ? 1.15 : 1.0;
        const targetY = (hovered || isSelected ? 0.25 : 0) + (Math.sin(state.clock.getElapsedTime() * 2 + x + z) * 0.05); // Subtle floating
        
        mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
        mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetY, 0.1);
    }
  });

  return (
    <group position={[x * (LAND_SIZE + GAP), 0, z * (LAND_SIZE + GAP)]}>
      {/* The Main Land Block */}
      <mesh
        ref={mesh}
        onClick={(e) => {
             e.stopPropagation();
             onSelect(landData.land_id, landData);
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[LAND_SIZE, 0.4, LAND_SIZE]} />
        <meshStandardMaterial 
            color={theme.color} 
            emissive={theme.emissive}
            emissiveIntensity={hovered ? theme.emissiveIntensity * 1.5 : theme.emissiveIntensity}
            transparent={true}
            opacity={theme.opacity}
            metalness={0.9}
            roughness={0.1}
        />
      </mesh>
      
      {/* Holographic floor projection when selected or hovered */}
      {(hovered || isSelected) && (
        <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[LAND_SIZE * 1.5, LAND_SIZE * 1.5]} />
            <meshBasicMaterial color={theme.color} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Owner Tag - Simple and clean */}
      {owner && (
        <Text
          position={[0, 1.0, 0]}
          fontSize={0.18}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {owner.substring(0, 6).toUpperCase()}
        </Text>
      )}
    </group>
  );
};

const LandMap = ({ lands, selectedLand, onSelectLand }) => {
  const grid = useMemo(() => {
    const items = [];
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
            const landId = `land-${x}-${z}`;
            const landData = lands.find(l => l.land_id === landId) || { land_id: landId, status: 'available', price: 100 };
            const isSelected = selectedLand?.land_id === landId;
            
            items.push(
                <LandPlot 
                    key={landId} 
                    x={x - GRID_SIZE / 2} 
                    z={z - GRID_SIZE / 2} 
                    landData={landData} 
                    onSelect={onSelectLand} 
                    isSelected={isSelected}
                />
            );
        }
    }
    return items;
  }, [lands, selectedLand, onSelectLand]);

  return (
    <div style={{ height: '100%', width: '100%', background: '#000' }}>
      <Canvas 
        camera={{ position: [10, 15, 10], fov: 35 }} 
        shadows 
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#020205']} />
        <fog attach="fog" args={['#020205', 10, 40]} />
        
        {/* Cinematic Lights */}
        <ambientLight intensity={0.1} />
        <directionalLight 
            position={[10, 20, 10]} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, 10, -10]} intensity={3} color="#ff0055" />
        <pointLight position={[10, 5, 10]} intensity={3} color="#00f2ff" />

        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1.5} />
        
        {/* Digital Grid Floor */}
        <Grid 
            renderOrder={-1} 
            position={[0, -0.21, 0]} 
            args={[30, 30]} 
            sectionColor="#1a1a2e" 
            cellColor="#30363d" 
            cellThickness={0.5} 
            sectionThickness={1.5} 
            fadeDistance={30} 
        />

        <group position={[0, 0, 0]}>
            {grid}
        </group>

        <ContactShadows 
            position={[0, -0.2, 0]} 
            opacity={0.4} 
            scale={20} 
            blur={2} 
            far={4.5} 
        />

        <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            rotateSpeed={0.5} 
            maxPolarAngle={Math.PI / 2.2} 
            minDistance={8}
            maxDistance={30}
        />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default LandMap;
