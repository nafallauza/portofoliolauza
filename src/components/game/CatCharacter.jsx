import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { applyCatPetting, triggerCatEmote } from '../../lib/catPhysics';

const COAT = '#f97b2c';
const STRIPE = '#b9440c';
const CREAM = '#fff2e2';
const EAR_INNER = '#f4b596';
const NOSE = '#ff87a2';
const EYE = '#141417';
const COLLAR = '#18181b';

function Leg({ position, legRef }) {
    return (
        <group position={position} ref={legRef}>
            {/* Upper leg */}
            <mesh position={[0, -0.13, 0]} castShadow>
                <capsuleGeometry args={[0.068, 0.14, 6, 10]} />
                <meshStandardMaterial color={COAT} roughness={0.75} />
            </mesh>
            {/* Cream sock paw */}
            <mesh position={[0, -0.255, 0.025]} castShadow>
                <sphereGeometry args={[0.072, 10, 10]} />
                <meshStandardMaterial color={CREAM} roughness={0.7} />
            </mesh>
        </group>
    );
}

const PUFF_SLOTS = [0, 1, 2, 3, 4];
const HEART_SLOTS = [0, 1, 2, 3, 4, 5];

function makeHeartTexture() {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = '#ff6b8b';
    ctx.beginPath();
    ctx.moveTo(48, 78);
    ctx.bezierCurveTo(16, 56, 12, 30, 28, 18);
    ctx.bezierCurveTo(38, 11, 46, 18, 48, 28);
    ctx.bezierCurveTo(50, 18, 58, 11, 68, 18);
    ctx.bezierCurveTo(84, 30, 80, 56, 48, 78);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(34, 32, 7, 4, -0.55, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

export default function CatCharacter({ stateRef, meowBubble, isNapping, onCatInteract }) {
    const rootRef = useRef();
    const bodyRef = useRef();
    const headRef = useRef();
    const eyeLRef = useRef();
    const eyeRRef = useRef();
    const flRef = useRef();
    const frRef = useRef();
    const blRef = useRef();
    const brRef = useRef();
    const tail1Ref = useRef();
    const tail2Ref = useRef();
    const tail3Ref = useRef();
    const earLRef = useRef();
    const earRRef = useRef();
    const ringRef = useRef();
    const shadowRef = useRef();
    const puffRefs = useRef([]);
    const puffs = useRef(PUFF_SLOTS.map(() => ({ x: 0, y: -5, z: 0, life: 0 })));
    const puffCursor = useRef(0);
    const puffTimer = useRef(0);
    const heartRefs = useRef([]);
    const hearts = useRef(HEART_SLOTS.map(() => ({ x: 0, y: -5, z: 0, life: 0, drift: 0 })));
    const heartCursor = useRef(0);
    const heartTimer = useRef(0);
    const wasGrounded = useRef(true);
    const hoveredRef = useRef(false);
    const lastPointer = useRef(null);
    const lastPurrAt = useRef(0);

    // Soft radial contact shadow texture (replaces hard flat dark circle under cat!)
    const shadowTex = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
        grad.addColorStop(0, 'rgba(15, 18, 22, 0.42)');
        grad.addColorStop(0.55, 'rgba(15, 18, 22, 0.2)');
        grad.addColorStop(1, 'rgba(15, 18, 22, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(canvas);
    }, []);
    const heartTex = useMemo(() => makeHeartTexture(), []);

    useEffect(() => () => {
        shadowTex.dispose();
        heartTex.dispose();
        document.body.style.cursor = 'auto';
    }, [shadowTex, heartTex]);

    const spawnHeart = (cx, cy, cz) => {
        const slot = hearts.current[heartCursor.current];
        slot.x = cx + (Math.random() - 0.5) * 0.42;
        slot.y = cy + 0.92 + Math.random() * 0.18;
        slot.z = cz + (Math.random() - 0.5) * 0.42;
        slot.life = 1;
        slot.drift = (Math.random() - 0.5) * 2.4;
        heartCursor.current = (heartCursor.current + 1) % HEART_SLOTS.length;
    };

    const handlePetMove = (e) => {
        e.stopPropagation();
        const prev = lastPointer.current;
        const cur = { x: e.clientX, y: e.clientY };
        lastPointer.current = cur;
        if (!prev) return;
        const dx = cur.x - prev.x;
        const dy = cur.y - prev.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 3) return;

        const rubStep = Math.min(0.14, dist * 0.0045);
        const dirX = Math.max(-1, Math.min(1, dx / 18));
        const res = applyCatPetting(stateRef.current, rubStep, dirX);
        const { cat } = stateRef.current;

        const now = performance.now();
        if (now - lastPurrAt.current > 780) {
            lastPurrAt.current = now;
            spawnHeart(cat.x, cat.y, cat.z);
            onCatInteract?.('pet_purr');
        }
        if (res.rolled) {
            spawnHeart(cat.x, cat.y, cat.z);
            spawnHeart(cat.x, cat.y, cat.z);
            onCatInteract?.('pet_roll');
        } else if (res.happyBubble) {
            spawnHeart(cat.x, cat.y, cat.z);
            onCatInteract?.('pet_happy');
        }
    };

    const handlePoke = (e) => {
        e.stopPropagation();
        const { cat } = stateRef.current;
        if (cat.napping) cat.napping = false;
        if (cat.grounded && !cat.emote) {
            cat.vy = 4.4;
            cat.grounded = false;
        }
        spawnHeart(cat.x, cat.y, cat.z);
        onCatInteract?.('poke');
    };

    const handleDoublePoke = (e) => {
        e.stopPropagation();
        const emote = triggerCatEmote(stateRef.current);
        const { cat } = stateRef.current;
        spawnHeart(cat.x, cat.y, cat.z);
        onCatInteract?.('emote', emote);
    };

    useFrame((clockState, dt) => {
        const { cat, zoomies } = stateRef.current;
        const t = clockState.clock.elapsedTime;
        const safeDt = Math.min(dt, 0.05);
        const blend = 1 - Math.exp(-12 * safeDt);
        if (!rootRef.current) return;

        rootRef.current.position.set(cat.x, cat.y, cat.z);
        rootRef.current.rotation.y = cat.yaw;

        const isPetting = cat.petTimer > 0;
        const emote = cat.emote;
        const emoteP = cat.emoteDuration > 0 ? Math.min(1, cat.emoteTimer / cat.emoteDuration) : 0;
        // Smooth ease-in/out envelope (0 -> 1 -> 0) so every idle emote blends organically
        const emoteEnv = emote
            ? Math.min(1, Math.min(emoteP * 5.2, (1 - emoteP) * 5.2))
            : 0;

        // Happy squinted eyes while napping, petting, rolling, loafing, or periodic blinking
        const blinkPhase = t % 3.9;
        const happySquint = isPetting || emote === 'roll' || (emote === 'loaf' && blinkPhase > 3.1);
        const eyeScaleY = cat.napping ? 0.14 : (happySquint ? 0.18 : (blinkPhase > 3.74 ? 0.14 : 1));
        if (eyeLRef.current) eyeLRef.current.scale.y += (eyeScaleY - eyeLRef.current.scale.y) * blend;
        if (eyeRRef.current) eyeRRef.current.scale.y += (eyeScaleY - eyeRRef.current.scale.y) * blend;

        // Soft paw dust puffs when running fast, chasing tail, or landing!
        const spawnPuff = (px, py, pz) => {
            const slot = puffs.current[puffCursor.current];
            slot.x = px + (Math.random() - 0.5) * 0.22;
            slot.y = py + 0.08;
            slot.z = pz + (Math.random() - 0.5) * 0.22;
            slot.life = 1;
            puffCursor.current = (puffCursor.current + 1) % PUFF_SLOTS.length;
        };

        if (cat.grounded && !wasGrounded.current) {
            spawnPuff(cat.x, cat.y, cat.z);
            spawnPuff(cat.x, cat.y, cat.z);
        }
        wasGrounded.current = cat.grounded;

        if (cat.grounded && (cat.speed > 4.6 || emote === 'chase_tail')) {
            puffTimer.current -= safeDt;
            if (puffTimer.current <= 0) {
                puffTimer.current = zoomies ? 0.08 : (emote === 'chase_tail' ? 0.18 : 0.14);
                spawnPuff(cat.x - Math.sin(cat.yaw) * 0.35, cat.y, cat.z - Math.cos(cat.yaw) * 0.35);
            }
        }

        // Gentle automatic floating hearts while happily eating or belly-rolling
        if (cat.eatingTimer > 0 || (emote === 'roll' && isPetting)) {
            heartTimer.current -= safeDt;
            if (heartTimer.current <= 0) {
                heartTimer.current = 0.52;
                spawnHeart(cat.x, cat.y, cat.z);
            }
        }

        for (let i = 0; i < PUFF_SLOTS.length; i++) {
            const p = puffs.current[i];
            const mesh = puffRefs.current[i];
            if (!mesh) continue;
            if (p.life > 0) {
                p.life = Math.max(0, p.life - safeDt * 2.4);
                p.y += safeDt * 0.35;
                mesh.visible = p.life > 0.02;
                mesh.position.set(p.x, p.y, p.z);
                const sc = 0.45 + (1 - p.life) * 0.9;
                mesh.scale.setScalar(sc);
                mesh.material.opacity = p.life * 0.42;
            } else {
                mesh.visible = false;
            }
        }

        for (let i = 0; i < HEART_SLOTS.length; i++) {
            const h = hearts.current[i];
            const sp = heartRefs.current[i];
            if (!sp) continue;
            if (h.life > 0) {
                h.life = Math.max(0, h.life - safeDt * 0.85);
                h.y += safeDt * 0.62;
                sp.visible = h.life > 0.02;
                sp.position.set(h.x + Math.sin(t * 4 + h.drift) * 0.1, h.y, h.z);
                const sc = 0.22 + (1 - h.life) * 0.16;
                sp.scale.set(sc, sc, 1);
                sp.material.opacity = Math.min(1, h.life * 1.45);
            } else {
                sp.visible = false;
            }
        }

        // Ground shadow scales down softly as the cat jumps
        if (shadowRef.current) {
            const h = Math.max(0, cat.y);
            const s = Math.max(0.45, 1 - h * 0.22) * (emote === 'roll' ? 1.12 : 1);
            shadowRef.current.position.set(cat.x, 0.042, cat.z);
            shadowRef.current.scale.set(s, s, 1);
            shadowRef.current.material.opacity = Math.max(0.18, 0.9 - h * 0.32);
        }

        const moving = cat.napping ? 0 : Math.min(1, cat.speed / 4.2);
        const bounce = cat.grounded && !cat.napping ? Math.abs(Math.sin(cat.walkCycle)) * 0.055 * moving : 0;
        const breathe = Math.sin(t * (cat.napping || emote === 'loaf' ? 1.8 : 2.6)) * (cat.napping || emote === 'loaf' ? 0.022 : 0.014) * (1 - moving);

        // Compute target body, head, ear, leg & tail poses across normal / petting / all 5 emotes
        const stretchY = !cat.grounded ? 1 + Math.min(0.14, Math.abs(cat.vy) * 0.015) : 1;
        let bY = (cat.napping ? -0.18 : 0) + bounce + breathe;
        let bRotX = cat.napping ? 0.05 : (!cat.grounded ? Math.max(-0.32, Math.min(0.32, -cat.vy * 0.045)) : 0);
        let bRotZ = cat.napping ? 0.14 : Math.sin(cat.walkCycle) * 0.04 * moving;
        let bSX = cat.napping ? 1.08 : 1 / Math.sqrt(stretchY);
        let bSY = cat.napping ? 0.88 : stretchY;
        let bSZ = cat.napping ? 0.96 : 1 / Math.sqrt(stretchY);

        const eating = cat.eatingTimer > 0;
        const meowLift = cat.meowTimer > 0.7 ? Math.sin((cat.meowTimer - 0.7) * 14) * 0.14 : 0;
        let hRotX = eating
            ? 0.56 + Math.sin(t * 17) * 0.14
            : (cat.napping ? 0.24 : -0.05 - meowLift + Math.sin(t * 1.8) * 0.03 * (1 - moving));
        let hRotY = cat.napping ? 0.42 : (hoveredRef.current && moving < 0.1 ? Math.sin(t * 2.2) * 0.18 : 0);
        let hRotZ = cat.napping ? 0.22 : (hoveredRef.current && moving < 0.1 ? 0.16 : Math.sin(t * 1.1) * 0.05 * (1 - moving));

        const twitch = Math.sin(t * 5.2) > 0.96 ? 0.2 : 0;
        let earLZ = 0.26 + twitch;
        let earRZ = -0.26 - twitch * 0.4;

        const swing = cat.grounded ? Math.sin(cat.walkCycle) * 0.65 * moving : 0.45;
        let flX = cat.grounded ? swing : -0.5;
        let frX = cat.grounded ? -swing : -0.35;
        let frZ = 0;
        let blX = cat.grounded ? -swing : 0.4;
        let brX = cat.grounded ? swing : 0.5;

        const tailSpeed = zoomies ? 7.5 : (isPetting ? 6.2 : (moving > 0.1 ? 5.2 : 2.3));
        const tailAmp = zoomies ? 0.36 : (isPetting ? 0.32 : 0.22);
        let t1X = -0.55;
        let t1Y = Math.sin(t * tailSpeed) * tailAmp;
        let t2Y = Math.sin(t * tailSpeed - 0.7) * (tailAmp * 1.1);
        let t3Y = Math.sin(t * tailSpeed - 1.3) * (tailAmp * 1.2);

        // Apply active autonomous idle emote poses
        if (emote === 'roll') {
            bY = 0.14 * emoteEnv;
            bRotZ = (2.42 + Math.sin(t * 5.4) * 0.42) * emoteEnv;
            bRotX = Math.sin(t * 3.1) * 0.08 * emoteEnv;
            hRotZ = -0.38 * emoteEnv;
            hRotX = -0.18 * emoteEnv;
            flX = (-0.88 + Math.sin(t * 8.5) * 0.34) * emoteEnv;
            frX = (-0.82 + Math.cos(t * 8.5) * 0.34) * emoteEnv;
            blX = (0.72 + Math.sin(t * 8.5 + 1.2) * 0.28) * emoteEnv;
            brX = (0.68 + Math.cos(t * 8.5 + 1.2) * 0.28) * emoteEnv;
            t1Y = Math.sin(t * 6.0) * 0.45 * emoteEnv;
        } else if (emote === 'stretch') {
            bY = -0.05 * emoteEnv;
            bRotX = 0.34 * emoteEnv;
            bSZ = 1 + 0.12 * emoteEnv;
            hRotX = -0.36 * emoteEnv;
            flX = -0.95 * emoteEnv;
            frX = -0.95 * emoteEnv;
            blX = 0.38 * emoteEnv;
            brX = 0.38 * emoteEnv;
            t1X = -0.12;
            t3Y = Math.sin(t * 18) * 0.22 * emoteEnv;
        } else if (emote === 'groom') {
            bY = -0.04 * emoteEnv;
            bRotX = -0.22 * emoteEnv;
            hRotX = (0.32 + Math.sin(t * 9.5) * 0.13) * emoteEnv;
            hRotY = -0.22 * emoteEnv;
            hRotZ = 0.14 * emoteEnv;
            frX = (-1.38 + Math.sin(t * 9.5) * 0.24) * emoteEnv;
            frZ = 0.32 * emoteEnv;
            blX = -0.45 * emoteEnv;
            brX = -0.45 * emoteEnv;
        } else if (emote === 'loaf') {
            bY = -0.17 * emoteEnv + breathe;
            bSX = 1 + 0.11 * emoteEnv;
            bSY = 1 - 0.12 * emoteEnv;
            bSZ = 1 - 0.04 * emoteEnv;
            flX = 1.2 * emoteEnv;
            frX = 1.2 * emoteEnv;
            blX = -1.1 * emoteEnv;
            brX = -1.1 * emoteEnv;
            t1X = -0.95;
            t1Y = 0.85 * emoteEnv;
            t2Y = 0.72 * emoteEnv;
            t3Y = 0.55 * emoteEnv;
        } else if (emote === 'chase_tail') {
            bY = Math.abs(Math.sin(cat.walkCycle)) * 0.07 * emoteEnv;
            bRotZ = -0.2 * emoteEnv;
            hRotY = -0.82 * emoteEnv;
            hRotZ = -0.18 * emoteEnv;
            const spinSwing = Math.sin(cat.walkCycle) * 0.72;
            flX = spinSwing;
            brX = spinSwing;
            frX = -spinSwing;
            blX = -spinSwing;
            t1Y = -0.92 * emoteEnv;
            t2Y = -0.78 * emoteEnv;
            t3Y = -0.6 * emoteEnv;
        }

        // Layer affectionate petting response (back arch + lean into cursor hand + relaxed ears!)
        if (isPetting) {
            const pAmt = Math.min(1, cat.petTimer / 0.35);
            if (emote !== 'roll') {
                bY += 0.055 * pAmt;
                bRotZ += (cat.petTilt * 0.16 + Math.sin(t * 10) * 0.04) * pAmt;
                bSY *= 1 + 0.05 * pAmt;
            }
            hRotX -= 0.18 * pAmt;
            hRotZ += -cat.petTilt * 0.26 * pAmt;
            earLZ += 0.2 * pAmt;
            earRZ -= 0.2 * pAmt;
            t1X = -0.18;
        }

        if (bodyRef.current) {
            bodyRef.current.position.y += (bY - bodyRef.current.position.y) * blend;
            bodyRef.current.rotation.x += (bRotX - bodyRef.current.rotation.x) * blend;
            bodyRef.current.rotation.z += (bRotZ - bodyRef.current.rotation.z) * blend;
            bodyRef.current.scale.x += (bSX - bodyRef.current.scale.x) * blend;
            bodyRef.current.scale.y += (bSY - bodyRef.current.scale.y) * blend;
            bodyRef.current.scale.z += (bSZ - bodyRef.current.scale.z) * blend;
        }

        if (headRef.current) {
            headRef.current.rotation.x += (hRotX - headRef.current.rotation.x) * blend;
            headRef.current.rotation.y += (hRotY - headRef.current.rotation.y) * blend;
            headRef.current.rotation.z += (hRotZ - headRef.current.rotation.z) * blend;
        }

        if (earLRef.current) earLRef.current.rotation.z += (earLZ - earLRef.current.rotation.z) * blend;
        if (earRRef.current) earRRef.current.rotation.z += (earRZ - earRRef.current.rotation.z) * blend;

        if (flRef.current) flRef.current.rotation.x += (flX - flRef.current.rotation.x) * blend;
        if (frRef.current) {
            frRef.current.rotation.x += (frX - frRef.current.rotation.x) * blend;
            frRef.current.rotation.z += (frZ - frRef.current.rotation.z) * blend;
        }
        if (blRef.current) blRef.current.rotation.x += (blX - blRef.current.rotation.x) * blend;
        if (brRef.current) brRef.current.rotation.x += (brX - brRef.current.rotation.x) * blend;

        if (tail1Ref.current) {
            tail1Ref.current.rotation.x += (t1X - tail1Ref.current.rotation.x) * blend;
            tail1Ref.current.rotation.y += (t1Y - tail1Ref.current.rotation.y) * blend;
        }
        if (tail2Ref.current) tail2Ref.current.rotation.y += (t2Y - tail2Ref.current.rotation.y) * blend;
        if (tail3Ref.current) tail3Ref.current.rotation.y += (t3Y - tail3Ref.current.rotation.y) * blend;

        // Meow pulse ring
        if (ringRef.current) {
            if (cat.meowTimer > 0) {
                const p = 1 - cat.meowTimer / 1.15;
                const s = 0.6 + p * 1.9;
                ringRef.current.visible = true;
                ringRef.current.scale.set(s, s, 1);
                ringRef.current.material.opacity = (1 - p) * 0.65;
            } else {
                ringRef.current.visible = false;
            }
        }
    });

    return (
        <>
            {/* Soft feathered ground contact shadow */}
            <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.042, 0]}>
                <planeGeometry args={[1.32, 1.32]} />
                <meshBasicMaterial map={shadowTex} transparent opacity={0.9} depthWrite={false} />
            </mesh>

            {/* Soft running / landing dust puffs */}
            {PUFF_SLOTS.map((i) => (
                <mesh key={i} ref={(el) => { puffRefs.current[i] = el; }} visible={false}>
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshBasicMaterial color="#fff3e6" transparent opacity={0} depthWrite={false} />
                </mesh>
            ))}

            {/* Floating affection hearts when petting / belly-rolling / fed */}
            {HEART_SLOTS.map((i) => (
                <sprite key={i} ref={(el) => { heartRefs.current[i] = el; }} visible={false}>
                    <spriteMaterial map={heartTex} transparent opacity={0} depthWrite={false} />
                </sprite>
            ))}

            <group ref={rootRef}>
                {/* Generous invisible pointer hitbox for smooth cursor petting & playful tap/double-tap */}
                <mesh
                    position={[0, 0.52, 0.06]}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        hoveredRef.current = true;
                        lastPointer.current = { x: e.clientX, y: e.clientY };
                        document.body.style.cursor = 'grab';
                    }}
                    onPointerOut={() => {
                        hoveredRef.current = false;
                        lastPointer.current = null;
                        document.body.style.cursor = 'auto';
                    }}
                    onPointerMove={handlePetMove}
                    onClick={handlePoke}
                    onDoubleClick={handleDoublePoke}
                >
                    <sphereGeometry args={[0.72, 10, 8]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>

                {/* Expanding orange meow ring */}
                <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} visible={false}>
                    <ringGeometry args={[0.45, 0.56, 28]} />
                    <meshBasicMaterial color="#ff7a30" transparent opacity={0} depthWrite={false} />
                </mesh>

                <group ref={bodyRef}>
                    {/* Rounded torso */}
                    <mesh position={[0, 0.42, -0.02]} scale={[1.08, 0.95, 1.48]} castShadow receiveShadow>
                        <sphereGeometry args={[0.27, 18, 16]} />
                        <meshStandardMaterial color={COAT} roughness={0.78} />
                    </mesh>

                    {/* Cream chest & belly */}
                    <mesh position={[0, 0.36, 0.08]} scale={[0.82, 0.72, 1.22]}>
                        <sphereGeometry args={[0.24, 14, 12]} />
                        <meshStandardMaterial color={CREAM} roughness={0.8} />
                    </mesh>

                    {/* Tabby back stripes */}
                    {[-0.14, 0.0, 0.14].map((zOff, i) => (
                        <mesh key={i} position={[0, 0.56, zOff]} scale={[1.02, 0.55, 0.22]}>
                            <sphereGeometry args={[0.23, 12, 10]} />
                            <meshStandardMaterial color={STRIPE} roughness={0.82} />
                        </mesh>
                    ))}

                    {/* Collar + glowing orange tag */}
                    <mesh position={[0, 0.52, 0.28]} rotation={[0.42, 0, 0]} castShadow>
                        <torusGeometry args={[0.175, 0.032, 10, 22]} />
                        <meshStandardMaterial color={COLLAR} roughness={0.4} metalness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.42, 0.44]}>
                        <sphereGeometry args={[0.045, 10, 10]} />
                        <meshStandardMaterial color="#ff7a30" emissive="#ff7a30" emissiveIntensity={1.1} roughness={0.2} />
                    </mesh>

                    {/* Head */}
                    <group ref={headRef} position={[0, 0.67, 0.36]}>
                        <mesh scale={[1.08, 0.94, 0.96]} castShadow>
                            <sphereGeometry args={[0.255, 18, 16]} />
                            <meshStandardMaterial color={COAT} roughness={0.75} />
                        </mesh>

                        {/* Forehead tabby stripes */}
                        {[-0.06, 0, 0.06].map((xOff, i) => (
                            <mesh key={i} position={[xOff, 0.17, 0.13]} rotation={[0.45, 0, 0]}>
                                <boxGeometry args={[0.026, 0.08, 0.035]} />
                                <meshStandardMaterial color={STRIPE} roughness={0.85} />
                            </mesh>
                        ))}

                        {/* Cream cheeks / muzzle */}
                        <mesh position={[-0.068, -0.055, 0.205]} scale={[1.05, 0.85, 0.85]}>
                            <sphereGeometry args={[0.075, 12, 10]} />
                            <meshStandardMaterial color={CREAM} roughness={0.75} />
                        </mesh>
                        <mesh position={[0.068, -0.055, 0.205]} scale={[1.05, 0.85, 0.85]}>
                            <sphereGeometry args={[0.075, 12, 10]} />
                            <meshStandardMaterial color={CREAM} roughness={0.75} />
                        </mesh>

                        {/* Pink nose */}
                        <mesh position={[0, -0.02, 0.255]} scale={[1.2, 0.85, 0.8]}>
                            <sphereGeometry args={[0.03, 10, 10]} />
                            <meshStandardMaterial color={NOSE} roughness={0.4} />
                        </mesh>

                        {/* Glossy dark blinking eyes + catchlights */}
                        {[-0.1, 0.1].map((xOff, i) => (
                            <group key={i} ref={i === 0 ? eyeLRef : eyeRRef} position={[xOff, 0.035, 0.205]}>
                                <mesh>
                                    <sphereGeometry args={[0.044, 12, 12]} />
                                    <meshStandardMaterial color={EYE} roughness={0.12} metalness={0.1} />
                                </mesh>
                                <mesh position={[0.013, 0.015, 0.036]}>
                                    <sphereGeometry args={[0.013, 8, 8]} />
                                    <meshBasicMaterial color="#ffffff" />
                                </mesh>
                            </group>
                        ))}

                        {/* Whiskers */}
                        {[-1, 1].map((side) =>
                            [-0.14, 0, 0.14].map((tilt, idx) => (
                                <mesh
                                    key={`${side}-${idx}`}
                                    position={[side * 0.19, -0.045 + idx * 0.018, 0.19]}
                                    rotation={[0, side * -0.18, Math.PI / 2 + side * tilt]}
                                >
                                    <cylinderGeometry args={[0.004, 0.004, 0.17, 6]} />
                                    <meshBasicMaterial color="#2a2420" />
                                </mesh>
                            ))
                        )}

                        {/* Ears */}
                        <group ref={earLRef} position={[-0.145, 0.21, -0.01]} rotation={[0.08, -0.15, 0.26]}>
                            <mesh castShadow scale={[0.9, 1.15, 0.55]}>
                                <coneGeometry args={[0.095, 0.19, 4]} />
                                <meshStandardMaterial color={COAT} roughness={0.78} />
                            </mesh>
                            <mesh position={[0, -0.01, 0.026]} scale={[0.62, 0.85, 0.35]}>
                                <coneGeometry args={[0.085, 0.15, 4]} />
                                <meshStandardMaterial color={EAR_INNER} roughness={0.8} />
                            </mesh>
                        </group>
                        <group ref={earRRef} position={[0.145, 0.21, -0.01]} rotation={[0.08, 0.15, -0.26]}>
                            <mesh castShadow scale={[0.9, 1.15, 0.55]}>
                                <coneGeometry args={[0.095, 0.19, 4]} />
                                <meshStandardMaterial color={COAT} roughness={0.78} />
                            </mesh>
                            <mesh position={[0, -0.01, 0.026]} scale={[0.62, 0.85, 0.35]}>
                                <coneGeometry args={[0.085, 0.15, 4]} />
                                <meshStandardMaterial color={EAR_INNER} roughness={0.8} />
                            </mesh>
                        </group>
                    </group>

                    {/* 4 Articulated legs */}
                    <Leg position={[-0.145, 0.3, 0.21]} legRef={flRef} />
                    <Leg position={[0.145, 0.3, 0.21]} legRef={frRef} />
                    <Leg position={[-0.155, 0.3, -0.22]} legRef={blRef} />
                    <Leg position={[0.155, 0.3, -0.22]} legRef={brRef} />

                    {/* Expressive 3-segment tail with cream tip */}
                    <group ref={tail1Ref} position={[0, 0.49, -0.37]} rotation={[-0.55, 0, 0]}>
                        <mesh position={[0, 0.13, 0]} castShadow>
                            <capsuleGeometry args={[0.052, 0.18, 6, 10]} />
                            <meshStandardMaterial color={COAT} roughness={0.78} />
                        </mesh>
                        <group ref={tail2Ref} position={[0, 0.25, 0]} rotation={[0.35, 0, 0]}>
                            <mesh position={[0, 0.12, 0]} castShadow>
                                <capsuleGeometry args={[0.048, 0.16, 6, 10]} />
                                <meshStandardMaterial color={STRIPE} roughness={0.8} />
                            </mesh>
                            <group ref={tail3Ref} position={[0, 0.23, 0]} rotation={[0.42, 0, 0]}>
                                <mesh position={[0, 0.09, 0]} castShadow>
                                    <capsuleGeometry args={[0.044, 0.12, 6, 10]} />
                                    <meshStandardMaterial color={CREAM} roughness={0.75} />
                                </mesh>
                            </group>
                        </group>
                    </group>
                </group>

                {/* Floating Meow / Nap Speech Bubble */}
                {(meowBubble || isNapping) && (
                    <Html position={[0, 1.38, 0.2]} center distanceFactor={14} zIndexRange={[10, 0]}>
                        <div className="cat-speech-bubble">{meowBubble || 'Zzz…'}</div>
                    </Html>
                )}
            </group>
        </>
    );
}
