import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { BOWL_POS, LAUZA_DESK_POS, isNearLauza } from '../../lib/catPhysics';

const SKIN = '#f1c9a8';
const HAIR = '#17171c';
const JACKET = '#1b1d24';
const SHIRT = '#f4f4f5';
const PANTS = '#232630';
const ACCENT = '#ff7a30';
const CHAIR_DARK = '#1c1e26';
const CHAIR_TRIM = '#2c2f3b';

const DESK_PANIC_LINES = [
    'WOY OYEN JANGAN INJEK KEYBOARD!!',
    'CTRL+Z! CTRL+Z!! timeline-ku!!',
    'turun dulu yen, baru kasih makan!',
];

const ALREADY_FULL_LINES = [
    'mangkoknya masih penuh tuh yen!',
    'makan dulu tuh di mangkok, bos!',
];

const KIBBLE_INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

function smoothstep(t) {
    const c = Math.max(0, Math.min(1, t));
    return c * c * (3 - 2 * c);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

export default function LauzaDeskCharacter({ stateRef, onRequestFeed }) {
    const chairUpperRef = useRef();
    const personRootRef = useRef();
    const hipsRef = useRef();
    const torsoRef = useRef();
    const headRef = useRef();
    const leftThighRef = useRef();
    const rightThighRef = useRef();
    const leftShinRef = useRef();
    const rightShinRef = useRef();
    const leftShoulderRef = useRef();
    const rightShoulderRef = useRef();
    const leftElbowRef = useRef();
    const rightElbowRef = useRef();
    const foodBagRef = useRef();
    const kibbleRefs = useRef([]);
    const bowlMoundRef = useRef();
    const bowlRingRef = useRef();

    const lastPhase = useRef('idle');
    const lastMeowSeen = useRef(0);
    const lastDeskPanic = useRef(0);
    const panicTimer = useRef(0);
    const bubbleTimer = useRef(0);
    const [speech, setSpeech] = useState(null);
    const [showFeedHint, setShowFeedHint] = useState(false);

    // Keyframe waypoints in world space for Lauza's stand-up -> walk -> pour -> return sequence
    const seatX = LAUZA_DESK_POS.x;
    const seatZ = LAUZA_DESK_POS.z + 0.16;
    const standX = 5.1;
    const standZ = -9.05;
    const bowlStandX = BOWL_POS.x + 0.84;
    const bowlStandZ = BOWL_POS.z + 0.08;

    useFrame((clockState, dt) => {
        const t = clockState.clock.elapsedTime;
        const { cat, feeding } = stateRef.current;

        const dx = cat.x - seatX;
        const dz = cat.z - seatZ;
        const dist = Math.hypot(dx, dz);
        const catNear = dist < 3.8;
        const catCloseForFeed = isNearLauza(cat.x, cat.z) && feeding.phase === 'idle' && feeding.bowlFull < 0.85;
        setShowFeedHint((prev) => (prev === catCloseForFeed ? prev : catCloseForFeed));
        const catOnDesk = cat.y > 0.92 && cat.x > 1.4 && cat.x < 9.3 && cat.z < -10.1 && cat.z > -11.7;

        // Dialogue reactions on phase transitions, desk jumping, or meowing when bowl is already full
        if (feeding.phase !== lastPhase.current) {
            if (feeding.phase === 'standup') {
                bubbleTimer.current = 2.0;
                setSpeech('iya iya bos, bentar ku kasih makan…');
            } else if (feeding.phase === 'pour') {
                bubbleTimer.current = 2.1;
                setSpeech('nih makanannya bos, selamat makan!');
            } else if (feeding.phase === 'sit') {
                bubbleTimer.current = 1.6;
                setSpeech('lanjut render lagi deh…');
            }
            lastPhase.current = feeding.phase;
        } else if (feeding.phase === 'idle') {
            if (catOnDesk && t - lastDeskPanic.current > 4.0) {
                lastDeskPanic.current = t;
                panicTimer.current = 2.2;
                bubbleTimer.current = 2.6;
                setSpeech(DESK_PANIC_LINES[Math.floor(Math.random() * DESK_PANIC_LINES.length)]);
            } else if (cat.meowTimer > 0.92 && dist < 5.2 && feeding.bowlFull >= 0.2 && t - lastMeowSeen.current > 2.2) {
                lastMeowSeen.current = t;
                panicTimer.current = 1.4;
                bubbleTimer.current = 2.2;
                setSpeech(ALREADY_FULL_LINES[Math.floor(Math.random() * ALREADY_FULL_LINES.length)]);
            }
        }

        if (panicTimer.current > 0) panicTimer.current = Math.max(0, panicTimer.current - dt);
        if (bubbleTimer.current > 0) {
            bubbleTimer.current -= dt;
            if (bubbleTimer.current <= 0) setSpeech(null);
        }

        const isFeeding = feeding.phase !== 'idle';
        const panicked = !isFeeding && panicTimer.current > 0;
        const blend = 1 - Math.exp(-9 * Math.min(dt, 0.05));

        // ===== COMPUTE LAUZA POSE & WORLD POSITION =====
        let px = seatX;
        let py = 0;
        let pz = seatZ;
        let yaw = Math.PI; // Facing -Z (monitors)
        let sitAmt = 1;    // 1 = seated in chair, 0 = standing upright
        let walkSwing = 0;
        let crouchPitch = 0;
        let showBag = false;
        let pourTilt = 0;

        if (feeding.phase === 'standup') {
            const p = smoothstep(feeding.t / 0.65);
            px = lerp(seatX, standX, p);
            pz = lerp(seatZ, standZ, p);
            yaw = lerp(Math.PI, -Math.PI * 0.55, p);
            sitAmt = 1 - p;
            showBag = p > 0.35;
        } else if (feeding.phase === 'to_bowl') {
            const p = smoothstep(feeding.t / 1.15);
            px = lerp(standX, bowlStandX, p);
            pz = lerp(standZ, bowlStandZ, p);
            yaw = -Math.PI * 0.52; // Facing -X toward bowl
            sitAmt = 0;
            walkSwing = Math.sin(t * 11) * 0.55;
            py = Math.abs(Math.sin(t * 11)) * 0.04;
            showBag = true;
        } else if (feeding.phase === 'pour') {
            const p = Math.min(1, feeding.t / 1.45);
            const bendIn = smoothstep(Math.min(1, feeding.t / 0.35));
            const bendOut = p > 0.78 ? smoothstep((p - 0.78) / 0.22) : 0;
            const bend = bendIn * (1 - bendOut);
            px = bowlStandX;
            pz = bowlStandZ;
            yaw = -Math.PI * 0.52;
            sitAmt = 0;
            py = 0;
            crouchPitch = bend * 0.55;
            pourTilt = bend;
            showBag = true;
        } else if (feeding.phase === 'return') {
            const p = smoothstep(feeding.t / 1.15);
            px = lerp(bowlStandX, standX, p);
            pz = lerp(bowlStandZ, standZ, p);
            yaw = Math.PI * 0.48; // Facing +X back toward chair
            sitAmt = 0;
            walkSwing = Math.sin(t * 11) * 0.55;
            py = Math.abs(Math.sin(t * 11)) * 0.04;
            showBag = p < 0.75;
        } else if (feeding.phase === 'sit') {
            const p = smoothstep(feeding.t / 0.65);
            px = lerp(standX, seatX, p);
            pz = lerp(standZ, seatZ, p);
            yaw = lerp(Math.PI * 0.65, Math.PI, p);
            sitAmt = p;
            showBag = false;
        }

        // Swivel chair responds smoothly (turns slightly aside while Lauza walks away!)
        const lookAtCatYaw = Math.max(-0.9, Math.min(0.9, dx < 0 ? 0.68 : -0.68));
        const targetChairY = isFeeding
            ? -0.45
            : (panicked ? lookAtCatYaw * 0.32 : (catNear ? lookAtCatYaw * 0.14 : Math.sin(t * 0.35) * 0.04));

        if (chairUpperRef.current) {
            chairUpperRef.current.rotation.y += (targetChairY - chairUpperRef.current.rotation.y) * blend;
        }

        // Apply Lauza root position & yaw (stays aligned with chair swivel while idle!)
        if (personRootRef.current) {
            personRootRef.current.position.set(px, py, pz);
            personRootRef.current.rotation.y = isFeeding ? yaw : (Math.PI + (chairUpperRef.current?.rotation.y || 0));
        }

        // Leg posture: seated knees bent vs standing straight + natural knee crouch during pour!
        const hipSeated = -Math.PI / 2;
        const kneeSeated = Math.PI / 2;
        const hipCrouch = -pourTilt * 0.42;
        const kneeCrouch = pourTilt * 0.78;
        if (leftThighRef.current) leftThighRef.current.rotation.x = lerp(walkSwing + hipCrouch, hipSeated, sitAmt);
        if (rightThighRef.current) rightThighRef.current.rotation.x = lerp(-walkSwing + hipCrouch, hipSeated, sitAmt);
        if (leftShinRef.current) leftShinRef.current.rotation.x = lerp(Math.max(0, -walkSwing * 0.5) + kneeCrouch, kneeSeated, sitAmt);
        if (rightShinRef.current) rightShinRef.current.rotation.x = lerp(Math.max(0, walkSwing * 0.5) + kneeCrouch, kneeSeated, sitAmt);

        // Hips & torso height lifts smoothly when standing up from chair (torso bends at waist without tilting legs!)
        const hipY = lerp(0.82 - pourTilt * 0.14, 0.64, sitAmt);
        if (hipsRef.current) hipsRef.current.position.y = hipY;
        if (torsoRef.current) {
            torsoRef.current.position.y = hipY;
            const targetPitch = isFeeding
                ? (0.06 + crouchPitch)
                : (panicked ? -0.14 : 0.1 + Math.sin(t * 2.0) * 0.015);
            torsoRef.current.rotation.x += (targetPitch - torsoRef.current.rotation.x) * blend;
        }

        // Head look
        if (headRef.current) {
            const targetHeadY = isFeeding
                ? 0
                : ((panicked || catNear) ? lookAtCatYaw * 0.85 : Math.sin(t * 0.65) * 0.25);
            headRef.current.rotation.y += (targetHeadY - headRef.current.rotation.y) * blend;
            headRef.current.rotation.z = panicked ? Math.sin(t * 16) * 0.06 : 0;
            headRef.current.rotation.x = feeding.phase === 'pour' ? 0.35 : (catOnDesk ? 0.12 : -0.04);
        }

        // Arm kinematics: editing keyboard vs carrying/pouring food bag vs panicked!
        let shL = -0.26;
        let shR = -0.26;
        let elL = -1.24 + Math.sin(t * 13) * 0.04;
        let elR = -1.22 + Math.cos(t * 7.5) * 0.03;

        if (isFeeding) {
            if (feeding.phase === 'pour') {
                shL = -0.35;
                elL = -0.5;
                shR = -0.95 - pourTilt * 0.25;
                elR = -0.45 + Math.sin(t * 16) * 0.08; // Gentle shake to pour kibble!
            } else {
                shL = -walkSwing * 0.6;
                elL = -0.25;
                shR = -0.55; // Holding food bag in front!
                elR = -0.75;
            }
        } else if (panicked) {
            shL = -0.78;
            shR = -0.78;
            elL = -0.65;
            elR = -0.65;
        }

        if (leftShoulderRef.current) leftShoulderRef.current.rotation.x += (shL - leftShoulderRef.current.rotation.x) * blend;
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.x += (shR - rightShoulderRef.current.rotation.x) * blend;
        if (leftElbowRef.current) leftElbowRef.current.rotation.x += (elL - leftElbowRef.current.rotation.x) * blend;
        if (rightElbowRef.current) rightElbowRef.current.rotation.x += (elR - rightElbowRef.current.rotation.x) * blend;

        // Orange cat-food bag visibility & pouring tilt
        if (foodBagRef.current) {
            foodBagRef.current.visible = showBag;
            foodBagRef.current.rotation.x = pourTilt * 1.35 + (pourTilt > 0.5 ? Math.sin(t * 22) * 0.12 : 0);
        }

        // Animated falling kibble pellets streaming into the bowl during 'pour' phase!
        const pouringNow = feeding.phase === 'pour' && pourTilt > 0.45;
        for (let i = 0; i < KIBBLE_INDICES.length; i++) {
            const pMesh = kibbleRefs.current[i];
            if (!pMesh) continue;
            pMesh.visible = pouringNow;
            if (pouringNow) {
                const cycle = ((t * 2.4 + i / KIBBLE_INDICES.length) % 1);
                const startY = 0.86;
                const endY = 0.12;
                const y = startY - cycle * cycle * (startY - endY);
                const jitterX = Math.sin(i * 4.3 + t * 5) * 0.08 * cycle;
                const jitterZ = Math.cos(i * 3.1 + t * 5) * 0.08 * cycle;
                pMesh.position.set(BOWL_POS.x + jitterX, y, BOWL_POS.z + jitterZ);
            }
        }

        // Ceramic bowl kibble mound & glowing ready ring
        if (bowlMoundRef.current) {
            const f = feeding.bowlFull;
            bowlMoundRef.current.visible = f > 0.02;
            bowlMoundRef.current.scale.set(0.6 + f * 0.4, Math.max(0.05, f), 0.6 + f * 0.4);
        }
        if (bowlRingRef.current) {
            const ready = feeding.bowlFull >= 0.9 && feeding.phase !== 'pour';
            bowlRingRef.current.visible = ready;
            if (ready) {
                const pulse = 1 + Math.sin(t * 4.5) * 0.08;
                bowlRingRef.current.scale.set(pulse, pulse, 1);
            }
        }
    });

    return (
        <>
            {/* ========= ERGONOMIC STUDIO SWIVEL CHAIR (anchored at desk) ========= */}
            <group position={[seatX, 0, seatZ]} rotation={[0, Math.PI, 0]} scale={1.34}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.038, 0]}>
                    <circleGeometry args={[0.62, 24]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.14} depthWrite={false} />
                </mesh>
                {[0, 1, 2, 3, 4].map((i) => {
                    const ang = (i / 5) * Math.PI * 2;
                    return (
                        <group key={i} rotation={[0, ang, 0]}>
                            <mesh position={[0, 0.08, 0.21]}>
                                <boxGeometry args={[0.055, 0.045, 0.42]} />
                                <meshStandardMaterial color="#1d2028" roughness={0.35} metalness={0.5} />
                            </mesh>
                            <mesh position={[0, 0.035, 0.39]}>
                                <cylinderGeometry args={[0.032, 0.032, 0.05, 8]} />
                                <meshStandardMaterial color="#111216" roughness={0.5} />
                            </mesh>
                        </group>
                    );
                })}
                <mesh position={[0, 0.27, 0]} castShadow>
                    <cylinderGeometry args={[0.05, 0.06, 0.4, 12]} />
                    <meshStandardMaterial color="#1f222b" metalness={0.6} roughness={0.3} />
                </mesh>
                <group ref={chairUpperRef}>
                    <mesh position={[0, 0.52, 0.04]} castShadow receiveShadow>
                        <boxGeometry args={[0.7, 0.1, 0.66]} />
                        <meshStandardMaterial color={CHAIR_DARK} roughness={0.75} />
                    </mesh>
                    <mesh position={[0, 1.04, -0.29]} rotation={[-0.08, 0, 0]} castShadow>
                        <boxGeometry args={[0.62, 0.94, 0.09]} />
                        <meshStandardMaterial color={CHAIR_DARK} roughness={0.72} />
                    </mesh>
                    <mesh position={[0, 1.0, -0.345]} rotation={[-0.08, 0, 0]}>
                        <boxGeometry args={[0.34, 0.075, 0.025]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 1.44, -0.25]} castShadow>
                        <boxGeometry args={[0.34, 0.16, 0.1]} />
                        <meshStandardMaterial color={CHAIR_TRIM} roughness={0.8} />
                    </mesh>
                    {[-0.36, 0.36].map((ax, i) => (
                        <group key={i} position={[ax, 0.72, 0.02]}>
                            <mesh position={[0, -0.09, 0]}>
                                <boxGeometry args={[0.045, 0.2, 0.055]} />
                                <meshStandardMaterial color="#181920" metalness={0.4} roughness={0.4} />
                            </mesh>
                            <mesh position={[0, 0.03, 0.07]} castShadow>
                                <boxGeometry args={[0.085, 0.045, 0.36]} />
                                <meshStandardMaterial color={CHAIR_TRIM} roughness={0.6} />
                            </mesh>
                        </group>
                    ))}
                </group>
            </group>

            {/* ========= ANIMATED LAUZA CHARACTER (sits, stands, walks & feeds Oyen!) ========= */}
            <group ref={personRootRef} position={[seatX, 0, seatZ]} rotation={[0, Math.PI, 0]} scale={1.34}>
                {/* Articulated Legs stay grounded at hips while torso bends independently at waist */}
                <group ref={hipsRef} position={[0, 0.64, -0.02]}>
                    <group ref={leftThighRef} position={[-0.14, 0.02, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
                        <mesh position={[0, -0.19, 0]} castShadow>
                            <capsuleGeometry args={[0.09, 0.26, 6, 10]} />
                            <meshStandardMaterial color={PANTS} roughness={0.85} />
                        </mesh>
                        <group ref={leftShinRef} position={[0, -0.37, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <mesh position={[0, -0.19, 0]} castShadow>
                                <capsuleGeometry args={[0.076, 0.28, 6, 10]} />
                                <meshStandardMaterial color={PANTS} roughness={0.85} />
                            </mesh>
                            <mesh position={[0, -0.39, 0.06]} castShadow>
                                <boxGeometry args={[0.14, 0.095, 0.24]} />
                                <meshStandardMaterial color="#f4f4f5" roughness={0.55} />
                            </mesh>
                        </group>
                    </group>

                    <group ref={rightThighRef} position={[0.14, 0.02, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
                        <mesh position={[0, -0.19, 0]} castShadow>
                            <capsuleGeometry args={[0.09, 0.26, 6, 10]} />
                            <meshStandardMaterial color={PANTS} roughness={0.85} />
                        </mesh>
                        <group ref={rightShinRef} position={[0, -0.37, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <mesh position={[0, -0.19, 0]} castShadow>
                                <capsuleGeometry args={[0.076, 0.28, 6, 10]} />
                                <meshStandardMaterial color={PANTS} roughness={0.85} />
                            </mesh>
                            <mesh position={[0, -0.39, 0.06]} castShadow>
                                <boxGeometry args={[0.14, 0.095, 0.24]} />
                                <meshStandardMaterial color="#f4f4f5" roughness={0.55} />
                            </mesh>
                        </group>
                    </group>
                </group>

                {/* Upper Torso + Arms + Head */}
                <group ref={torsoRef} position={[0, 0.64, -0.02]}>

                    {/* Jacket torso + white tee */}
                    <mesh position={[0, 0.33, 0]} castShadow>
                        <boxGeometry args={[0.5, 0.6, 0.28]} />
                        <meshStandardMaterial color={JACKET} roughness={0.78} />
                    </mesh>
                    <mesh position={[0, 0.34, 0.135]}>
                        <boxGeometry args={[0.15, 0.54, 0.025]} />
                        <meshStandardMaterial color={SHIRT} roughness={0.75} />
                    </mesh>
                    <mesh position={[0, 0.64, 0.02]}>
                        <cylinderGeometry args={[0.095, 0.11, 0.12, 12]} />
                        <meshStandardMaterial color={SKIN} roughness={0.68} />
                    </mesh>

                    {/* Left Arm */}
                    <group ref={leftShoulderRef} position={[-0.29, 0.53, 0.02]} rotation={[-0.26, 0, 0.06]}>
                        <mesh position={[0, -0.15, 0]} castShadow>
                            <capsuleGeometry args={[0.072, 0.22, 6, 10]} />
                            <meshStandardMaterial color={JACKET} roughness={0.78} />
                        </mesh>
                        <group ref={leftElbowRef} position={[0, -0.29, 0]} rotation={[-1.24, 0.12, 0]}>
                            <mesh position={[0, -0.15, 0]} castShadow>
                                <capsuleGeometry args={[0.06, 0.22, 6, 10]} />
                                <meshStandardMaterial color={JACKET} roughness={0.78} />
                            </mesh>
                            <mesh position={[0, -0.3, 0]}>
                                <sphereGeometry args={[0.056, 10, 10]} />
                                <meshStandardMaterial color={SKIN} roughness={0.68} />
                            </mesh>
                        </group>
                    </group>

                    {/* Right Arm + Orange Cat Food Bag prop */}
                    <group ref={rightShoulderRef} position={[0.29, 0.53, 0.02]} rotation={[-0.26, 0, -0.06]}>
                        <mesh position={[0, -0.15, 0]} castShadow>
                            <capsuleGeometry args={[0.072, 0.22, 6, 10]} />
                            <meshStandardMaterial color={JACKET} roughness={0.78} />
                        </mesh>
                        <group ref={rightElbowRef} position={[0, -0.29, 0]} rotation={[-1.22, -0.14, 0]}>
                            <mesh position={[0, -0.15, 0]} castShadow>
                                <capsuleGeometry args={[0.06, 0.22, 6, 10]} />
                                <meshStandardMaterial color={JACKET} roughness={0.78} />
                            </mesh>
                            <mesh position={[0, -0.3, 0]}>
                                <sphereGeometry args={[0.056, 10, 10]} />
                                <meshStandardMaterial color={SKIN} roughness={0.68} />
                            </mesh>
                            {/* Cute Orange Cat-Food Bag held when feeding Oyen */}
                            <group ref={foodBagRef} position={[0, -0.36, 0.04]} visible={false}>
                                <mesh castShadow>
                                    <boxGeometry args={[0.2, 0.28, 0.1]} />
                                    <meshStandardMaterial color={ACCENT} roughness={0.55} />
                                </mesh>
                                <mesh position={[0, 0.02, 0.055]}>
                                    <circleGeometry args={[0.055, 12]} />
                                    <meshBasicMaterial color="#fff7ed" />
                                </mesh>
                            </group>
                        </group>
                    </group>

                    {/* Head + Messy Dark Hair + Studio Headphones */}
                    <group ref={headRef} position={[0, 0.82, 0.03]}>
                        <mesh castShadow>
                            <sphereGeometry args={[0.205, 18, 16]} />
                            <meshStandardMaterial color={SKIN} roughness={0.66} />
                        </mesh>
                        {[-0.068, 0.068].map((ex, i) => (
                            <mesh key={i} position={[ex, 0.01, 0.18]}>
                                <sphereGeometry args={[0.022, 8, 8]} />
                                <meshBasicMaterial color="#141418" />
                            </mesh>
                        ))}
                        <mesh position={[0, 0.07, -0.03]} scale={[1.08, 0.92, 1.06]} castShadow>
                            <sphereGeometry args={[0.205, 16, 14]} />
                            <meshStandardMaterial color={HAIR} roughness={0.85} />
                        </mesh>
                        <mesh position={[-0.08, 0.11, 0.135]} rotation={[0.25, 0.2, 0.35]} castShadow>
                            <capsuleGeometry args={[0.052, 0.1, 6, 8]} />
                            <meshStandardMaterial color={HAIR} roughness={0.85} />
                        </mesh>
                        <mesh position={[0.08, 0.11, 0.135]} rotation={[0.25, -0.2, -0.35]} castShadow>
                            <capsuleGeometry args={[0.052, 0.1, 6, 8]} />
                            <meshStandardMaterial color={HAIR} roughness={0.85} />
                        </mesh>
                        <mesh position={[0, 0.06, 0]} castShadow>
                            <torusGeometry args={[0.23, 0.022, 8, 22, Math.PI]} />
                            <meshStandardMaterial color="#181920" roughness={0.3} metalness={0.4} />
                        </mesh>
                        {[-0.215, 0.215].map((hx, i) => (
                            <group key={i} position={[hx, 0.02, 0]}>
                                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                                    <cylinderGeometry args={[0.082, 0.082, 0.062, 14]} />
                                    <meshStandardMaterial color="#181920" roughness={0.3} metalness={0.3} />
                                </mesh>
                                <mesh position={[hx > 0 ? 0.033 : -0.033, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                                    <ringGeometry args={[0.044, 0.06, 16]} />
                                    <meshBasicMaterial color={ACCENT} side={2} />
                                </mesh>
                            </group>
                        ))}
                    </group>

                    {speech ? (
                        <Html position={[0, 1.38, 0]} center distanceFactor={14} zIndexRange={[10, 0]}>
                            <div className="cat-speech-bubble lauza-speech-bubble">{speech}</div>
                        </Html>
                    ) : showFeedHint ? (
                        <Html position={[0, 1.38, 0]} center distanceFactor={14} zIndexRange={[10, 0]}>
                            <button
                                type="button"
                                className="lauza-interact-tag"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRequestFeed?.();
                                }}
                            >
                                <kbd>E</kbd>
                                <span>Feed Oyen</span>
                            </button>
                        </Html>
                    ) : null}
                </group>
            </group>

            {/* ========= CERAMIC CAT FOOD BOWL + POURING KIBBLE PARTICLES ========= */}
            <group position={[BOWL_POS.x, 0.04, BOWL_POS.z]}>
                {/* Small woven feeding placemat */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
                    <circleGeometry args={[0.56, 24]} />
                    <meshStandardMaterial color="#d6cfc4" roughness={0.95} />
                </mesh>
                {/* Pulsing orange ring when food is ready for Oyen! */}
                <mesh ref={bowlRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} visible={false}>
                    <ringGeometry args={[0.42, 0.52, 24]} />
                    <meshBasicMaterial color={ACCENT} transparent opacity={0.9} />
                </mesh>
                {/* Ceramic outer bowl */}
                <mesh position={[0, 0.085, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.32, 0.36, 0.16, 20]} />
                    <meshStandardMaterial color="#f7f4ee" roughness={0.3} />
                </mesh>
                {/* Orange ceramic accent stripe */}
                <mesh position={[0, 0.09, 0]}>
                    <cylinderGeometry args={[0.335, 0.348, 0.05, 20, 1, true]} />
                    <meshStandardMaterial color={ACCENT} roughness={0.35} />
                </mesh>
                {/* Recessed inner bowl bottom */}
                <mesh position={[0, 0.155, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.27, 18]} />
                    <meshStandardMaterial color="#e5e0d8" roughness={0.45} />
                </mesh>
                {/* Rising golden-brown kibble mound + orange fish treat when filled */}
                <group ref={bowlMoundRef} position={[0, 0.15, 0]} visible={false}>
                    <mesh scale={[1, 0.45, 1]} castShadow>
                        <sphereGeometry args={[0.24, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="#a96b38" roughness={0.9} />
                    </mesh>
                    {/* Little glowing orange fish treat perched on top */}
                    <mesh position={[0.02, 0.11, 0]} scale={[1.25, 0.55, 0.6]}>
                        <sphereGeometry args={[0.075, 10, 8]} />
                        <meshStandardMaterial color="#ff934f" emissive={ACCENT} emissiveIntensity={0.35} roughness={0.3} />
                    </mesh>
                </group>
            </group>

            {/* Falling kibble stream pellets during Lauza's pour animation */}
            {KIBBLE_INDICES.map((i) => (
                <mesh
                    key={i}
                    ref={(el) => { kibbleRefs.current[i] = el; }}
                    visible={false}
                >
                    <sphereGeometry args={[0.036, 8, 6]} />
                    <meshStandardMaterial color={i % 3 === 0 ? '#ff934f' : '#a96b38'} roughness={0.75} />
                </mesh>
            ))}
        </>
    );
}
