import { Suspense, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Sky } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// ── Hotspot data (illustrative — not verified campus geometry) ────────────────
const HOTSPOTS = [
  { id: "main",     label: "Main Academic Block",  pos: [0, 0, 0]    as [number,number,number], color: "#00d4ff", icon: "🏛️",
    info: "Central academic building housing administrative offices and lecture halls." },
  { id: "library",  label: "Central Library",       pos: [-6, 0, -4]  as [number,number,number], color: "#3b82f6", icon: "📚",
    info: "The university library with digital resources, reading halls, and research facilities." },
  { id: "hostel",   label: "Hostel Complex",         pos: [7, 0, -5]   as [number,number,number], color: "#7c3aed", icon: "🏠",
    info: "Residential blocks providing accommodation for students." },
  { id: "canteen",  label: "Canteen & Mess",         pos: [-5, 0, 4]   as [number,number,number], color: "#f59e0b", icon: "🍽️",
    info: "Campus dining facility serving meals and refreshments." },
  { id: "labs",     label: "Science & Tech Labs",    pos: [5, 0, 4]    as [number,number,number], color: "#10b981", icon: "🔬",
    info: "Laboratories for engineering, science, and computer science programs." },
  { id: "sports",   label: "Sports Complex",         pos: [0, 0, 8]    as [number,number,number], color: "#ef4444", icon: "⚽",
    info: "Sports grounds, courts, and fitness facilities for students." },
];

// ── Building component ────────────────────────────────────────────────────────
function Building({
  position, size, color, emissive = "#000000", onClick,
}: {
  position: [number,number,number]; size: [number,number,number];
  color: string; emissive?: string; onClick?: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.y = position[1];
  });
  return (
    <mesh ref={ref} position={position} onClick={onClick} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0}
        roughness={0.4} metalness={0.1}
      />
    </mesh>
  );
}

// ── Tree ─────────────────────────────────────────────────────────────────────
function Tree({ position }: { position: [number,number,number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1.2, 6]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[0.7, 1.6, 7]} />
        <meshStandardMaterial color="#1a5c2a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <coneGeometry args={[0.5, 1.2, 7]} />
        <meshStandardMaterial color="#1e6b30" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── Path ─────────────────────────────────────────────────────────────────────
function Path({ from, to }: { from: [number,number,number]; to: [number,number,number] }) {
  const mid: [number,number,number] = [(from[0]+to[0])/2, 0.01, (from[2]+to[2])/2];
  const dx = to[0]-from[0], dz = to[2]-from[2];
  const len = Math.sqrt(dx*dx+dz*dz);
  const angle = Math.atan2(dx, dz);
  return (
    <mesh position={mid} rotation={[0, angle, 0]} receiveShadow>
      <boxGeometry args={[0.6, 0.02, len]} />
      <meshStandardMaterial color="#c8b89a" roughness={0.9} />
    </mesh>
  );
}

// ── Hotspot marker ────────────────────────────────────────────────────────────
function HotspotMarker({
  hotspot, selected, onClick,
}: {
  hotspot: typeof HOTSPOTS[0]; selected: boolean; onClick: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = hotspot.pos[1] + 3.5 + Math.sin(clock.elapsedTime * 2 + hotspot.pos[0]) * 0.15;
    }
  });
  return (
    <group>
      {/* Vertical beam */}
      <mesh position={[hotspot.pos[0], hotspot.pos[1] + 1.5, hotspot.pos[2]]}>
        <cylinderGeometry args={[0.03, 0.03, 3, 6]} />
        <meshStandardMaterial color={hotspot.color} emissive={hotspot.color} emissiveIntensity={0.5} />
      </mesh>
      {/* Floating orb */}
      <mesh ref={ref} position={[hotspot.pos[0], hotspot.pos[1] + 3.5, hotspot.pos[2]]}
            onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[selected ? 0.35 : 0.28, 16, 16]} />
        <meshStandardMaterial color={hotspot.color} emissive={hotspot.color}
          emissiveIntensity={selected ? 0.8 : 0.4} roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Label */}
      <Text position={[hotspot.pos[0], hotspot.pos[1] + 4.3, hotspot.pos[2]]}
            fontSize={0.35} color={hotspot.color} anchorX="center" anchorY="middle"
            outlineWidth={0.02} outlineColor="#0a0e1a">
        {hotspot.icon} {hotspot.label}
      </Text>
    </group>
  );
}

// ── Ground ────────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1a2e1a" roughness={0.9} />
      </mesh>
      {/* Lawn patches */}
      {[[-3,0,-1],[-3,0,6],[3,0,6],[0,0,-7]].map(([x,,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x as number,0,z as number]} receiveShadow>
          <planeGeometry args={[4,3]} />
          <meshStandardMaterial color="#2d5a1b" roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

// ── Main campus scene ─────────────────────────────────────────────────────────
function CampusScene({ onSelect }: { onSelect: (h: typeof HOTSPOTS[0] | null) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClick = useCallback((h: typeof HOTSPOTS[0]) => {
    setSelected(h.id);
    onSelect(h);
  }, [onSelect]);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={0.5} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[15, 20, 10]} intensity={1.2} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={80}
        shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30} />
      <pointLight position={[-10, 8, -10]} intensity={0.3} color="#3b82f6" />

      <Ground />

      {/* Paths */}
      <Path from={[0,0,0]} to={[-6,0,-4]} />
      <Path from={[0,0,0]} to={[7,0,-5]} />
      <Path from={[0,0,0]} to={[-5,0,4]} />
      <Path from={[0,0,0]} to={[5,0,4]} />
      <Path from={[0,0,0]} to={[0,0,8]} />

      {/* Main Academic Block */}
      <group>
        <Building position={[0,1.5,0]} size={[5,3,4]} color="#1e3a5f"
          onClick={() => handleClick(HOTSPOTS[0])} />
        <Building position={[0,3.2,0]} size={[4.5,0.4,3.5]} color="#2a4a7f" />
        {/* Columns */}
        {[-1.5,0,1.5].map((x,i) => (
          <Building key={i} position={[x,0.8,-2.1]} size={[0.25,1.6,0.25]} color="#c8b89a" />
        ))}
        {/* Entrance steps */}
        <Building position={[0,0.1,-2.5]} size={[3,0.2,0.8]} color="#a09070" />
        <Building position={[0,0.25,-2.2]} size={[2.5,0.2,0.5]} color="#a09070" />
        {/* Sign */}
        <Text position={[0,3.8,0]} fontSize={0.3} color="#00d4ff" anchorX="center">
          KALINGA UNIVERSITY
        </Text>
      </group>

      {/* Library */}
      <group>
        <Building position={[-6,1.2,-4]} size={[4,2.4,3.5]} color="#1a2e4a"
          onClick={() => handleClick(HOTSPOTS[1])} />
        <Building position={[-6,2.5,-4]} size={[3.8,0.3,3.3]} color="#243d5e" />
        <Building position={[-6,1.2,-5.8]} size={[1.5,2.4,0.3]} color="#1a2e4a" />
      </group>

      {/* Hostel */}
      <group>
        <Building position={[7,1.8,-5]} size={[3.5,3.6,3]} color="#2a1a4a"
          onClick={() => handleClick(HOTSPOTS[2])} />
        <Building position={[7,3.7,-5]} size={[3.3,0.3,2.8]} color="#3a2a5e" />
        {/* Windows */}
        {[-0.8,0.8].map((x,i) => [1,2].map((y,j) => (
          <Building key={`${i}${j}`} position={[7+x,y,-3.45]} size={[0.5,0.5,0.05]} color="#ffd700" emissive="#ffd700" />
        )))}
      </group>

      {/* Canteen */}
      <group>
        <Building position={[-5,0.9,4]} size={[4,1.8,3]} color="#3a2a0a"
          onClick={() => handleClick(HOTSPOTS[3])} />
        <Building position={[-5,1.9,4]} size={[4.5,0.2,3.5]} color="#5a3a0a" />
      </group>

      {/* Labs */}
      <group>
        <Building position={[5,1.2,4]} size={[4,2.4,3]} color="#0a2a1a"
          onClick={() => handleClick(HOTSPOTS[4])} />
        <Building position={[5,2.5,4]} size={[3.8,0.3,2.8]} color="#0a3a2a" />
        {/* Antenna */}
        <Building position={[5,3.2,4]} size={[0.08,1.2,0.08]} color="#888" />
      </group>

      {/* Sports */}
      <group>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,8]} receiveShadow>
          <planeGeometry args={[8,5]} />
          <meshStandardMaterial color="#2a5a0a" roughness={0.95} />
        </mesh>
        {/* Goal posts */}
        {[-1,1].map((x,i) => (
          <group key={i}>
            <Building position={[x*3.5,0.6,8]} size={[0.1,1.2,0.1]} color="#ffffff" />
            <Building position={[x*3.5,1.3,8]} size={[2,0.1,0.1]} color="#ffffff" />
          </group>
        ))}
      </group>

      {/* Trees */}
      {[[-2,0,-6],[2,0,-6],[-8,0,0],[8,0,0],[-8,0,-8],[8,0,-8],
        [-3,0,2],[3,0,2],[-1,0,6],[1,0,6],[-7,0,6],[7,0,6]].map(([x,,z],i) => (
        <Tree key={i} position={[x as number, 0, z as number]} />
      ))}

      {/* Hotspot markers */}
      {HOTSPOTS.map(h => (
        <HotspotMarker key={h.id} hotspot={h} selected={selected===h.id}
          onClick={() => handleClick(h)} />
      ))}

      {/* Campus boundary fence */}
      {[[-14,0,0],[14,0,0],[0,0,-14],[0,0,14]].map(([x,,z],i) => (
        <Building key={i} position={[x as number,0.3,z as number]}
          size={x!==0 ? [0.15,0.6,28] : [28,0.6,0.15]} color="#334155" />
      ))}

      {/* Entrance gate */}
      <group position={[0,0,14]}>
        <Building position={[-2,1,0]} size={[0.4,2,0.4]} color="#c8b89a" />
        <Building position={[2,1,0]} size={[0.4,2,0.4]} color="#c8b89a" />
        <Building position={[0,2.1,0]} size={[4.5,0.3,0.4]} color="#c8b89a" />
        <Text position={[0,2.5,0]} fontSize={0.4} color="#00d4ff" anchorX="center">
          CAMPUS ENTRANCE
        </Text>
      </group>
    </>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function CampusExplorer({ compact = false }: { compact?: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [selected, setSelected] = useState<typeof HOTSPOTS[0] | null>(null);
  const [webglError, setWebglError] = useState(false);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (webglError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-navy-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <p className="text-slate-300 mb-4">3D view unavailable (WebGL not supported)</p>
        <a href="https://virtualtour.kalingauniversity.ac.in/" target="_blank" rel="noopener noreferrer"
           className="btn-primary">Launch Official 360° Tour ↗</a>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${compact ? "h-[400px]" : "h-[600px]"} rounded-2xl overflow-hidden`}
         style={{ background: "linear-gradient(180deg, #0a1628 0%, #0a0e1a 100%)" }}>

      {/* Info panel */}
      {selected && (
        <div className="absolute top-4 left-4 z-10 glass rounded-xl p-4 max-w-xs animate-fade-in-up">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-lg">{selected.icon}</div>
              <div className="font-bold text-cyan-400 text-sm mt-1">{selected.label}</div>
              <div className="text-slate-400 text-xs mt-1 leading-relaxed">{selected.info}</div>
              <div className="text-slate-500 text-xs mt-2 italic">Illustrative model — not verified campus geometry</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={resetCamera} className="glass rounded-lg px-3 py-2 text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors">
          ⟳ Reset
        </button>
        <a href="https://virtualtour.kalingauniversity.ac.in/" target="_blank" rel="noopener noreferrer"
           className="glass rounded-lg px-3 py-2 text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors text-center">
          🎥 360° Tour
        </a>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass rounded-xl p-3">
        <div className="text-xs text-slate-500 mb-2">Click a marker to explore</div>
        <div className="flex flex-wrap gap-2">
          {HOTSPOTS.map(h => (
            <button key={h.id} onClick={() => setSelected(h)}
                    className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: h.color, border: `1px solid ${h.color}33` }}>
              {h.icon} {h.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <Canvas shadows camera={{ position: [18, 14, 22], fov: 45 }}
              onCreated={({ gl }) => {
                if (!gl.capabilities.isWebGL2 && !gl) setWebglError(true);
              }}>
        <Suspense fallback={null}>
          <CampusScene onSelect={setSelected} />
          <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05}
            minDistance={8} maxDistance={45} maxPolarAngle={Math.PI / 2.1}
            target={[0, 1, 0]} />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-navy">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-cyan-400 text-sm">Loading 3D Campus…</div>
          </div>
        </div>
      }><></></Suspense>
    </div>
  );
}
