import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type CinematicCardSceneProps = {
  pinContainerRef: RefObject<HTMLElement | null>;
  sectionCount: number;
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

function CardRig({ pinContainerRef, sectionCount }: CinematicCardSceneProps) {
  const cardRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const card = cardRef.current;
    const pinContainer = pinContainerRef.current;

    if (!card || !pinContainer) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-cinematic-panel]', pinContainer);
      const copies = panels
        .map((section) => section.querySelector<HTMLElement>('[data-cinematic-copy]'))
        .filter((copy): copy is HTMLElement => Boolean(copy));
      const totalSections = Math.max(sectionCount, panels.length, 1);
      const totalTransitions = Math.max(totalSections - 1, 1);
      const scrollDistancePerPanel = 0.58;
      const snapPoints = Array.from(
        { length: totalSections },
        (_, index) => index / totalTransitions,
      );
      const dots = gsap.utils.toArray<HTMLElement>('[data-cinematic-dot]');
      const currentIndex = document.querySelector<HTMLElement>('[data-cinematic-index]');
      const currentTitle = document.querySelector<HTMLElement>('[data-cinematic-title]');
      const setActiveChapter = (activeIndex: number) => {
        const safeIndex = gsap.utils.clamp(0, totalSections - 1, activeIndex);

        dots.forEach((dot, dotIndex) => {
          const isActive = dotIndex === safeIndex;
          dot.style.opacity = isActive ? '1' : '0.35';
          dot.style.backgroundColor = isActive ? '#c5a059' : 'transparent';
          dot.style.transform = isActive ? 'scale(1.65)' : 'scale(1)';
          dot.style.boxShadow = isActive ? '0 0 18px rgba(197,160,89,0.8)' : 'none';
        });

        if (currentIndex) {
          currentIndex.textContent = String(safeIndex + 1).padStart(2, '0');
        }

        if (currentTitle) {
          currentTitle.textContent = panels[safeIndex]?.dataset.cinematicLabel ?? '';
        }
      };
      const responsiveX = (desktopValue: number, mobileValue: number) =>
        window.innerWidth < 768 ? mobileValue : desktopValue;
      const cardStates = [
        {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: -0.18, y: -0.35, z: 0.05 },
          scale: 0.92,
        },
        {
          position: { x: () => responsiveX(-0.68, -0.1), y: () => responsiveX(0.06, -0.16), z: 0.16 },
          rotation: { x: 0.26, y: Math.PI * 0.72, z: -0.08 },
          scale: 1.08,
        },
        {
          position: { x: () => responsiveX(1.24, 0.34), y: () => responsiveX(0.02, -0.24), z: 0.28 },
          rotation: { x: -0.08, y: Math.PI * 1.42, z: 0.09 },
          scale: 1.28,
        },
        {
          position: { x: () => responsiveX(1.48, 0.5), y: () => responsiveX(0.1, -0.28), z: 0.34 },
          rotation: { x: 0.2, y: Math.PI * 2 - 0.35, z: -0.08 },
          scale: 1.42,
        },
      ];

      gsap.set(panels, { autoAlpha: 0 });
      gsap.set(copies, { autoAlpha: 0, y: 54, filter: 'blur(12px)' });
      gsap.set(panels[0], { autoAlpha: 1 });
      gsap.set(copies[0], { autoAlpha: 1, y: 0, filter: 'blur(0px)' });
      gsap.set(card.position, cardStates[0].position);
      gsap.set(card.rotation, cardStates[0].rotation);
      gsap.set(card.scale, { x: cardStates[0].scale, y: cardStates[0].scale, z: cardStates[0].scale });
      setActiveChapter(0);

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pinContainer,
          start: 'top top',
          end: () => `+=${totalTransitions * window.innerHeight * scrollDistancePerPanel}`,
          pin: true,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActiveChapter(Math.round(self.progress * totalTransitions));
          },
          snap: {
            snapTo: snapPoints,
            duration: { min: 0.2, max: 0.45 },
            delay: 0.02,
            ease: 'power3.inOut',
          },
        },
      });

      for (let index = 1; index < totalSections; index += 1) {
        const previousPanel = panels[index - 1];
        const currentPanel = panels[index];
        const previousCopy = copies[index - 1];
        const currentCopy = copies[index];
        const cardState = cardStates[index] ?? cardStates[cardStates.length - 1];
        const transitionStart = index - 1;

        timeline
          .to(card.rotation, cardState.rotation, transitionStart)
          .to(
            card.position,
            {
              x: cardState.position.x,
              y: cardState.position.y,
              z: cardState.position.z,
            },
            transitionStart,
          )
          .to(
            card.scale,
            { x: cardState.scale, y: cardState.scale, z: cardState.scale },
            transitionStart,
          );

        if (previousPanel && currentPanel) {
          timeline
            .to(previousPanel, { autoAlpha: 0, duration: 0.18 }, transitionStart + 0.42)
            .to(currentPanel, { autoAlpha: 1, duration: 0.18 }, transitionStart + 0.42);
        }

        if (previousCopy && currentCopy) {
          timeline
            .to(
              previousCopy,
              { autoAlpha: 0, y: -46, filter: 'blur(12px)', duration: 0.28, ease: 'power2.in' },
              transitionStart + 0.22,
            )
            .fromTo(
              currentCopy,
              { autoAlpha: 0, y: 56, filter: 'blur(12px)' },
              { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.34, ease: 'power2.out' },
              transitionStart + 0.52,
            );
        }
      }
    }, pinContainer);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [pinContainerRef, sectionCount]);

  return (
    <group ref={cardRef}>
      <SignalRings />
      <SmartCardModel />
    </group>
  );
}

export default function CinematicCardScene({
  pinContainerRef,
  sectionCount,
}: CinematicCardSceneProps) {
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
      <CardRig pinContainerRef={pinContainerRef} sectionCount={sectionCount} />
    </Canvas>
  );
}
