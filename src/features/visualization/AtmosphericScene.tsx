import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import { BufferGeometry, Float32BufferAttribute, type Group } from 'three';

function Starlight() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(720 * 3);

    for (let index = 0; index < 720; index += 1) {
      const vertical = 1 - (index / 719) * 2;
      const radius = Math.sqrt(1 - vertical * vertical);
      const angle = Math.PI * (3 - Math.sqrt(5)) * index;
      const distance = 4.8 + ((index * 17) % 31) / 10;

      positions[index * 3] = Math.cos(angle) * radius * distance;
      positions[index * 3 + 1] = vertical * distance;
      positions[index * 3 + 2] = Math.sin(angle) * radius * distance;
    }

    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute(
      'position',
      new Float32BufferAttribute(positions, 3),
    );
    return starGeometry;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#EDE8DE"
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

function LuminousComposition() {
  const composition = useRef<Group>(null);
  const shouldReduceMotion = useReducedMotion();

  useFrame(({ clock }, delta) => {
    if (!composition.current || shouldReduceMotion) {
      return;
    }

    composition.current.rotation.y += delta * 0.045;
    composition.current.rotation.x = Math.sin(clock.elapsedTime * 0.12) * 0.045;
  });

  return (
    <group ref={composition} rotation={[0.2, 0, -0.12]}>
      <mesh>
        <icosahedronGeometry args={[1.06, 3]} />
        <meshStandardMaterial
          color="#344C50"
          roughness={0.48}
          metalness={0.4}
          emissive="#17272B"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh rotation={[0.7, 0.2, 0.45]} scale={[1.55, 1.55, 1.55]}>
        <torusGeometry args={[1.2, 0.006, 8, 180]} />
        <meshBasicMaterial
          color="#D6BD91"
          transparent
          opacity={0.76}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[1.2, 0.5, -0.2]} scale={[1.8, 1.8, 1.8]}>
        <torusGeometry args={[1.1, 0.003, 8, 180]} />
        <meshBasicMaterial
          color="#EDE8DE"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.78, 0.72, 0.7]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#EDE8DE" />
      </mesh>
      <mesh position={[-0.96, -0.48, 0.62]}>
        <sphereGeometry args={[0.026, 12, 12]} />
        <meshBasicMaterial color="#D6BD91" />
      </mesh>
    </group>
  );
}

export default function AtmosphericScene() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 5.5], fov: 42 }}
      dpr={[1, 1.5]}
      frameloop={shouldReduceMotion ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={1.8} />
      <pointLight color="#D6BD91" intensity={20} position={[3, 2, 4]} />
      <pointLight color="#344C50" intensity={16} position={[-3, -2, 2]} />
      <Starlight />
      <LuminousComposition />
    </Canvas>
  );
}
