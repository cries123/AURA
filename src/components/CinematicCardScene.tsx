import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type CinematicCardSceneProps = {
  scrollRootRef: RefObject<HTMLElement | null>;
};

gsap.registerPlugin(ScrollTrigger);

function createRoundedCardGeometry() {
  const width = 2.7;
  const height = 1.62;
  const radius = 0.16;
  const thickness = 0.08;
  const x = -width / 2;
  const y = -height / 2;

  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 12,
    bevelSize: 0.018,
    bevelThickness: 0.018,
    curveSegments: 24,
  });

  geometry.center();
  return geometry;
}

function SmartCardModel() {
  const cardGeometry = useMemo(createRoundedCardGeometry, []);
  const contactNodes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        x: -1.05 + (index % 6) * 0.14,
        y: 0.1 - Math.floor(index / 6) * 0.14,
      })),
    [],
  );

  return (
    <group>
      <mesh geometry={cardGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#090909"
          metalness={0.38}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.18}
        />
      </mesh>

      <mesh position={[-0.86, 0.34, 0.06]}>
        <boxGeometry args={[0.38, 0.28, 0.012]} />
        <meshStandardMaterial color="#c5a059" metalness={0.82} roughness={0.2} />
      </mesh>

      {contactNodes.map((node) => (
        <mesh key={`${node.x}-${node.y}`} position={[node.x, node.y, 0.068]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.026, 0.026, 0.012, 24]} />
          <meshStandardMaterial color="#f5c765" emissive="#4a2b04" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}

      <mesh position={[0, -0.56, 0.061]}>
        <boxGeometry args={[1.82, 0.018, 0.01]} />
        <meshStandardMaterial color="#c5a059" emissive="#3d2b12" roughness={0.35} />
      </mesh>

      <mesh position={[0.78, 0.46, 0.061]}>
        <boxGeometry args={[0.62, 0.018, 0.01]} />
        <meshStandardMaterial color="#f5f5f5" emissive="#1f1f1f" roughness={0.3} />
      </mesh>
    </group>
  );
}

function SignalRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ringsRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    ringsRef.current.rotation.z = elapsed * 0.08;
    ringsRef.current.children.forEach((ring, index) => {
      const pulse = 1 + Math.sin(elapsed * 1.4 + index) * 0.035;
      ring.scale.setScalar(pulse);
    });
  });

  return (
    <group ref={ringsRef} position={[0, 0, -0.04]}>
      {[1.85, 2.35, 2.85].map((radius, index) => (
        <mesh key={radius}>
          <torusGeometry args={[radius, 0.006, 12, 160]} />
          <meshBasicMaterial
            color={index === 1 ? '#f5c765' : '#c5a059'}
            transparent
            opacity={0.22 - index * 0.045}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Atmosphere() {
  const particlesRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(420 * 3);
    let seed = 18;

    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < 420; i += 1) {
      const radius = 1.1 + random() * 4.8;
      const angle = random() * Math.PI * 2;
      const drift = (random() - 0.5) * 3.4;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = drift;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1.8;
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return bufferGeometry;
  }, []);

  useFrame(({ clock }) => {
    if (!particlesRef.current) {
      return;
    }

    particlesRef.current.rotation.y = clock.getElapsedTime() * 0.025;
    particlesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.18) * 0.025;
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        color="#d7a93e"
        size={0.018}
        transparent
        opacity={0.42}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CardRig({ scrollRootRef }: CinematicCardSceneProps) {
  const cardRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const card = cardRef.current;
    const scrollRoot = scrollRootRef.current;

    if (!card || !scrollRoot) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.set(card.rotation, { x: -0.18, y: -0.35, z: 0.05 });
      gsap.set(card.scale, { x: 0.92, y: 0.92, z: 0.92 });
      gsap.set(card.position, { x: 0, y: 0, z: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: scrollRoot,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.15,
            invalidateOnRefresh: true,
          },
        })
        .to(card.rotation, { x: 0.18, y: Math.PI * 2 - 0.35, z: -0.08, ease: 'none' }, 0)
        .to(card.scale, { x: 1.42, y: 1.42, z: 1.42, ease: 'none' }, 0)
        .to(
          card.position,
          {
            x: () => (window.innerWidth < 768 ? 0.52 : 1.38),
            y: () => (window.innerWidth < 768 ? -0.24 : 0.08),
            z: 0.28,
            ease: 'none',
          },
          0,
        );

      gsap.utils
        .toArray<HTMLElement>('[data-cinematic-panel]', scrollRoot)
        .forEach((section) => {
          const copy = section.querySelector<HTMLElement>('[data-cinematic-copy]');

          if (!copy) {
            return;
          }

          gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            })
            .fromTo(
              copy,
              { autoAlpha: 0, y: 54, filter: 'blur(12px)' },
              { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.28, ease: 'power2.out' },
            )
            .to(copy, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.42 })
            .to(copy, { autoAlpha: 0, y: -42, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' });
        });
    }, scrollRoot);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [scrollRootRef]);

  return (
    <group ref={cardRef}>
      <SignalRings />
      <SmartCardModel />
    </group>
  );
}

export default function CinematicCardScene({ scrollRootRef }: CinematicCardSceneProps) {
  return (
    <Canvas
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
      camera={{ position: [0, 0, 4.6], fov: 35 }}
      gl={{ antialias: true, alpha: false }}
      shadows
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 4.8, 8.2]} />
      <ambientLight intensity={0.28} />
      <hemisphereLight args={['#f7d37a', '#050505', 0.82]} />
      <directionalLight position={[3.5, 4, 5]} intensity={2.5} castShadow />
      <pointLight position={[-2.6, -1.8, 2.5]} color="#c5a059" intensity={7.8} distance={7} />
      <pointLight position={[2.8, 1.2, 2]} color="#f5c765" intensity={3.4} distance={5.5} />
      <Atmosphere />
      <CardRig scrollRootRef={scrollRootRef} />
    </Canvas>
  );
}
