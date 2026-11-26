import React, { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import {
    CAMERA_OFFSET_CLOSE,
    CAMERA_OFFSET_WIDE,
    INITIAL_BALLS,
    INITIAL_TREATS,
    ROOM_ZONES,
    stepCatWorld,
} from '../../lib/catPhysics';
import CatCharacter from './CatCharacter';
import LauzaDeskCharacter from './LauzaDeskCharacter';

const WALL_WHITE = '#f4f1ea';
const WALL_CAP = '#d8d3c9';
const WALL_TRIM = '#23252d';
const OAK_WOOD = '#c9a277';
const CEDAR_WOOD = '#a6754b';
const ACCENT = '#ff7a30';

function makeCanvasTexture(w, h, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

function useVillaTextures(projectCount, certCount) {
    const textures = useMemo(() => {
        // Warm light-oak indoor hardwood planks
        const oakFloor = makeCanvasTexture(512, 512, (ctx, w, h) => {
            ctx.fillStyle = '#c9a67d';
            ctx.fillRect(0, 0, w, h);
            const rows = 8;
            const rowH = h / rows;
            for (let r = 0; r < rows; r++) {
                const offset = (r % 2) * 128;
                for (let c = -1; c < 3; c++) {
                    const delta = ((r * 11 + c * 17) % 14) - 7;
                    ctx.fillStyle = `rgb(${208 + delta}, ${172 + delta}, ${132 + delta})`;
                    ctx.fillRect(c * 256 + offset + 2, r * rowH + 2, 252, rowH - 3);
                }
                ctx.fillStyle = 'rgba(92, 62, 34, 0.22)';
                ctx.fillRect(0, r * rowH, w, 2);
            }
        });
        oakFloor.wrapS = THREE.RepeatWrapping;
        oakFloor.wrapT = THREE.RepeatWrapping;
        oakFloor.repeat.set(3.5, 4);

        // Sleek pale terrazzo / studio concrete tile
        const studioFloor = makeCanvasTexture(512, 512, (ctx, w, h) => {
            ctx.fillStyle = '#e5e2db';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
            ctx.lineWidth = 3;
            for (let i = 0; i <= 4; i++) {
                ctx.beginPath();
                ctx.moveTo((w / 4) * i, 0);
                ctx.lineTo((w / 4) * i, h);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, (h / 4) * i);
                ctx.lineTo(w, (h / 4) * i);
                ctx.stroke();
            }
            // Subtle terrazzo flecks
            for (let i = 0; i < 90; i++) {
                const fx = (i * 73) % w;
                const fy = (i * 139) % h;
                ctx.fillStyle = i % 5 === 0 ? 'rgba(255,122,48,0.22)' : 'rgba(60,60,65,0.12)';
                ctx.fillRect(fx, fy, 4, 4);
            }
        });
        studioFloor.wrapS = THREE.RepeatWrapping;
        studioFloor.wrapT = THREE.RepeatWrapping;
        studioFloor.repeat.set(3, 4);

        // Crisp fine-stippled architectural manicured lawn (replaces blurry streaked circles!)
        const grass = makeCanvasTexture(512, 512, (ctx, w, h) => {
            ctx.fillStyle = '#739a65';
            ctx.fillRect(0, 0, w, h);
            // Subtle architectural mowed lawn bands
            const bands = 4;
            const bw = w / bands;
            for (let b = 0; b < bands; b++) {
                ctx.fillStyle = b % 2 === 0 ? 'rgba(255, 255, 245, 0.045)' : 'rgba(30, 52, 26, 0.045)';
                ctx.fillRect(b * bw, 0, bw, h);
            }
            // Organic micro-blade grass grain (deterministic LCG)
            let seed = 1337;
            const rand = () => {
                seed = (seed * 16807) % 2147483647;
                return (seed - 1) / 2147483646;
            };
            for (let i = 0; i < 4200; i++) {
                const gx = rand() * w;
                const gy = rand() * h;
                const shade = rand();
                ctx.fillStyle = shade < 0.35
                    ? 'rgba(54, 88, 45, 0.24)'
                    : (shade < 0.72 ? 'rgba(138, 174, 114, 0.22)' : 'rgba(92, 130, 76, 0.22)');
                ctx.fillRect(gx, gy, 2, 5 + rand() * 5);
            }
        });
        grass.wrapS = THREE.RepeatWrapping;
        grass.wrapT = THREE.RepeatWrapping;
        grass.repeat.set(6, 4.5);

        // Subtle matte stucco/plaster grain for modern white walls
        const plaster = makeCanvasTexture(256, 256, (ctx, w, h) => {
            ctx.fillStyle = '#f4f1ea';
            ctx.fillRect(0, 0, w, h);
            let seed = 4242;
            const rand = () => {
                seed = (seed * 16807) % 2147483647;
                return (seed - 1) / 2147483646;
            };
            for (let i = 0; i < 1600; i++) {
                const x = rand() * w;
                const y = rand() * h;
                ctx.fillStyle = rand() > 0.5 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.04)';
                ctx.fillRect(x, y, 2, 2);
            }
        });
        plaster.wrapS = THREE.RepeatWrapping;
        plaster.wrapT = THREE.RepeatWrapping;
        plaster.repeat.set(3, 2);

        // Cedar outdoor wooden patio decking
        const deck = makeCanvasTexture(512, 512, (ctx, w, h) => {
            ctx.fillStyle = '#9c6e46';
            ctx.fillRect(0, 0, w, h);
            const slats = 10;
            const sh = h / slats;
            for (let s = 0; s < slats; s++) {
                const d = ((s * 7) % 12) - 6;
                ctx.fillStyle = `rgb(${168 + d}, ${118 + d}, ${78 + d})`;
                ctx.fillRect(0, s * sh + 3, w, sh - 5);
                ctx.fillStyle = 'rgba(42, 24, 12, 0.45)';
                ctx.fillRect(0, s * sh, w, 3);
            }
        });
        deck.wrapS = THREE.RepeatWrapping;
        deck.wrapT = THREE.RepeatWrapping;
        deck.repeat.set(2.5, 1.5);

        // Living room framed minimalist poster
        const poster = makeCanvasTexture(512, 320, (ctx, w, h) => {
            ctx.fillStyle = '#14151a';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#ff7a30';
            ctx.lineWidth = 6;
            ctx.strokeRect(18, 18, w - 36, h - 36);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 88px sans-serif';
            ctx.fillText('LAUZA', 54, 152);
            ctx.fillStyle = '#ff7a30';
            ctx.fillRect(354, 134, 18, 18);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '600 25px monospace';
            ctx.fillText('FULL-STACK DEV · VIDEO EDITOR', 54, 212);
            ctx.fillStyle = '#ff7a30';
            ctx.fillRect(54, 242, 140, 6);
        });

        // Fine warm oak furniture woodgrain (for desk, cabinet, coffee table, headboard)
        const oakGrain = makeCanvasTexture(512, 256, (ctx, w, h) => {
            ctx.fillStyle = '#cfa97e';
            ctx.fillRect(0, 0, w, h);
            for (let y = 0; y < h; y += 3) {
                const wave = Math.sin(y * 0.14) * 5;
                const shade = ((y * 13) % 10) - 5;
                ctx.fillStyle = `rgba(${158 + shade}, ${114 + shade}, ${72 + shade}, 0.16)`;
                ctx.fillRect(0, y, w, 2 + (wave > 0 ? 1 : 0));
            }
        });
        oakGrain.wrapS = THREE.RepeatWrapping;
        oakGrain.wrapT = THREE.RepeatWrapping;
        oakGrain.repeat.set(2, 1);

        // Detailed mechanical keyboard top texture (keycap rows + orange Esc & Enter!)
        const keyboardTex = makeCanvasTexture(512, 180, (ctx, w, h) => {
            ctx.fillStyle = '#e7e5e0';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#c8c4bc';
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, w - 6, h - 6);
            const rows = 5;
            const cols = 14;
            const padX = 18;
            const padY = 16;
            const gap = 5;
            const kw = (w - padX * 2 - gap * (cols - 1)) / cols;
            const kh = (h - padY * 2 - gap * (rows - 1)) / rows;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (r === 4 && c >= 4 && c <= 9) {
                        if (c === 4) {
                            ctx.fillStyle = '#d4d0c8';
                            ctx.fillRect(padX + c * (kw + gap), padY + r * (kh + gap), kw * 6 + gap * 5, kh);
                        }
                        continue;
                    }
                    const isEsc = r === 0 && c === 0;
                    const isEnter = r === 2 && c === cols - 1;
                    const isMod = c === 0 || c === cols - 1 || r === 4;
                    ctx.fillStyle = (isEsc || isEnter) ? '#ff7a30' : (isMod ? '#343741' : '#f8f7f4');
                    ctx.fillRect(padX + c * (kw + gap), padY + r * (kh + gap), kw, kh);
                }
            }
        });

        // Code monitor (VS Code style with sidebar, tabs & clean syntax highlights)
        const codeScreen = makeCanvasTexture(512, 300, (ctx, w, h) => {
            ctx.fillStyle = '#0d1017';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#141923';
            ctx.fillRect(0, 0, w, 30);
            ctx.fillStyle = '#10141d';
            ctx.fillRect(0, 30, 86, h - 50);
            ctx.fillStyle = '#ff7a30';
            ctx.fillRect(0, h - 20, w, 20);
            ['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c, i) => {
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(20 + i * 18, 15, 4.5, 0, Math.PI * 2);
                ctx.fill();
            });
            for (let s = 0; s < 7; s++) {
                ctx.fillStyle = s === 2 ? 'rgba(255,122,48,0.55)' : 'rgba(255,255,255,0.12)';
                ctx.fillRect(14, 46 + s * 26, 48 + (s % 3) * 8, 8);
            }
            const lines = [
                [0.21, '#ff7a30', 0.36],
                [0.25, '#7dd3fc', 0.48],
                [0.25, '#e4e4e7', 0.56],
                [0.21, '#a1a1aa', 0.32],
                [0.25, '#ff7a30', 0.42],
                [0.3, '#86efac', 0.44],
                [0.21, '#e4e4e7', 0.28],
            ];
            lines.forEach(([indent, color, len], idx) => {
                ctx.fillStyle = color;
                ctx.fillRect(indent * w, 52 + idx * 29, len * w, 10);
            });
        });

        // Video timeline monitor (clean Premiere UI; moving playhead rendered as 3D bar, no baked duplicate!)
        const videoScreen = makeCanvasTexture(512, 300, (ctx, w, h) => {
            ctx.fillStyle = '#0c0d13';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#151722';
            ctx.fillRect(0, 0, w, 26);
            ctx.fillStyle = '#1d1924';
            ctx.fillRect(24, 34, w - 48, 122);
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 2;
            ctx.strokeRect(24, 34, w - 48, 122);
            ctx.fillStyle = '#ff7a30';
            ctx.beginPath();
            ctx.moveTo(w / 2 - 12, 76);
            ctx.lineTo(w / 2 + 20, 95);
            ctx.lineTo(w / 2 - 12, 114);
            ctx.closePath();
            ctx.fill();
            const tracks = [
                [24, 174, 150, '#ff7a30'],
                [182, 174, 192, '#fb923c'],
                [382, 174, 106, '#ff7a30'],
                [24, 208, 218, '#38bdf8'],
                [250, 208, 238, '#0ea5e9'],
                [24, 242, 464, '#34d399'],
            ];
            tracks.forEach(([x, y, tw, col]) => {
                ctx.fillStyle = col;
                ctx.fillRect(x, y, tw, 24);
            });
        });

        // Studio gallery sign
        const gallerySign = makeCanvasTexture(512, 180, (ctx, w, h) => {
            ctx.fillStyle = '#16171d';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ff7a30';
            ctx.fillRect(0, 0, 10, h);
            ctx.font = 'bold 24px monospace';
            ctx.fillText('02 · SELECTED WORK', 34, 58);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px sans-serif';
            ctx.fillText(`${projectCount || '—'} PROJECTS BUILT`, 34, 126);
        });

        // Certificate gallery plaque
        const certSign = makeCanvasTexture(512, 180, (ctx, w, h) => {
            ctx.fillStyle = '#16171d';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ff7a30';
            ctx.fillRect(0, 0, 10, h);
            ctx.font = 'bold 24px monospace';
            ctx.fillText('04 · CREDENTIALS', 34, 58);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 46px sans-serif';
            ctx.fillText(`${certCount || '—'} CERTIFICATES`, 34, 126);
        });

        // Framed miniature certificate artwork for Gallery Hall
        const certFrame = makeCanvasTexture(256, 200, (ctx, w, h) => {
            ctx.fillStyle = '#faf8f4';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#d6d1c7';
            ctx.lineWidth = 8;
            ctx.strokeRect(12, 12, w - 24, h - 24);
            ctx.fillStyle = '#1d1f26';
            ctx.fillRect(46, 46, w - 92, 14);
            ctx.fillStyle = '#a1a1aa';
            ctx.fillRect(62, 76, w - 124, 9);
            ctx.fillRect(54, 96, w - 108, 9);
            // Orange verification seal
            ctx.fillStyle = '#ff7a30';
            ctx.beginPath();
            ctx.arc(w / 2, 144, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(w / 2, 144, 7, 0, Math.PI * 2);
            ctx.fill();
        });

        // Welcome mat
        const welcomeMat = makeCanvasTexture(512, 256, (ctx, w, h) => {
            ctx.fillStyle = '#a87d54';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#1e1f26';
            ctx.lineWidth = 14;
            ctx.strokeRect(18, 18, w - 36, h - 36);
            ctx.fillStyle = '#191a20';
            ctx.font = 'bold 58px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("LET'S TALK", w / 2, 148);
        });

        // Refined architectural floor zone rings (delicate hairline dashed outer ring + subtle cardinal ticks)
        const makeZoneRing = (active) => makeCanvasTexture(512, 512, (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            const cx = w / 2;
            const cy = h / 2;
            const accent = active ? '#ff7a30' : '#27272a';

            // Subtle warm radial glow inside active zone
            const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 210);
            grad.addColorStop(0, active ? 'rgba(255, 122, 48, 0.2)' : 'rgba(24, 24, 27, 0.04)');
            grad.addColorStop(0.7, active ? 'rgba(255, 122, 48, 0.08)' : 'rgba(24, 24, 27, 0.02)');
            grad.addColorStop(1, 'rgba(255, 122, 48, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, 210, 0, Math.PI * 2);
            ctx.fill();

            // Outer fine dashed architectural ring
            ctx.strokeStyle = active ? 'rgba(255, 122, 48, 0.85)' : 'rgba(24, 24, 27, 0.24)';
            ctx.lineWidth = active ? 5 : 3.5;
            ctx.setLineDash([16, 14]);
            ctx.beginPath();
            ctx.arc(cx, cy, 224, 0, Math.PI * 2);
            ctx.stroke();

            // Inner hairline solid ring
            ctx.setLineDash([]);
            ctx.strokeStyle = active ? 'rgba(255, 122, 48, 0.45)' : 'rgba(24, 24, 27, 0.14)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(cx, cy, 188, 0, Math.PI * 2);
            ctx.stroke();

            // 4 tiny architectural cardinal ticks
            ctx.strokeStyle = accent;
            ctx.globalAlpha = active ? 0.95 : 0.35;
            ctx.lineWidth = 4;
            [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((a) => {
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * 198, cy + Math.sin(a) * 198);
                ctx.lineTo(cx + Math.cos(a) * 238, cy + Math.sin(a) * 238);
                ctx.stroke();
            });
            // Delicate center marker dot
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(cx, cy, active ? 7 : 4.5, 0, Math.PI * 2);
            ctx.fill();
        });

        const zoneRingIdle = makeZoneRing(false);
        const zoneRingActive = makeZoneRing(true);

        // Clean frosted porcelain architectural floor plaques (matches the minimalist 2D HUD!)
        const zoneSigns = {};
        for (const z of ROOM_ZONES) {
            zoneSigns[z.id] = makeCanvasTexture(512, 128, (ctx, w, h) => {
                ctx.clearRect(0, 0, w, h);
                const r = 28;
                const x = 10;
                const y = 14;
                const rw = w - 20;
                const rh = h - 28;
                ctx.beginPath();
                ctx.roundRect(x, y, rw, rh, r);
                ctx.fillStyle = 'rgba(252, 251, 248, 0.92)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(24, 24, 27, 0.14)';
                ctx.lineWidth = 3.5;
                ctx.stroke();

                // Small orange accent dot
                ctx.fillStyle = '#ff7a30';
                ctx.beginPath();
                ctx.arc(46, h / 2, 8, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#71717a';
                ctx.font = '600 24px monospace';
                ctx.fillText(z.index, 70, 72);

                ctx.fillStyle = '#18181b';
                ctx.font = '700 34px sans-serif';
                ctx.fillText(z.label, 122, 68);

                ctx.fillStyle = '#71717a';
                ctx.font = '500 21px sans-serif';
                ctx.fillText(z.roomName, 122, 96);
            });
        }

        // Studio "ON AIR" architectural wall badge for Broadcast Room
        const onAirSign = makeCanvasTexture(256, 96, (ctx, w, h) => {
            ctx.fillStyle = '#181920';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
            ctx.lineWidth = 5;
            ctx.strokeRect(8, 8, w - 16, h - 16);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(44, h / 2, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 34px monospace';
            ctx.fillText('ON AIR', 74, 60);
        });

        return {
            oakFloor,
            oakGrain,
            keyboardTex,
            studioFloor,
            grass,
            plaster,
            deck,
            poster,
            codeScreen,
            videoScreen,
            gallerySign,
            certSign,
            certFrame,
            welcomeMat,
            zoneRingIdle,
            zoneRingActive,
            zoneSigns,
            onAirSign,
        };
    }, [projectCount, certCount]);

    useEffect(() => {
        return () => {
            Object.entries(textures).forEach(([k, val]) => {
                if (k === 'zoneSigns') Object.values(val).forEach((t) => t.dispose());
                else val.dispose();
            });
        };
    }, [textures]);

    return textures;
}

const TIME_PRESETS = {
    day: {
        bg: '#e5ecf3',
        fogNear: 50,
        fogFar: 112,
        ambientIntensity: 0.62,
        ambientColor: '#fffcf7',
        hemiSky: '#ffffff',
        hemiGround: '#8ea87f',
        hemiIntensity: 0.72,
        sunPos: [16, 28, 16],
        sunColor: '#fff6e8',
        sunIntensity: 1.78,
        lampBoost: 1.0,
        windowGlass: '#cde6f7',
        envIntensity: 1.0,
    },
    sunset: {
        bg: '#ead0bd',
        fogNear: 46,
        fogFar: 104,
        ambientIntensity: 0.52,
        ambientColor: '#ffe6cf',
        hemiSky: '#ffd3b0',
        hemiGround: '#6f6b58',
        hemiIntensity: 0.62,
        sunPos: [25, 14, 12],
        sunColor: '#ffae70',
        sunIntensity: 1.95,
        lampBoost: 1.85,
        windowGlass: '#f7c59c',
        envIntensity: 0.85,
    },
    night: {
        bg: '#131824',
        fogNear: 44,
        fogFar: 98,
        ambientIntensity: 0.24,
        ambientColor: '#9eb6df',
        hemiSky: '#3b4e74',
        hemiGround: '#1a202c',
        hemiIntensity: 0.36,
        sunPos: [-16, 24, 14],
        sunColor: '#9ab7e8',
        sunIntensity: 0.52,
        lampBoost: 3.1,
        windowGlass: '#1b2740',
        envIntensity: 0.28,
    },
};

function WallSegment({ x, z, w, d, h = 3.8, color = WALL_WHITE, plasterMap = null }) {
    return (
        <group position={[x, h / 2, z]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={color} map={plasterMap} roughness={0.86} />
            </mesh>
            {/* Subtle warm plaster cutaway cross-section cap (architectural render look, no harsh black band) */}
            <mesh position={[0, h / 2 + 0.025, 0]}>
                <boxGeometry args={[w + 0.02, 0.05, d + 0.02]} />
                <meshStandardMaterial color={WALL_CAP} roughness={0.78} />
            </mesh>
            {/* Slim recessed skirting/baseboard at floor contact */}
            <mesh position={[0, -h / 2 + 0.06, 0]}>
                <boxGeometry args={[w + 0.025, 0.12, d + 0.025]} />
                <meshStandardMaterial color="#e5e0d7" roughness={0.75} />
            </mesh>
        </group>
    );
}

// Refined multi-branch architectural tree inside a sleek concrete tree-ring planter with gentle wind sway
function StylizedTree({ position, scale = 1 }) {
    const canopyRef = useRef();
    useFrame((state) => {
        if (!canopyRef.current) return;
        const t = state.clock.elapsedTime;
        canopyRef.current.rotation.z = Math.sin(t * 1.15 + position[0]) * 0.025;
        canopyRef.current.rotation.x = Math.cos(t * 0.9 + position[2]) * 0.018;
    });

    return (
        <group position={position} scale={scale}>
            {/* Concrete planter curb + dark mulch */}
            <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.85, 0.28, 1.85]} />
                <meshStandardMaterial color="#e8e4dc" roughness={0.82} />
            </mesh>
            <mesh position={[0, 0.285, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.55, 1.55]} />
                <meshStandardMaterial color="#463529" roughness={0.96} />
            </mesh>
            {/* Tapered multi-branch trunk */}
            <mesh position={[0, 1.15, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.21, 2.0, 12]} />
                <meshStandardMaterial color="#755640" roughness={0.88} />
            </mesh>
            <mesh position={[0.24, 1.82, 0.12]} rotation={[0.25, 0, -0.52]}>
                <cylinderGeometry args={[0.06, 0.1, 0.85, 8]} />
                <meshStandardMaterial color="#755640" roughness={0.88} />
            </mesh>
            <mesh position={[-0.22, 1.72, -0.14]} rotation={[-0.22, 0, 0.48]}>
                <cylinderGeometry args={[0.055, 0.095, 0.78, 8]} />
                <meshStandardMaterial color="#755640" roughness={0.88} />
            </mesh>
            {/* Layered soft organic canopy (olive, sage & sunlit emerald) with gentle breeze */}
            <group ref={canopyRef} position={[0, 2.55, 0]}>
                <mesh position={[0, 0.1, 0]} scale={[1.15, 0.86, 1.1]} castShadow receiveShadow>
                    <sphereGeometry args={[1.05, 14, 12]} />
                    <meshStandardMaterial color="#55824e" roughness={0.84} />
                </mesh>
                <mesh position={[0.68, -0.27, 0.44]} scale={[1.05, 0.82, 1.0]}>
                    <sphereGeometry args={[0.72, 12, 10]} />
                    <meshStandardMaterial color="#67965c" roughness={0.84} />
                </mesh>
                <mesh position={[-0.64, -0.17, -0.35]} scale={[1.0, 0.85, 1.05]}>
                    <sphereGeometry args={[0.7, 12, 10]} />
                    <meshStandardMaterial color="#497444" roughness={0.84} />
                </mesh>
                <mesh position={[-0.18, 0.4, 0.42]} scale={[0.95, 0.75, 0.95]}>
                    <sphereGeometry args={[0.58, 12, 10]} />
                    <meshStandardMaterial color="#75a667" roughness={0.82} />
                </mesh>
                <mesh position={[0.35, 0.0, -0.52]} scale={[0.92, 0.78, 0.95]}>
                    <sphereGeometry args={[0.56, 12, 10]} />
                    <meshStandardMaterial color="#5b8853" roughness={0.84} />
                </mesh>
            </group>
        </group>
    );
}

// Manicured continuous architectural boxwood hedge inside a modern concrete curbed planter
function GardenPlanterBed({ position, width = 1.1, depth = 4.6, rotationY = 0 }) {
    const accents = Math.max(5, Math.floor(depth / 0.72));
    return (
        <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, 0.44, depth]} />
                <meshStandardMaterial color="#ebe7df" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.445, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[width - 0.16, depth - 0.16]} />
                <meshStandardMaterial color="#3e2f24" roughness={0.96} />
            </mesh>
            {/* Continuous sculpted boxwood hedge core (zero awkward ball gaps!) */}
            <mesh position={[0, 0.66, 0]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.26, 0.44, depth - 0.28]} />
                <meshStandardMaterial color="#4e7e47" roughness={0.9} />
            </mesh>
            {/* Organic soft foliage crown & delicate blossoms along top edge */}
            {Array.from({ length: accents }).map((_, idx) => {
                const zOff = -depth / 2 + 0.45 + idx * ((depth - 0.9) / Math.max(1, accents - 1));
                const xJit = idx % 2 === 0 ? -0.1 : 0.1;
                return (
                    <group key={idx} position={[xJit, 0.84, zOff]}>
                        <mesh scale={[1.2, 0.55, 1.35]}>
                            <sphereGeometry args={[0.28, 10, 8]} />
                            <meshStandardMaterial color={idx % 2 === 0 ? '#5d9054' : '#689b5e'} roughness={0.88} />
                        </mesh>
                        {idx % 2 === 1 && (
                            <mesh position={[0.08, 0.14, 0.04]}>
                                <sphereGeometry args={[0.046, 8, 8]} />
                                <meshStandardMaterial color={idx % 4 === 1 ? '#fff7eb' : '#ff9a5c'} roughness={0.6} />
                            </mesh>
                        )}
                    </group>
                );
            })}
        </group>
    );
}

// Gentle drifting garden fireflies (at Sunset/Night) or subtle sunlit dust motes (at Day)
const AMBIENT_SPECKS = Array.from({ length: 24 }, (_, i) => ({
    x: -18 + ((i * 7.3) % 36),
    y: 0.7 + ((i * 1.17) % 2.4),
    z: -9 + ((i * 5.9) % 23),
    phase: i * 1.37,
    speed: 0.55 + (i % 5) * 0.14,
}));

const FIREFLY_DUMMY = new THREE.Object3D();

const AmbientFireflies = memo(function AmbientFireflies({ timeOfDay }) {
    const instRef = useRef();
    const isNight = timeOfDay === 'night';
    const isSunset = timeOfDay === 'sunset';

    useFrame((state) => {
        const mesh = instRef.current;
        if (!mesh) return;
        const t = state.clock.elapsedTime;
        for (let i = 0; i < AMBIENT_SPECKS.length; i++) {
            const s = AMBIENT_SPECKS[i];
            FIREFLY_DUMMY.position.set(
                s.x + Math.sin(t * s.speed + s.phase) * 0.65,
                s.y + Math.sin(t * (s.speed * 1.4) + s.phase) * 0.35,
                s.z + Math.cos(t * s.speed + s.phase) * 0.65
            );
            const blink = isNight ? 0.5 + 0.5 * Math.sin(t * 2.6 + s.phase * 2) : 0.7;
            FIREFLY_DUMMY.scale.setScalar((isNight ? 1.15 : 0.65) * (0.65 + blink * 0.55));
            FIREFLY_DUMMY.updateMatrix();
            mesh.setMatrixAt(i, FIREFLY_DUMMY.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={instRef} args={[undefined, undefined, AMBIENT_SPECKS.length]} frustumCulled={false}>
            <sphereGeometry args={[0.048, 6, 6]} />
            <meshBasicMaterial
                color={isNight ? '#ffd27d' : (isSunset ? '#ffdfba' : '#ffffff')}
                transparent
                opacity={isNight ? 0.85 : (isSunset ? 0.45 : 0.35)}
                depthWrite={false}
            />
        </instancedMesh>
    );
});

// Gentle expanding water ripple rings on the Koi Pond surface
function PondRipples() {
    const r1 = useRef();
    const r2 = useRef();
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        [r1.current, r2.current].forEach((mesh, idx) => {
            if (!mesh) return;
            const p = (t * 0.38 + idx * 0.5) % 1;
            const sc = 0.35 + p * 1.65;
            mesh.scale.set(sc, sc, 1);
            mesh.material.opacity = (1 - p) * 0.36;
        });
    });
    return (
        <>
            <mesh ref={r1} rotation={[-Math.PI / 2, 0, 0]} position={[15.8, 0.185, -8.3]}>
                <ringGeometry args={[0.45, 0.51, 28]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
            </mesh>
            <mesh ref={r2} rotation={[-Math.PI / 2, 0, 0]} position={[16.5, 0.185, -3.5]}>
                <ringGeometry args={[0.45, 0.51, 28]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
            </mesh>
        </>
    );
}

function SwimmingKoi({ centerX, centerZ, radiusX, radiusZ, speed, phase, color }) {
    const ref = useRef();
    useFrame((state) => {
        if (!ref.current) return;
        const a = state.clock.elapsedTime * speed + phase;
        const x = centerX + Math.cos(a) * radiusX;
        const z = centerZ + Math.sin(a) * radiusZ;
        const dx = -Math.sin(a) * radiusX;
        const dz = Math.cos(a) * radiusZ;
        ref.current.position.set(x, 0.06, z);
        ref.current.rotation.y = Math.atan2(dx, dz);
    });
    return (
        <group ref={ref}>
            <mesh scale={[0.55, 0.35, 1.4]}>
                <sphereGeometry args={[0.16, 10, 8]} />
                <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, -0.24]} rotation={[Math.PI / 2, 0, 0]} scale={[0.4, 0.9, 0.7]}>
                <coneGeometry args={[0.12, 0.18, 4]} />
                <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </mesh>
        </group>
    );
}

function FishTreat({ treat, collected }) {
    const groupRef = useRef();
    useFrame((state) => {
        if (!groupRef.current || collected) return;
        const t = state.clock.elapsedTime;
        groupRef.current.position.y = treat.y + Math.sin(t * 2.8 + treat.x) * 0.12;
        groupRef.current.rotation.y = t * 1.9 + treat.z;
    });

    if (collected) return null;

    return (
        <group ref={groupRef} position={[treat.x, treat.y, treat.z]}>
            <mesh scale={[1.35, 0.72, 0.55]} castShadow>
                <sphereGeometry args={[0.2, 12, 10]} />
                <meshStandardMaterial color="#ff934f" emissive={ACCENT} emissiveIntensity={0.5} roughness={0.25} />
            </mesh>
            <mesh position={[-0.27, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.9, 0.8, 0.35]}>
                <coneGeometry args={[0.14, 0.2, 4]} />
                <meshStandardMaterial color="#ffb074" emissive={ACCENT} emissiveIntensity={0.4} roughness={0.3} />
            </mesh>
            <mesh position={[0.15, 0.04, 0.09]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color="#111111" />
            </mesh>
            <mesh position={[0.15, 0.04, -0.09]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color="#111111" />
            </mesh>
        </group>
    );
}

const MOUSE_SLOTS = [
    { id: 'mouse-1', color: '#9ca3af', golden: false },
    { id: 'mouse-2', color: '#cbd5e1', golden: false },
    { id: 'mouse-gold', color: '#fbbf24', golden: true },
];

function ToyMice({ stateRef, active }) {
    const mouseRefs = useRef([]);
    const keyRefs = useRef([]);
    const compassRef = useRef();

    useFrame((clockState) => {
        if (!active) return;
        const t = clockState.clock.elapsedTime;
        const { cat, arcade } = stateRef.current;
        let nearest = null;
        let bestDist = Infinity;

        for (let i = 0; i < arcade.mice.length; i++) {
            const m = arcade.mice[i];
            const grp = mouseRefs.current[i];
            if (grp) {
                grp.position.set(m.x, 0.14 + Math.abs(Math.sin(t * 10 + i)) * 0.04, m.z);
                grp.rotation.y = m.yaw;
            }
            const key = keyRefs.current[i];
            if (key) key.rotation.y = t * 9;

            const d = Math.hypot(m.x - cat.x, m.z - cat.z);
            if (d < bestDist) {
                bestDist = d;
                nearest = m;
            }
        }

        // Orbiting orange floor arrow pointing straight toward the closest toy mouse
        if (compassRef.current && nearest) {
            const ang = Math.atan2(nearest.x - cat.x, nearest.z - cat.z);
            compassRef.current.position.set(
                cat.x + Math.sin(ang) * 1.15,
                0.08,
                cat.z + Math.cos(ang) * 1.15
            );
            compassRef.current.rotation.y = ang;
            compassRef.current.visible = bestDist > 1.8;
        }
    });

    if (!active) return null;

    return (
        <>
            {MOUSE_SLOTS.map((slot, i) => (
                <group key={slot.id} ref={(el) => { mouseRefs.current[i] = el; }}>
                    {/* Pulsing target beacon ring under mouse */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
                        <ringGeometry args={[0.38, 0.54, 24]} />
                        <meshBasicMaterial color={slot.golden ? '#fbbf24' : '#ff7a30'} transparent opacity={0.85} />
                    </mesh>
                    {/* Rounded toy mouse body */}
                    <mesh scale={[0.78, 0.68, 1.25]} castShadow>
                        <sphereGeometry args={[0.2, 12, 10]} />
                        <meshStandardMaterial
                            color={slot.color}
                            emissive={slot.golden ? '#f59e0b' : '#000000'}
                            emissiveIntensity={slot.golden ? 0.45 : 0}
                            roughness={0.45}
                        />
                    </mesh>
                    {/* Pointy nose */}
                    <mesh position={[0, -0.02, 0.25]}>
                        <sphereGeometry args={[0.045, 8, 8]} />
                        <meshStandardMaterial color="#ff8fab" roughness={0.4} />
                    </mesh>
                    {/* Pink round mouse ears */}
                    {[-0.12, 0.12].map((ex, j) => (
                        <mesh key={j} position={[ex, 0.14, 0.08]} castShadow>
                            <sphereGeometry args={[0.085, 10, 8]} />
                            <meshStandardMaterial color={slot.golden ? '#fde68a' : '#f9a8d4'} roughness={0.6} />
                        </mesh>
                    ))}
                    {/* Spinning wind-up key on back */}
                    <group ref={(el) => { keyRefs.current[i] = el; }} position={[0, 0.19, -0.06]}>
                        <mesh>
                            <boxGeometry args={[0.22, 0.09, 0.03]} />
                            <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.3} />
                        </mesh>
                    </group>
                    {/* Curled wire tail */}
                    <mesh position={[0, 0.02, -0.3]} rotation={[0.5, 0, 0]}>
                        <cylinderGeometry args={[0.015, 0.015, 0.26, 6]} />
                        <meshStandardMaterial color="#f472b6" />
                    </mesh>
                </group>
            ))}

            {/* Guidance chevron around cat pointing to nearest toy mouse */}
            <group ref={compassRef} visible={false}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.18, 0.36, 3]} />
                    <meshBasicMaterial color="#ff7a30" />
                </mesh>
            </group>
        </>
    );
}

function PlayBalls({ stateRef }) {
    const refs = useRef([]);
    useFrame(() => {
        const { balls } = stateRef.current;
        for (let i = 0; i < balls.length; i++) {
            const mesh = refs.current[i];
            const b = balls[i];
            if (!mesh) continue;
            mesh.position.set(b.x, b.r, b.z);
            mesh.rotation.set(b.rotX, 0, b.rotZ);
        }
    });

    return (
        <>
            {INITIAL_BALLS.map((b, i) => (
                <group
                    key={b.id}
                    ref={(el) => { refs.current[i] = el; }}
                    position={[b.x, b.r, b.z]}
                >
                    <mesh castShadow receiveShadow>
                        <sphereGeometry args={[b.r, 18, 16]} />
                        <meshStandardMaterial color={b.color} roughness={0.65} />
                    </mesh>
                    <mesh rotation={[0.5, 0.2, 0]}>
                        <torusGeometry args={[b.r * 0.99, 0.024, 6, 22]} />
                        <meshStandardMaterial color="#1d1f26" roughness={0.8} transparent opacity={0.25} />
                    </mesh>
                    <mesh rotation={[-0.6, 1.1, 0.4]}>
                        <torusGeometry args={[b.r * 0.99, 0.024, 6, 22]} />
                        <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={0.35} />
                    </mesh>
                </group>
            ))}
        </>
    );
}

function RoomZonePad({ zone, active, ringIdle, ringActive, labelTex, onSelectZone }) {
    const ringRef = useRef();
    useFrame((state, dt) => {
        if (!ringRef.current) return;
        const pulse = active ? 1 + Math.sin(state.clock.elapsedTime * 3.4) * 0.035 : 1;
        ringRef.current.scale.set(pulse, pulse, 1);
        ringRef.current.rotation.z += (active ? 0.28 : 0.06) * Math.min(dt, 0.05);
    });

    return (
        <group position={[zone.x, 0.072, zone.z]}>
            {/* Delicate rotating hairline dashed floor medallion */}
            <mesh
                ref={ringRef}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelectZone(zone.id);
                }}
            >
                <planeGeometry args={[3.35, 3.35]} />
                <meshBasicMaterial
                    map={active ? ringActive : ringIdle}
                    transparent
                    depthWrite={false}
                />
            </mesh>
            {/* Refined frosted porcelain architectural floor label */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.006, 1.92]}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelectZone(zone.id);
                }}
            >
                <planeGeometry args={[2.5, 0.62]} />
                <meshBasicMaterial map={labelTex} transparent depthWrite={false} />
            </mesh>
        </group>
    );
}

// Memoized atmosphere & lights so <Environment> PMREM cubemap only bakes when timeOfDay changes
const SceneAtmosphere = memo(function SceneAtmosphere({ timeOfDay }) {
    const preset = TIME_PRESETS[timeOfDay] || TIME_PRESETS.day;
    return (
        <>
            <color attach="background" args={[preset.bg]} />
            <fog attach="fog" args={[preset.bg, preset.fogNear, preset.fogFar]} />

            <Environment resolution={64} frames={1}>
                <Lightformer intensity={1.8 * preset.envIntensity} color={preset.sunColor} position={[8, 12, 8]} scale={[14, 14, 1]} rotation={[-Math.PI / 3, 0, 0]} />
                <Lightformer intensity={1.1 * preset.envIntensity} color={preset.hemiSky} position={[-10, 8, -8]} scale={[16, 10, 1]} rotation={[0, Math.PI / 4, 0]} />
                <Lightformer intensity={0.6 * preset.envIntensity} color="#ffe0c2" position={[0, 4, 12]} scale={[12, 6, 1]} />
            </Environment>
            <ambientLight intensity={preset.ambientIntensity} color={preset.ambientColor} />
            <hemisphereLight args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]} />
            <directionalLight
                position={preset.sunPos}
                intensity={preset.sunIntensity}
                color={preset.sunColor}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-28}
                shadow-camera-right={24}
                shadow-camera-top={22}
                shadow-camera-bottom={-22}
                shadow-camera-near={5}
                shadow-camera-far={80}
                shadow-bias={-0.0005}
            />
            {/* Two broad warm architectural fill lights (West Wing & East Wing) instead of 6 fragment-heavy point lights */}
            <pointLight position={[-13.5, 3.3, -5.8]} color="#ffbc7d" intensity={5.2 * preset.lampBoost} distance={24} decay={1.45} />
            <pointLight position={[5.2, 3.3, -2.0]} color="#ffc994" intensity={4.8 * preset.lampBoost} distance={25} decay={1.45} />
        </>
    );
});

export default function HouseWorld({
    stateRef,
    inputRef,
    activeZoneId,
    collectedIds,
    meowBubble,
    isNapping,
    arcadePlaying,
    projectCount,
    certCount,
    wideCamera,
    zoomScaleRef,
    timeOfDay = 'night',
    onEvents,
    onSelectZone,
    onRequestFeed,
    onCatInteract,
}) {
    const { camera } = useThree();
    const camTarget = useRef(new THREE.Vector3(1.5, 0.6, 0.8));
    const camOffset = useRef(new THREE.Vector3(...CAMERA_OFFSET_CLOSE));
    const tallyLightRef = useRef();
    const playheadRef = useRef();
    const mugRef = useRef();
    const steamRefs = useRef([]);
    const pomPomRef = useRef();
    const mugTipped = useRef(0);
    const textures = useVillaTextures(projectCount, certCount);

    useFrame((clockState, dt) => {
        const events = stepCatWorld(stateRef.current, inputRef.current, dt);
        inputRef.current.jump = false;
        inputRef.current.meow = false;

        const { cat } = stateRef.current;
        if (
            events.jumped ||
            events.meowed ||
            events.collected.length > 0 ||
            events.unlockedZoomies ||
            events.caughtMouse ||
            events.arcadeFinished ||
            events.feedingStarted ||
            events.bowlFilled ||
            events.catAte ||
            events.arrivedZoneId ||
            stateRef.current.activeZoneId !== activeZoneId
        ) {
            onEvents(events, stateRef.current.activeZoneId);
        }

        // Smooth camera follow + gentle scroll-wheel zoom scaling
        const baseOffset = wideCamera ? CAMERA_OFFSET_WIDE : CAMERA_OFFSET_CLOSE;
        const zoomMul = zoomScaleRef ? zoomScaleRef.current : 1;
        const targetOffset = [baseOffset[0] * zoomMul, baseOffset[1] * zoomMul, baseOffset[2] * zoomMul];
        const followStrength = wideCamera ? 0.45 : 0.92;
        const focusX = cat.x * followStrength;
        const focusZ = cat.z * followStrength;
        const focusY = 0.55 + cat.y * 0.25;

        const lerp = 1 - Math.exp(-5.4 * Math.min(dt, 0.05));
        camTarget.current.x += (focusX - camTarget.current.x) * lerp;
        camTarget.current.y += (focusY - camTarget.current.y) * lerp;
        camTarget.current.z += (focusZ - camTarget.current.z) * lerp;

        camOffset.current.x += (targetOffset[0] - camOffset.current.x) * lerp;
        camOffset.current.y += (targetOffset[1] - camOffset.current.y) * lerp;
        camOffset.current.z += (targetOffset[2] - camOffset.current.z) * lerp;

        camera.position.set(
            camTarget.current.x + camOffset.current.x,
            camTarget.current.y + camOffset.current.y,
            camTarget.current.z + camOffset.current.z
        );
        camera.lookAt(camTarget.current);

        if (tallyLightRef.current) {
            tallyLightRef.current.emissiveIntensity = Math.sin(clockState.clock.elapsedTime * 3.5) > 0 ? 2.4 : 0.2;
        }
        // Live animated Premiere timeline playhead sweeping across the right studio monitor
        if (playheadRef.current) {
            const loop = (clockState.clock.elapsedTime * 0.22) % 1;
            playheadRef.current.position.x = -0.94 + loop * 1.88;
        }
        // Knockable orange coffee mug on desk: tips over when Oyen walks into it on the desk!
        if (mugRef.current) {
            const mugDist = Math.hypot(cat.x - 3.35, cat.z - (-10.95));
            if (cat.y > 0.9 && mugDist < 0.72) {
                mugTipped.current = 1;
            }
            const targetRot = mugTipped.current ? Math.PI / 2.1 : 0;
            mugRef.current.rotation.z += (targetRot - mugRef.current.rotation.z) * (1 - Math.exp(-10 * Math.min(dt, 0.05)));
            mugRef.current.position.y = mugTipped.current ? 1.13 : 1.17;
        }
        // Subtle rising steam wisps above hot coffee mug (stops once Oyen knocks it over!)
        for (let i = 0; i < 3; i++) {
            const s = steamRefs.current[i];
            if (!s) continue;
            if (mugTipped.current) {
                s.visible = false;
            } else {
                const p = (clockState.clock.elapsedTime * 0.55 + i / 3) % 1;
                s.visible = true;
                s.position.set(Math.sin(p * 5 + i) * 0.035, 0.14 + p * 0.32, Math.cos(p * 4 + i) * 0.03);
                s.scale.setScalar(0.5 + p * 0.8);
                s.material.opacity = Math.sin(p * Math.PI) * 0.28;
            }
        }
        // Gentle pendulum swing on Cat Tower pom-pom toy
        if (pomPomRef.current) {
            pomPomRef.current.rotation.z = Math.sin(clockState.clock.elapsedTime * 2.1) * 0.14;
        }
    });

    // Memoize the 450+ static villa & furniture meshes so HUD/zone/meow updates never re-reconcile the house
    const staticVilla = useMemo(() => {
        const windowGlass = (TIME_PRESETS[timeOfDay] || TIME_PRESETS.day).windowGlass;
        return (
            <>
            {/* ================= OUTDOOR PROPERTY GROUNDS (TIGHT FLUSH LOT: X -22.5..20.5, Z -13..16.5) ================= */}
            <group>
                {/* Architectural floating land slab — flush with North & West house walls (zero back alley!) */}
                <mesh position={[-1.0, -0.45, 1.75]} receiveShadow>
                    <boxGeometry args={[43.8, 0.9, 30.3]} />
                    <meshStandardMaterial color="#d8d3c8" roughness={0.92} />
                </mesh>

                {/* Crisp sunlit architectural manicured lawn */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.0, 0.002, 1.75]} receiveShadow>
                    <planeGeometry args={[43.2, 29.7]} />
                    <meshStandardMaterial map={textures.grass} roughness={0.94} />
                </mesh>

                {/* Flush Modern Perimeter Garden Walls (continue directly from Bedroom West wall & Studio North wall!) */}
                {/* North garden wall behind Koi Pond (X: 11..20.6, Z: -13.0) */}
                <WallSegment x={15.8} z={-13.0} w={9.8} d={0.38} h={1.85} plasterMap={textures.plaster} />
                {[12.2, 13.0, 13.8, 14.6, 15.4, 16.2, 17.0].map((sx, i) => (
                    <mesh key={i} position={[sx, 1.0, -12.78]}>
                        <boxGeometry args={[0.26, 1.55, 0.08]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.7} />
                    </mesh>
                ))}
                {/* West garden wall continuing South from Bedroom (X: -22.5, Z: -2.5..16.5) */}
                <WallSegment x={-22.5} z={7.0} w={0.38} d={19.4} h={1.65} plasterMap={textures.plaster} />
                {[-1.2, 0.0, 1.2, 2.4, 3.6, 4.8, 6.0, 7.2, 8.4, 9.6].map((sz, i) => (
                    <mesh key={i} position={[-22.26, 0.9, sz]}>
                        <boxGeometry args={[0.08, 1.38, 0.28]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.7} />
                    </mesh>
                ))}
                {/* Low cutaway East & South garden perimeter curbs */}
                <WallSegment x={20.55} z={1.75} w={0.35} d={29.8} h={0.62} plasterMap={textures.plaster} />
                <WallSegment x={-10.15} z={16.55} w={25.0} d={0.35} h={0.62} plasterMap={textures.plaster} />
                <WallSegment x={14.8} z={16.55} w={11.8} d={0.35} h={0.62} plasterMap={textures.plaster} />

                {/* Private Bedroom Balcony Travertine Terrace + Stepping Path to Cedar Deck */}
                <mesh position={[-18.6, 0.035, -0.4]} receiveShadow>
                    <boxGeometry args={[5.8, 0.07, 3.8]} />
                    <meshStandardMaterial color="#ece8df" roughness={0.82} />
                </mesh>
                {[[ -17.6, 2.6 ], [ -16.8, 4.4 ], [ -15.8, 6.0 ]].map(([sx, sz], i) => (
                    <mesh key={i} position={[sx, 0.03, sz]} receiveShadow>
                        <boxGeometry args={[2.1, 0.06, 1.15]} />
                        <meshStandardMaterial color="#ece8df" roughness={0.82} />
                    </mesh>
                ))}

                {/* Modern Curbed Garden Planter Beds (replacing chunky green dodecahedron blobs!) */}
                <GardenPlanterBed position={[-21.55, 0, 4.0]} width={1.2} depth={4.8} />
                <GardenPlanterBed position={[-15.2, 0, 15.5]} width={1.0} depth={4.2} rotationY={Math.PI / 2} />
                <GardenPlanterBed position={[13.2, 0, 15.5]} width={1.0} depth={3.8} rotationY={Math.PI / 2} />

                {/* Cedar Slat Decorative Gate Pillars */}
                {[2.2, 9.0].map((gx, i) => (
                    <mesh key={i} position={[gx, 0.95, 16.55]} castShadow>
                        <boxGeometry args={[0.45, 1.9, 0.45]} />
                        <meshStandardMaterial color={WALL_TRIM} roughness={0.5} />
                    </mesh>
                ))}

                {/* Modern Backyard Cedar Wooden Patio Deck (South-West Outside) */}
                <mesh position={[-9.5, 0.05, 6.1]} receiveShadow>
                    <boxGeometry args={[11.0, 0.1, 6.2]} />
                    <meshStandardMaterial map={textures.deck} roughness={0.8} />
                </mesh>

                {/* Patio Outdoor Bench (Jumpable topY = 0.56) */}
                <group position={[-11.4, 0, 7.1]}>
                    <mesh position={[0, 0.49, 0]} castShadow receiveShadow>
                        <boxGeometry args={[3.6, 0.14, 1.35]} />
                        <meshStandardMaterial color={CEDAR_WOOD} roughness={0.68} />
                    </mesh>
                    {[-1.4, 1.4].map((lx, i) => (
                        <mesh key={i} position={[lx, 0.24, 0]} castShadow>
                            <boxGeometry args={[0.18, 0.48, 1.15]} />
                            <meshStandardMaterial color={WALL_TRIM} roughness={0.5} />
                        </mesh>
                    ))}
                    {/* Orange outdoor seat cushion */}
                    <mesh position={[0.7, 0.6, 0]} castShadow>
                        <boxGeometry args={[1.1, 0.08, 0.95]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.85} />
                    </mesh>
                </group>

                {/* Garden Parkour Stepping Blocks (Jumpable steps 0.52 & 0.96) */}
                <mesh position={[-12.4, 0.26, 12.0]} castShadow receiveShadow>
                    <boxGeometry args={[2.0, 0.52, 1.6]} />
                    <meshStandardMaterial color="#ece8df" roughness={0.8} />
                </mesh>
                <mesh position={[-9.8, 0.48, 12.2]} castShadow receiveShadow>
                    <boxGeometry args={[2.0, 0.96, 1.6]} />
                    <meshStandardMaterial color={OAK_WOOD} roughness={0.72} />
                </mesh>

                {/* Warm Garden String-Light Poles + Hanging Fairy Bulbs on Patio */}
                {[[-14.6, 8.9], [-4.4, 8.9]].map(([px, pz], i) => (
                    <group key={i} position={[px, 0, pz]}>
                        <mesh position={[0, 1.5, 0]} castShadow>
                            <cylinderGeometry args={[0.06, 0.07, 3.0, 8]} />
                            <meshStandardMaterial color={WALL_TRIM} roughness={0.5} />
                        </mesh>
                        <mesh position={[0, 3.05, 0]}>
                            <sphereGeometry args={[0.15, 12, 12]} />
                            <meshStandardMaterial color="#fff0d4" emissive="#ffb463" emissiveIntensity={1.6} />
                        </mesh>
                    </group>
                ))}
                {/* Horizontal string cable + 5 hanging warm Edison bulbs */}
                <mesh position={[-9.5, 2.95, 8.9]}>
                    <boxGeometry args={[10.2, 0.03, 0.03]} />
                    <meshStandardMaterial color={WALL_TRIM} />
                </mesh>
                {[-13.0, -11.25, -9.5, -7.75, -6.0].map((bx, i) => {
                    const sag = Math.sin(((i + 1) / 6) * Math.PI) * 0.26;
                    return (
                        <mesh key={i} position={[bx, 2.84 - sag, 8.9]}>
                            <sphereGeometry args={[0.11, 10, 10]} />
                            <meshStandardMaterial color="#fff5df" emissive="#ffaa52" emissiveIntensity={1.5} />
                        </mesh>
                    );
                })}
                {/* Low slatted cedar coffee table + warm glass patio lantern */}
                <group position={[-7.2, 0, 6.9]}>
                    <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.6, 0.36, 1.1]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.68} />
                    </mesh>
                    {/* Minimalist glass candle lantern */}
                    <mesh position={[0.35, 0.56, -0.15]} castShadow>
                        <cylinderGeometry args={[0.12, 0.13, 0.26, 12]} />
                        <meshStandardMaterial color="#fff3dc" emissive="#ffb057" emissiveIntensity={1.1} transparent opacity={0.85} />
                    </mesh>
                    <mesh position={[0.35, 0.43, -0.15]}>
                        <cylinderGeometry args={[0.14, 0.14, 0.04, 12]} />
                        <meshStandardMaterial color={WALL_TRIM} />
                    </mesh>
                    <mesh position={[0.35, 0.7, -0.15]}>
                        <cylinderGeometry args={[0.14, 0.14, 0.03, 12]} />
                        <meshStandardMaterial color={WALL_TRIM} />
                    </mesh>
                </group>

                {/* Pathway Bollard Lights */}
                {[[3.2, 6.2], [3.2, 11.6], [8.2, 13.4]].map(([lx, lz], i) => (
                    <group key={i} position={[lx, 0, lz]}>
                        <mesh position={[0, 0.36, 0]} castShadow>
                            <cylinderGeometry args={[0.09, 0.11, 0.72, 10]} />
                            <meshStandardMaterial color={WALL_TRIM} roughness={0.45} />
                        </mesh>
                        <mesh position={[0, 0.66, 0]}>
                            <cylinderGeometry args={[0.08, 0.08, 0.12, 10]} />
                            <meshStandardMaterial color="#ffebd2" emissive="#ffa955" emissiveIntensity={1.5} />
                        </mesh>
                    </group>
                ))}

                {/* Front Travertine Stepping-Stone Walkway (cleanly outside the central apron, zero coplanar overlap) */}
                {[4.4, 5.75, 13.1, 14.8].map((pz, i) => (
                    <mesh key={i} position={[5.6, 0.03, pz]} receiveShadow>
                        <boxGeometry args={[3.4, 0.06, 1.15]} />
                        <meshStandardMaterial color="#ebe7de" roughness={0.82} />
                    </mesh>
                ))}
                {/* Patio Lounge Stone Apron around Contact Zone (Z: 6.5..11.9) */}
                <mesh position={[6.0, 0.03, 9.2]} receiveShadow>
                    <boxGeometry args={[7.4, 0.06, 5.4]} />
                    <meshStandardMaterial color="#e7e3d9" roughness={0.86} />
                </mesh>

                {/* Welcome Mat right outside the Front Glass Entrance */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.2, 0.065, 4.4]} receiveShadow>
                    <planeGeometry args={[2.8, 1.35]} />
                    <meshStandardMaterial map={textures.welcomeMat} roughness={0.95} />
                </mesh>

                {/* Modern Matte-Black & Orange Mailbox Post (Outdoor Contact Landmark) */}
                <group position={[9.6, 0, 10.2]}>
                    <mesh position={[0, 0.72, 0]} castShadow>
                        <boxGeometry args={[0.2, 1.44, 0.2]} />
                        <meshStandardMaterial color={WALL_TRIM} roughness={0.45} />
                    </mesh>
                    <mesh position={[0, 1.52, 0]} castShadow>
                        <boxGeometry args={[0.72, 0.46, 0.95]} />
                        <meshStandardMaterial color="#1a1c22" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 1.52, 0.49]}>
                        <boxGeometry args={[0.58, 0.34, 0.05]} />
                        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.35} roughness={0.35} />
                    </mesh>
                    {/* Raised mail flag */}
                    <mesh position={[0.42, 1.72, 0.15]} castShadow>
                        <boxGeometry args={[0.08, 0.38, 0.16]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.4} />
                    </mesh>
                </group>

                {/* ================= EAST ZEN KOI POND & GARDEN ================= */}
                <group>
                    {/* Limestone coping rim */}
                    <mesh position={[16.25, 0.08, -6.0]} receiveShadow>
                        <boxGeometry args={[6.1, 0.16, 9.0]} />
                        <meshStandardMaterial color="#ebe7de" roughness={0.8} />
                    </mesh>
                    {/* Turquoise pond water */}
                    <mesh position={[16.25, 0.12, -6.0]} receiveShadow>
                        <boxGeometry args={[5.4, 0.1, 8.2]} />
                        <meshStandardMaterial color="#48b3c4" roughness={0.18} metalness={0.12} transparent opacity={0.9} />
                    </mesh>
                    {/* Stepping stone bridge across Koi Pond (cat walks across Z = -6.0!) */}
                    {[14.2, 16.25, 18.3].map((sx, i) => (
                        <mesh key={i} position={[sx, 0.16, -6.0]} castShadow receiveShadow>
                            <boxGeometry args={[1.55, 0.12, 1.65]} />
                            <meshStandardMaterial color="#f2efe8" roughness={0.78} />
                        </mesh>
                    ))}
                    {/* Floating lily pads */}
                    {[[14.8, -8.8], [17.8, -8.2], [15.0, -3.4], [17.6, -2.9]].map(([lx, lz], i) => (
                        <mesh key={i} position={[lx, 0.18, lz]} rotation={[-Math.PI / 2, 0, i]}>
                            <circleGeometry args={[0.42, 14, 0, Math.PI * 1.82]} />
                            <meshStandardMaterial color="#4a8a52" roughness={0.7} />
                        </mesh>
                    ))}
                    {/* Animated swimming Koi fish + expanding water ripples */}
                    <SwimmingKoi centerX={16.1} centerZ={-8.4} radiusX={1.6} radiusZ={0.9} speed={0.8} phase={0} color="#ff6b2b" />
                    <SwimmingKoi centerX={16.3} centerZ={-3.5} radiusX={1.5} radiusZ={0.9} speed={-0.72} phase={2.1} color="#fff7ed" />
                    <SwimmingKoi centerX={16.5} centerZ={-8.1} radiusX={1.1} radiusZ={0.7} speed={0.95} phase={4.0} color="#fb923c" />
                    <PondRipples />

                    {/* Natural smooth river boulders accentuating the Koi Pond corners */}
                    {[[13.4, -10.3, 0.48], [13.9, -10.5, 0.32], [19.1, -1.9, 0.44], [18.6, -1.6, 0.28], [13.5, -2.0, 0.36]].map(([rx, rz, rs], i) => (
                        <mesh key={i} position={[rx, rs * 0.48, rz]} scale={[1.25, 0.72, 1.0]} castShadow receiveShadow>
                            <sphereGeometry args={[rs, 12, 10]} />
                            <meshStandardMaterial color={i % 2 === 0 ? '#9ca09e' : '#858a88'} roughness={0.9} />
                        </mesh>
                    ))}

                    {/* Cedar Zen Bench by Koi Pond (Jumpable topY = 0.54) */}
                    <group position={[16.0, 0, 2.3]}>
                        <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
                            <boxGeometry args={[3.5, 0.14, 1.3]} />
                            <meshStandardMaterial color={CEDAR_WOOD} roughness={0.68} />
                        </mesh>
                        {[-1.35, 1.35].map((lx, i) => (
                            <mesh key={i} position={[lx, 0.23, 0]} castShadow>
                                <boxGeometry args={[0.18, 0.46, 1.1]} />
                                <meshStandardMaterial color={WALL_TRIM} roughness={0.5} />
                            </mesh>
                        ))}
                    </group>
                </group>

                {/* 3 Sculpted Corner Architectural Trees in Concrete Planters (zero trees behind house!) */}
                <StylizedTree position={[-20.7, 0, 13.6]} scale={1.12} />
                <StylizedTree position={[18.3, 0, -11.4]} scale={1.08} />
                <StylizedTree position={[17.6, 0, 13.4]} scale={1.15} />
            </group>

            {/* ================= MODERN WHITE HOUSE SHELL (MAIN WING + MASTER BEDROOM WING) ================= */}
            <group>
                {/* Indoor Floors: Warm Oak (Bedroom + West Wing) & Pale Terrazzo (East Wing) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-18.75, 0.025, -7.75]} receiveShadow>
                    <planeGeometry args={[7.5, 10.5]} />
                    <meshStandardMaterial map={textures.oakFloor} roughness={0.75} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.5, 0.025, -5.0]} receiveShadow>
                    <planeGeometry args={[13.0, 16.0]} />
                    <meshStandardMaterial map={textures.oakFloor} roughness={0.75} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.025, -5.0]} receiveShadow>
                    <planeGeometry args={[13.0, 16.0]} />
                    <meshStandardMaterial map={textures.studioFloor} roughness={0.7} />
                </mesh>
                {/* Clean oak architectural floor transition strip between West Oak Wing & East Terrazzo Wing */}
                <mesh position={[-2.0, 0.032, -5.0]} receiveShadow>
                    <boxGeometry args={[0.16, 0.018, 16.0]} />
                    <meshStandardMaterial map={textures.oakGrain} roughness={0.55} />
                </mesh>

                {/* Full Back Walls (North continuous across Bedroom+Main, West Bedroom outer wall) */}
                <WallSegment x={-5.75} z={-13.0} w={33.9} d={0.4} h={4.1} plasterMap={textures.plaster} />
                <WallSegment x={-22.5} z={-7.75} w={0.4} d={10.9} h={4.1} plasterMap={textures.plaster} />

                {/* Cutaway South Bedroom Wall with wide Garden Balcony Door (-20.4..-16.8) */}
                <WallSegment x={-21.55} z={-2.5} w={2.3} d={0.4} h={1.05} plasterMap={textures.plaster} />
                <WallSegment x={-15.9} z={-2.5} w={1.8} d={0.4} h={1.05} plasterMap={textures.plaster} />
                <mesh position={[-18.6, 0.04, -2.5]}>
                    <boxGeometry args={[3.6, 0.06, 0.24]} />
                    <meshStandardMaterial color={WALL_TRIM} roughness={0.4} />
                </mesh>

                {/* Wall between Bedroom Wing & Main Wing with wide open doorway (-6.6..-3.2) */}
                <WallSegment x={-15.0} z={-9.9} w={0.4} d={6.6} h={3.6} plasterMap={textures.plaster} />
                <WallSegment x={-15.0} z={0.0} w={0.4} d={6.4} h={3.6} plasterMap={textures.plaster} />

                {/* Large Modern Sunlit Picture Window on North Living Wall */}
                <group position={[-5.8, 2.35, -12.78]}>
                    <mesh>
                        <boxGeometry args={[4.6, 2.3, 0.12]} />
                        <meshStandardMaterial color={WALL_TRIM} roughness={0.4} />
                    </mesh>
                    {/* Sky glass responds dynamically to Day / Sunset / Night! */}
                    <mesh position={[0, 0, 0.065]}>
                        <planeGeometry args={[4.3, 2.02]} />
                        <meshBasicMaterial color={windowGlass} />
                    </mesh>
                    {/* Subtle diagonal glass reflection kept strictly inside window frame */}
                    <mesh position={[-0.85, 0.04, 0.072]} rotation={[0, 0, -0.32]}>
                        <planeGeometry args={[0.46, 1.84]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={timeOfDay === 'night' ? 0.09 : 0.26} />
                    </mesh>
                    {/* Slim aluminum mullions */}
                    <mesh position={[0, 0, 0.08]}>
                        <boxGeometry args={[0.08, 2.08, 0.04]} />
                        <meshStandardMaterial color={WALL_TRIM} />
                    </mesh>
                    <mesh position={[0, -0.35, 0.08]}>
                        <boxGeometry args={[4.36, 0.06, 0.04]} />
                        <meshStandardMaterial color={WALL_TRIM} />
                    </mesh>
                </group>

                {/* Cutaway Low Modern South Exterior Walls (with 2 wide open sliding doorways!) */}
                <WallSegment x={-12.85} z={3.0} w={4.7} d={0.4} h={1.05} plasterMap={textures.plaster} />
                <WallSegment x={-1.4} z={3.0} w={8.8} d={0.4} h={1.05} plasterMap={textures.plaster} />
                <WallSegment x={9.3} z={3.0} w={3.8} d={0.4} h={1.05} plasterMap={textures.plaster} />
                {/* Sliding door floor tracks */}
                <mesh position={[-8.15, 0.04, 3.0]}>
                    <boxGeometry args={[4.7, 0.06, 0.24]} />
                    <meshStandardMaterial color={WALL_TRIM} roughness={0.4} />
                </mesh>
                <mesh position={[5.2, 0.04, 3.0]}>
                    <boxGeometry args={[4.4, 0.06, 0.24]} />
                    <meshStandardMaterial color={WALL_TRIM} roughness={0.4} />
                </mesh>

                {/* Cutaway Low Modern East Exterior Walls (with sliding patio door to Koi Pond!) */}
                <WallSegment x={11.0} z={-7.85} w={0.4} d={10.7} h={1.05} plasterMap={textures.plaster} />
                <WallSegment x={11.0} z={2.35} w={0.4} d={1.7} h={1.05} plasterMap={textures.plaster} />
                <mesh position={[11.0, 0.04, -0.5]}>
                    <boxGeometry args={[0.24, 0.06, 4.0]} />
                    <meshStandardMaterial color={WALL_TRIM} roughness={0.4} />
                </mesh>

                {/* Interior Partition Walls (Modern White, cutaway height 2.35 for clear visibility) */}
                <WallSegment x={-2.0} z={-11.1} w={0.34} d={3.8} h={2.35} plasterMap={textures.plaster} />
                <WallSegment x={-2.0} z={-4.2} w={0.34} d={2.0} h={2.35} plasterMap={textures.plaster} />
                <WallSegment x={-2.0} z={1.9} w={0.34} d={2.2} h={2.05} plasterMap={textures.plaster} />

                <WallSegment x={-3.75} z={-5.0} w={12.5} d={0.34} h={2.35} plasterMap={textures.plaster} />
                <WallSegment x={8.9} z={-5.0} w={4.2} d={0.34} h={2.05} plasterMap={textures.plaster} />
            </group>

            {/* ================= ROOM 6: MASTER BEDROOM (06 BEDROOM · INDOOR WEST WING) ================= */}
            <group>
                {/* Soft cream plush bedroom rug */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-19.2, 0.032, -8.2]} receiveShadow>
                    <planeGeometry args={[5.6, 6.0]} />
                    <meshStandardMaterial color="#e7e1d7" roughness={0.96} />
                </mesh>

                {/* Modern Platform Queen Bed (Jumpable topY = 0.64!) */}
                <group position={[-20.2, 0, -8.2]}>
                    {/* Oak base platform */}
                    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[4.1, 0.4, 3.3]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.6} />
                    </mesh>
                    {/* Tall slatted oak headboard against West wall */}
                    <mesh position={[-1.96, 0.95, 0]} castShadow>
                        <boxGeometry args={[0.18, 1.5, 3.45]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.58} />
                    </mesh>
                    {/* Plush white mattress + duvet (top at y = 0.64) */}
                    <mesh position={[0.05, 0.52, 0]} castShadow receiveShadow>
                        <boxGeometry args={[3.85, 0.24, 3.05]} />
                        <meshStandardMaterial color="#f8f6f2" roughness={0.9} />
                    </mesh>
                    {/* Folded terracotta-orange throw blanket across foot of bed (Oyen's nap spot!) */}
                    <mesh position={[1.05, 0.645, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.55, 0.06, 3.12]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.86} />
                    </mesh>
                    {/* 2 Fluffy white sleeping pillows + 1 accent cushion */}
                    {[-0.78, 0.78].map((pz, i) => (
                        <mesh key={i} position={[-1.38, 0.74, pz]} rotation={[0, 0, -0.22]} castShadow>
                            <boxGeometry args={[0.62, 0.22, 1.15]} />
                            <meshStandardMaterial color="#ffffff" roughness={0.92} />
                        </mesh>
                    ))}
                    <mesh position={[-0.92, 0.72, 0]} rotation={[0, 0, -0.18]} castShadow>
                        <boxGeometry args={[0.38, 0.2, 0.78]} />
                        <meshStandardMaterial color="#27272a" roughness={0.85} />
                    </mesh>
                </group>

                {/* Two Oak-Top Nightstands with Drawer Seams & Warm Glowing Globe Lamps */}
                {[-10.55, -5.85].map((nz, i) => (
                    <group key={i} position={[-21.6, 0, nz]}>
                        <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
                            <boxGeometry args={[1.05, 0.68, 1.0]} />
                            <meshStandardMaterial color="#f2efe8" roughness={0.68} />
                        </mesh>
                        {/* Clean drawer seam + slim pull */}
                        <mesh position={[0.53, 0.34, 0]}>
                            <boxGeometry args={[0.015, 0.015, 0.94]} />
                            <meshStandardMaterial color="#d2ccc2" />
                        </mesh>
                        {[0.18, 0.5].map((dy, j) => (
                            <mesh key={j} position={[0.54, dy, 0]}>
                                <boxGeometry args={[0.025, 0.025, 0.28]} />
                                <meshStandardMaterial color={WALL_TRIM} metalness={0.4} roughness={0.4} />
                            </mesh>
                        ))}
                        <mesh position={[0, 0.7, 0]} castShadow>
                            <boxGeometry args={[1.1, 0.07, 1.05]} />
                            <meshStandardMaterial map={textures.oakGrain} roughness={0.55} />
                        </mesh>
                        {/* Warm globe bedside lamp with brass collar */}
                        <mesh position={[-0.08, 0.82, 0]}>
                            <cylinderGeometry args={[0.13, 0.16, 0.16, 12]} />
                            <meshStandardMaterial color={WALL_TRIM} roughness={0.4} metalness={0.4} />
                        </mesh>
                        <mesh position={[-0.08, 0.91, 0]}>
                            <cylinderGeometry args={[0.09, 0.09, 0.03, 12]} />
                            <meshStandardMaterial color="#cfa25c" metalness={0.7} roughness={0.25} />
                        </mesh>
                        <mesh position={[-0.08, 1.05, 0]}>
                            <sphereGeometry args={[0.19, 16, 14]} />
                            <meshStandardMaterial color="#fff4e0" emissive="#ffb463" emissiveIntensity={1.45} />
                        </mesh>
                    </group>
                ))}

                {/* Sleek Built-in Modern Wardrobe Closet with Recessed Panel Seams & Oak Plinth */}
                <group position={[-19.7, 0, -12.15]}>
                    {/* Oak toe-kick plinth */}
                    <mesh position={[0, 0.08, -0.04]} receiveShadow>
                        <boxGeometry args={[4.06, 0.16, 1.06]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.6} />
                    </mesh>
                    <mesh position={[0, 1.62, 0]} castShadow receiveShadow>
                        <boxGeometry args={[4.1, 2.96, 1.14]} />
                        <meshStandardMaterial color="#f3f0e8" roughness={0.68} />
                    </mesh>
                    {/* Crisp vertical door seam grooves */}
                    {[-1.02, 0, 1.02].map((sx, i) => (
                        <mesh key={i} position={[sx, 1.62, 0.576]}>
                            <boxGeometry args={[0.02, 2.86, 0.015]} />
                            <meshStandardMaterial color="#d3cec4" />
                        </mesh>
                    ))}
                    {/* Minimalist dark vertical handles */}
                    {[-0.86, -0.16, 0.16, 0.86].map((hx, i) => (
                        <mesh key={i} position={[hx, 1.48, 0.59]}>
                            <boxGeometry args={[0.035, 0.72, 0.035]} />
                            <meshStandardMaterial color={WALL_TRIM} metalness={0.4} roughness={0.35} />
                        </mesh>
                    ))}
                </group>

                {/* Pleated soft linen curtains framing the Bedroom garden balcony door */}
                {[-20.6, -16.6].map((cx, i) => (
                    <group key={i} position={[cx, 0, -2.74]}>
                        {[-0.14, 0, 0.14].map((px, j) => (
                            <mesh key={j} position={[px, 0.52, 0]} castShadow>
                                <cylinderGeometry args={[0.065, 0.075, 0.98, 10]} />
                                <meshStandardMaterial color="#ede8de" roughness={0.92} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Small bedside hardcover book on North nightstand */}
                <mesh position={[-21.45, 0.76, -10.3]} rotation={[0, 0.28, 0]} castShadow>
                    <boxGeometry args={[0.38, 0.055, 0.28]} />
                    <meshStandardMaterial color={ACCENT} roughness={0.65} />
                </mesh>

                {/* Minimalist Geometric Framed Art above Bed Headboard */}
                <group position={[-22.26, 2.55, -8.2]} rotation={[0, Math.PI / 2, 0]}>
                    <mesh>
                        <boxGeometry args={[2.3, 1.45, 0.06]} />
                        <meshStandardMaterial color={WALL_TRIM} roughness={0.5} />
                    </mesh>
                    <mesh position={[0, 0, 0.04]}>
                        <planeGeometry args={[2.1, 1.25]} />
                        <meshBasicMaterial color="#f5efe6" />
                    </mesh>
                    <mesh position={[-0.32, 0.05, 0.048]}>
                        <circleGeometry args={[0.38, 24]} />
                        <meshBasicMaterial color={ACCENT} />
                    </mesh>
                    <mesh position={[0.42, -0.1, 0.048]}>
                        <planeGeometry args={[0.55, 0.72]} />
                        <meshBasicMaterial color="#1d1f26" />
                    </mesh>
                </group>
            </group>

            {/* ================= ROOM 1: LIVING LOUNGE (01 ABOUT · INDOOR NW) ================= */}
            <group>
                {/* Modern woven area rug */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.0, 0.03, -8.5]} receiveShadow>
                    <planeGeometry args={[7.2, 5.4]} />
                    <meshStandardMaterial color="#dcd6cc" roughness={0.96} />
                </mesh>

                {/* Plush Multi-Cushion Modern Sofa (Jumpable topY = 0.68) */}
                <group position={[-13.15, 0, -9.05]}>
                    {/* Slim oak sofa plinth + tapered wooden feet */}
                    <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
                        <boxGeometry args={[2.22, 0.24, 3.96]} />
                        <meshStandardMaterial color="#e6e1d8" roughness={0.88} />
                    </mesh>
                    {[[-0.95, -1.8], [0.95, -1.8], [-0.95, 1.8], [0.95, 1.8]].map(([fx, fz], i) => (
                        <mesh key={i} position={[fx, 0.06, fz]}>
                            <cylinderGeometry args={[0.055, 0.04, 0.12, 8]} />
                            <meshStandardMaterial color={OAK_WOOD} roughness={0.6} />
                        </mesh>
                    ))}
                    {/* 3 Individual Plush Seat Cushions with subtle seam gaps */}
                    {[-1.15, 0, 1.15].map((cz, i) => (
                        <mesh key={i} position={[0.16, 0.5, cz]} castShadow receiveShadow>
                            <boxGeometry args={[1.82, 0.34, 1.1]} />
                            <meshStandardMaterial color="#f5f2eb" roughness={0.86} />
                        </mesh>
                    ))}
                    {/* Backrest frame + 3 plush back cushions */}
                    <mesh position={[-0.86, 0.86, 0]} castShadow>
                        <boxGeometry args={[0.42, 0.94, 3.98]} />
                        <meshStandardMaterial color="#e5e0d7" roughness={0.88} />
                    </mesh>
                    {[-1.12, 0, 1.12].map((cz, i) => (
                        <mesh key={i} position={[-0.56, 0.92, cz]} rotation={[0, 0, -0.14]} castShadow>
                            <boxGeometry args={[0.3, 0.56, 1.06]} />
                            <meshStandardMaterial color="#f2efe8" roughness={0.9} />
                        </mesh>
                    ))}
                    {[-1.85, 1.85].map((az, i) => (
                        <mesh key={i} position={[0.05, 0.66, az]} castShadow>
                            <boxGeometry args={[2.1, 0.54, 0.32]} />
                            <meshStandardMaterial color="#e5e1d8" roughness={0.88} />
                        </mesh>
                    ))}
                    {/* Draped woven orange throw blanket over South armrest */}
                    <mesh position={[0.25, 0.95, 1.85]} castShadow>
                        <boxGeometry args={[1.2, 0.06, 0.42]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.9} />
                    </mesh>
                    <mesh position={[0.25, 0.64, 2.04]} castShadow>
                        <boxGeometry args={[1.18, 0.62, 0.06]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.9} />
                    </mesh>
                    {/* Accent Throw Pillows */}
                    <mesh position={[-0.36, 0.88, -1.25]} rotation={[0.1, 0.2, -0.25]} castShadow>
                        <boxGeometry args={[0.26, 0.44, 0.54]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.8} />
                    </mesh>
                    <mesh position={[-0.36, 0.88, 1.25]} rotation={[-0.1, -0.15, -0.25]} castShadow>
                        <boxGeometry args={[0.26, 0.44, 0.54]} />
                        <meshStandardMaterial color="#27272a" roughness={0.8} />
                    </mesh>
                </group>

                {/* Sculptural Brushed-Brass Arc Floor Lamp cleanly beside South sofa corner (zero clipping!) */}
                <group position={[-14.1, 0, -6.55]}>
                    <mesh position={[0, 0.04, 0]} castShadow>
                        <cylinderGeometry args={[0.26, 0.28, 0.08, 16]} />
                        <meshStandardMaterial color={WALL_TRIM} roughness={0.4} metalness={0.4} />
                    </mesh>
                    <mesh position={[0, 1.15, 0]} castShadow>
                        <cylinderGeometry args={[0.028, 0.034, 2.2, 10]} />
                        <meshStandardMaterial color="#cfa25c" metalness={0.72} roughness={0.22} />
                    </mesh>
                    <mesh position={[0.38, 2.18, -0.22]} rotation={[-0.3, 0, -0.78]} castShadow>
                        <cylinderGeometry args={[0.024, 0.028, 1.08, 8]} />
                        <meshStandardMaterial color="#cfa25c" metalness={0.72} roughness={0.22} />
                    </mesh>
                    <mesh position={[0.72, 2.02, -0.42]} castShadow>
                        <sphereGeometry args={[0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                        <meshStandardMaterial color="#fff3df" emissive="#ffb463" emissiveIntensity={1.25} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* Light Oak Coffee Table (Jumpable topY = 0.52) with Tray, Vase & Magazines */}
                <group position={[-9.45, 0, -9.35]}>
                    <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
                        <boxGeometry args={[2.2, 0.1, 1.65]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.55} />
                    </mesh>
                    {[[-0.95, -0.68], [0.95, -0.68], [-0.95, 0.68], [0.95, 0.68]].map(([lx, lz], i) => (
                        <mesh key={i} position={[lx, 0.22, lz]} castShadow>
                            <cylinderGeometry args={[0.055, 0.045, 0.44, 8]} />
                            <meshStandardMaterial color={WALL_TRIM} roughness={0.4} />
                        </mesh>
                    ))}
                    {/* Dark minimalist tray + mug */}
                    <mesh position={[0.52, 0.535, -0.28]} receiveShadow>
                        <boxGeometry args={[0.72, 0.03, 0.56]} />
                        <meshStandardMaterial color="#252730" roughness={0.5} />
                    </mesh>
                    <mesh position={[0.62, 0.62, -0.32]} castShadow>
                        <cylinderGeometry args={[0.09, 0.08, 0.15, 12]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.3} />
                    </mesh>
                    {/* Ceramic vase + botanical stems */}
                    <mesh position={[-0.55, 0.64, -0.25]} castShadow>
                        <cylinderGeometry args={[0.08, 0.13, 0.24, 14]} />
                        <meshStandardMaterial color="#f5f2eb" roughness={0.4} />
                    </mesh>
                    {[-0.04, 0.04].map((ox, k) => (
                        <mesh key={k} position={[-0.55 + ox, 0.86, -0.25]} rotation={[0.1, 0, ox * 4]}>
                            <cylinderGeometry args={[0.012, 0.015, 0.32, 6]} />
                            <meshStandardMaterial color="#588a50" roughness={0.7} />
                        </mesh>
                    ))}
                    {/* Stacked coffee-table design magazines */}
                    <mesh position={[-0.32, 0.545, 0.35]} rotation={[0, 0.12, 0]} castShadow>
                        <boxGeometry args={[0.68, 0.05, 0.48]} />
                        <meshStandardMaterial color="#f4f1ea" roughness={0.7} />
                    </mesh>
                    <mesh position={[-0.3, 0.585, 0.34]} rotation={[0, -0.08, 0]} castShadow>
                        <boxGeometry args={[0.58, 0.035, 0.42]} />
                        <meshStandardMaterial color="#272932" roughness={0.6} />
                    </mesh>
                </group>

                {/* Architectural Open-Shelf Recessed Bookcase with Oak Shelves, Varied Books & Decor */}
                <group position={[-11.7, 0, -12.15]}>
                    {/* Recessed back panel */}
                    <mesh position={[0, 1.4, -0.44]} receiveShadow>
                        <boxGeometry args={[3.96, 2.76, 0.14]} />
                        <meshStandardMaterial color="#dfd9ce" roughness={0.85} />
                    </mesh>
                    {/* Left, center & right white uprights */}
                    {[-1.94, 0, 1.94].map((ux, i) => (
                        <mesh key={i} position={[ux, 1.4, 0]} castShadow receiveShadow>
                            <boxGeometry args={[0.12, 2.8, 1.02]} />
                            <meshStandardMaterial color="#f3f0e8" roughness={0.7} />
                        </mesh>
                    ))}
                    {/* Bottom closed credenza cabinet + 4 horizontal oak shelves */}
                    <mesh position={[0, 0.3, 0.02]} castShadow receiveShadow>
                        <boxGeometry args={[3.8, 0.56, 0.98]} />
                        <meshStandardMaterial color="#f0ede6" roughness={0.72} />
                    </mesh>
                    {[0.6, 1.32, 2.04, 2.76].map((sy, i) => (
                        <mesh key={i} position={[0, sy, 0]} castShadow receiveShadow>
                            <boxGeometry args={[3.98, 0.08, 1.04]} />
                            <meshStandardMaterial map={textures.oakGrain} roughness={0.58} />
                        </mesh>
                    ))}
                    {/* Books with varied heights & decorative ceramic objects nestled inside alcoves */}
                    {[0.64, 1.36, 2.08].map((sy, r) => (
                        <group key={r} position={[0, sy, 0.18]}>
                            {[-1.55, -1.28, -1.02, -0.76, -0.48, 0.42, 0.7, 0.98, 1.32, 1.58].map((bx, i) => {
                                const h = 0.36 + ((r * 3 + i * 5) % 4) * 0.055;
                                const isDecor = (r === 1 && i === 6) || (r === 2 && i === 2);
                                if (isDecor) {
                                    return (
                                        <mesh key={i} position={[bx, 0.15, 0.06]}>
                                            <sphereGeometry args={[0.14, 10, 8]} />
                                            <meshStandardMaterial color={r === 1 ? ACCENT : '#faf8f4'} roughness={0.35} />
                                        </mesh>
                                    );
                                }
                                return (
                                    <mesh key={i} position={[bx, h / 2, 0]}>
                                        <boxGeometry args={[0.2, h, 0.42]} />
                                        <meshStandardMaterial
                                            color={[ACCENT, '#27272a', '#ffffff', '#c2410c', '#64748b', '#fb923c', '#334155'][(r + i) % 7]}
                                            roughness={0.7}
                                        />
                                    </mesh>
                                );
                            })}
                        </group>
                    ))}
                </group>

                {/* 3D Framed LAUZA. Wall Art on West Living Wall */}
                <group position={[-14.74, 2.4, -9.6]} rotation={[0, Math.PI / 2, 0]}>
                    <mesh position={[0, 0, -0.025]} castShadow>
                        <boxGeometry args={[3.86, 2.46, 0.05]} />
                        <meshStandardMaterial color={WALL_TRIM} roughness={0.45} />
                    </mesh>
                    <mesh position={[0, 0, 0.008]}>
                        <planeGeometry args={[3.7, 2.3]} />
                        <meshBasicMaterial map={textures.poster} />
                    </mesh>
                </group>

                {/* Minimalist Modern Wall Clock on North Wall between Bookshelf & Window */}
                <group position={[-8.6, 2.85, -12.76]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.38, 0.38, 0.05, 24]} />
                        <meshStandardMaterial color="#f8f6f2" roughness={0.5} />
                    </mesh>
                    <mesh position={[0, 0, 0.026]}>
                        <ringGeometry args={[0.35, 0.38, 24]} />
                        <meshStandardMaterial color={WALL_TRIM} />
                    </mesh>
                    <mesh position={[0, 0.08, 0.032]}>
                        <boxGeometry args={[0.025, 0.2, 0.01]} />
                        <meshBasicMaterial color={WALL_TRIM} />
                    </mesh>
                    <mesh position={[0.09, 0.02, 0.032]} rotation={[0, 0, -1.2]}>
                        <boxGeometry args={[0.02, 0.16, 0.01]} />
                        <meshBasicMaterial color={ACCENT} />
                    </mesh>
                </group>

                {/* Warm Cozy Cat Bed */}
                <group position={[-4.2, 0.09, -11.4]}>
                    <mesh castShadow receiveShadow>
                        <torusGeometry args={[0.72, 0.19, 10, 22]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.88} />
                    </mesh>
                    <mesh position={[0, -0.02, 0]} receiveShadow>
                        <cylinderGeometry args={[0.64, 0.68, 0.12, 20]} />
                        <meshStandardMaterial color="#fff6eb" roughness={0.95} />
                    </mesh>
                </group>
            </group>

            {/* ================= ROOM 2: DEV & EDIT STUDIO (02 PROJECTS · INDOOR NE) ================= */}
            <group>
                {/* Warm Studio Area Rug grounding desk & chair */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.3, 0.036, -8.3]} receiveShadow>
                    <planeGeometry args={[6.8, 4.6]} />
                    <meshStandardMaterial color="#e0dbd2" roughness={0.95} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.3, 0.031, -8.3]}>
                    <planeGeometry args={[6.96, 4.76]} />
                    <meshStandardMaterial color="#c4bcb0" roughness={0.95} />
                </mesh>

                {/* Vertical Oak Acoustic Slats flanking Selected Work wall display */}
                {[1.75, 2.25, 2.75, 8.45, 8.95, 9.45].map((sx, i) => (
                    <mesh key={i} position={[sx, 2.35, -12.74]}>
                        <boxGeometry args={[0.24, 3.1, 0.08]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.68} />
                    </mesh>
                ))}

                {/* Modern Oak & Matte-White Creator Desk (Cleanly spaced, zero clipping!) */}
                <group position={[5.6, 0, -11.45]}>
                    {/* Contact shadow grounding under drawers */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.038, 0]}>
                        <planeGeometry args={[8.4, 2.45]} />
                        <meshBasicMaterial color="#000000" transparent opacity={0.11} depthWrite={false} />
                    </mesh>

                    {/* Warm fine-grained oak tabletop */}
                    <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[8.2, 0.14, 2.3]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.52} />
                    </mesh>
                    {/* Soft warm orange bias LED bar behind desk */}
                    <mesh position={[0, 1.04, -1.16]}>
                        <boxGeometry args={[7.2, 0.055, 0.04]} />
                        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.3} />
                    </mesh>

                    {/* Left & Right White ALEX-style Drawer Pedestals with recessed drawer lines */}
                    {[-3.45, 3.45].map((dx, i) => (
                        <group key={i} position={[dx, 0.46, 0]}>
                            <mesh castShadow receiveShadow>
                                <boxGeometry args={[1.15, 0.92, 2.02]} />
                                <meshStandardMaterial color="#f5f2eb" roughness={0.62} />
                            </mesh>
                            {/* Clean horizontal drawer seam lines + slim dark pulls */}
                            {[-0.22, 0.04, 0.3].map((dy, j) => (
                                <group key={j} position={[0, dy, 1.02]}>
                                    <mesh position={[0, -0.1, 0]}>
                                        <boxGeometry args={[1.1, 0.015, 0.015]} />
                                        <meshStandardMaterial color="#d4cfc5" />
                                    </mesh>
                                    <mesh position={[0, 0.01, 0.015]}>
                                        <boxGeometry args={[0.34, 0.028, 0.03]} />
                                        <meshStandardMaterial color={WALL_TRIM} metalness={0.4} roughness={0.35} />
                                    </mesh>
                                </group>
                            ))}
                        </group>
                    ))}

                    {/* Central Dual-Monitor Clamp Arm (replaces chunky twin brick stands) */}
                    <group position={[-0.08, 1.07, -0.82]}>
                        <mesh position={[0, 0.36, 0]} castShadow>
                            <cylinderGeometry args={[0.045, 0.05, 0.72, 12]} />
                            <meshStandardMaterial color="#23252e" metalness={0.65} roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0.62, 0.1]} castShadow>
                            <boxGeometry args={[2.55, 0.055, 0.055]} />
                            <meshStandardMaterial color="#23252e" metalness={0.65} roughness={0.3} />
                        </mesh>
                    </group>

                    {/* Left Code Monitor (clean slim bezel + top monitor lightbar) */}
                    <group position={[-1.32, 1.76, -0.58]} rotation={[0, 0.12, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[2.28, 1.34, 0.075]} />
                            <meshStandardMaterial color="#181920" roughness={0.3} metalness={0.35} />
                        </mesh>
                        <mesh position={[0, 0, 0.045]}>
                            <planeGeometry args={[2.16, 1.22]} />
                            <meshBasicMaterial map={textures.codeScreen} />
                        </mesh>
                        {/* Designer ScreenBar LED lamp on top bezel */}
                        <mesh position={[0, 0.71, 0.06]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.025, 0.025, 1.25, 10]} />
                            <meshStandardMaterial color="#23252e" metalness={0.5} roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0.69, 0.08]}>
                            <boxGeometry args={[1.15, 0.015, 0.02]} />
                            <meshStandardMaterial color="#fff3dc" emissive="#ffd199" emissiveIntensity={1.6} />
                        </mesh>
                    </group>

                    {/* Right Video Editing Timeline Monitor + Single Live Animated Playhead */}
                    <group position={[1.12, 1.76, -0.58]} rotation={[0, -0.12, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[2.28, 1.34, 0.075]} />
                            <meshStandardMaterial color="#181920" roughness={0.3} metalness={0.35} />
                        </mesh>
                        <mesh position={[0, 0, 0.045]}>
                            <planeGeometry args={[2.16, 1.22]} />
                            <meshBasicMaterial map={textures.videoScreen} />
                        </mesh>
                        <mesh ref={playheadRef} position={[0, -0.25, 0.055]}>
                            <boxGeometry args={[0.024, 0.5, 0.008]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                    </group>

                    {/* Deskmat, Detailed Mechanical Keyboard, Wireless Mouse */}
                    <mesh position={[-0.08, 1.078, 0.44]} receiveShadow>
                        <boxGeometry args={[2.9, 0.018, 0.88]} />
                        <meshStandardMaterial color="#1c1e26" roughness={0.92} />
                    </mesh>
                    <group position={[-0.3, 1.105, 0.44]} rotation={[0.06, 0, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[1.16, 0.042, 0.38]} />
                            <meshStandardMaterial color="#d8d4cc" roughness={0.45} metalness={0.2} />
                        </mesh>
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.023, 0]}>
                            <planeGeometry args={[1.12, 0.34]} />
                            <meshBasicMaterial map={textures.keyboardTex} />
                        </mesh>
                    </group>
                    {/* Sculpted wireless mouse */}
                    <mesh position={[0.68, 1.11, 0.48]} scale={[0.85, 0.55, 1.35]} castShadow>
                        <sphereGeometry args={[0.095, 12, 10]} />
                        <meshStandardMaterial color="#252832" roughness={0.35} metalness={0.2} />
                    </mesh>

                    {/* Knockable Ceramic Coffee Mug (with dark coffee inside, handle & rising steam!) */}
                    <group ref={mugRef} position={[-2.25, 1.17, 0.5]}>
                        <mesh castShadow>
                            <cylinderGeometry args={[0.095, 0.086, 0.19, 16]} />
                            <meshStandardMaterial color={ACCENT} roughness={0.25} />
                        </mesh>
                        <mesh position={[0, 0.086, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[0.078, 14]} />
                            <meshStandardMaterial color="#3b2316" roughness={0.2} />
                        </mesh>
                        <mesh position={[0.095, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                            <torusGeometry args={[0.055, 0.016, 8, 14, Math.PI]} />
                            <meshStandardMaterial color={ACCENT} roughness={0.25} />
                        </mesh>
                        {[0, 1, 2].map((idx) => (
                            <mesh key={idx} ref={(el) => { steamRefs.current[idx] = el; }} position={[0, 0.2, 0]}>
                                <sphereGeometry args={[0.04, 8, 6]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.22} depthWrite={false} />
                            </mesh>
                        ))}
                    </group>

                    {/* Clean Low-Profile Desktop Studio Condenser Mic (grounded on desk, zero clipping!) */}
                    <group position={[-2.52, 1.07, -0.02]}>
                        <mesh position={[0, 0.02, 0]} castShadow>
                            <cylinderGeometry args={[0.14, 0.15, 0.04, 14]} />
                            <meshStandardMaterial color="#1d1f27" metalness={0.5} roughness={0.35} />
                        </mesh>
                        <mesh position={[0, 0.14, 0]} castShadow>
                            <cylinderGeometry args={[0.022, 0.022, 0.22, 10]} />
                            <meshStandardMaterial color="#2a2d38" metalness={0.6} roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0.29, 0.02]} rotation={[0.25, 0, 0]} castShadow>
                            <capsuleGeometry args={[0.055, 0.12, 8, 12]} />
                            <meshStandardMaterial color="#181920" roughness={0.45} metalness={0.25} />
                        </mesh>
                        <mesh position={[0, 0.27, 0.02]} rotation={[Math.PI / 2 + 0.25, 0, 0]}>
                            <torusGeometry args={[0.058, 0.009, 8, 16]} />
                            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.85} />
                        </mesh>
                    </group>

                    {/* Left & Right Studio Monitor Speakers (well spaced from monitors & PC tower!) */}
                    {[-3.18, 2.7].map((sx, i) => (
                        <group key={i} position={[sx, 1.42, -0.58]} rotation={[0, sx < 0 ? 0.22 : -0.22, 0]}>
                            <mesh castShadow>
                                <boxGeometry args={[0.48, 0.68, 0.46]} />
                                <meshStandardMaterial color="#1a1c24" roughness={0.48} />
                            </mesh>
                            <mesh position={[0, 0.16, 0.235]}>
                                <circleGeometry args={[0.065, 14]} />
                                <meshStandardMaterial color="#363945" roughness={0.3} metalness={0.4} />
                            </mesh>
                            <mesh position={[0, -0.1, 0.235]}>
                                <circleGeometry args={[0.145, 18]} />
                                <meshStandardMaterial color={ACCENT} roughness={0.38} />
                            </mesh>
                        </group>
                    ))}

                    {/* Custom Tempered-Glass PC Tower (cleanly tucked at far right edge, zero speaker overlap!) */}
                    <group position={[3.62, 1.54, -0.22]}>
                        <mesh castShadow>
                            <boxGeometry args={[0.56, 0.94, 1.08]} />
                            <meshStandardMaterial color="#1a1c24" roughness={0.32} metalness={0.35} />
                        </mesh>
                        <mesh position={[-0.285, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]}>
                            <planeGeometry args={[0.9, 0.74]} />
                            <meshStandardMaterial color="#0d0f15" roughness={0.12} metalness={0.4} />
                        </mesh>
                        {[-0.22, 0.04, 0.3].map((fy, k) => (
                            <mesh key={k} position={[-0.295, fy, -0.32]} rotation={[0, -Math.PI / 2, 0]}>
                                <ringGeometry args={[0.065, 0.095, 16]} />
                                <meshBasicMaterial color={ACCENT} />
                            </mesh>
                        ))}
                        <mesh position={[-0.295, -0.05, 0.12]} rotation={[0, -Math.PI / 2, 0]}>
                            <planeGeometry args={[0.42, 0.07]} />
                            <meshBasicMaterial color={ACCENT} />
                        </mesh>
                    </group>
                </group>

                {/* Animated Lauza Sitting, Standing, Walking & Feeding Oyen! */}
                <LauzaDeskCharacter stateRef={stateRef} onRequestFeed={onRequestFeed} />

                {/* Upgraded East Side Cabinet with Oak Woodgrain Top, Designer Lamp & Layered Plant */}
                <group position={[10.0, 0, -8.2]}>
                    <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.38, 1.04, 3.8]} />
                        <meshStandardMaterial color="#f4f1ea" roughness={0.65} />
                    </mesh>
                    <mesh position={[0, 1.08, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.46, 0.1, 3.88]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.55} />
                    </mesh>
                    {/* Modern Designer Table Lamp (charcoal base + slim brass stem + warm linen shade) */}
                    <group position={[0.05, 1.13, -1.25]}>
                        <mesh position={[0, 0.03, 0]} castShadow>
                            <cylinderGeometry args={[0.16, 0.18, 0.06, 14]} />
                            <meshStandardMaterial color={WALL_TRIM} metalness={0.5} roughness={0.35} />
                        </mesh>
                        <mesh position={[0, 0.22, 0]}>
                            <cylinderGeometry args={[0.025, 0.025, 0.34, 8]} />
                            <meshStandardMaterial color="#d4a359" metalness={0.7} roughness={0.25} />
                        </mesh>
                        <mesh position={[0, 0.44, 0]} castShadow>
                            <cylinderGeometry args={[0.16, 0.25, 0.28, 16]} />
                            <meshStandardMaterial color="#fff3e0" emissive="#ffb463" emissiveIntensity={1.0} roughness={0.8} />
                        </mesh>
                    </group>
                    {/* Stacked hardcover books */}
                    <mesh position={[-0.08, 1.17, 0.25]} castShadow>
                        <boxGeometry args={[0.56, 0.08, 0.72]} />
                        <meshStandardMaterial color="#23252e" roughness={0.65} />
                    </mesh>
                    <mesh position={[-0.08, 1.245, 0.22]} rotation={[0, 0.14, 0]} castShadow>
                        <boxGeometry args={[0.48, 0.07, 0.62]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.55} />
                    </mesh>
                    {/* Ceramic planter with distinct layered green botanical leaves */}
                    <group position={[0.04, 1.13, 1.35]}>
                        <mesh position={[0, 0.13, 0]} castShadow>
                            <cylinderGeometry args={[0.19, 0.14, 0.26, 14]} />
                            <meshStandardMaterial color="#ede9e0" roughness={0.65} />
                        </mesh>
                        <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[0.16, 12]} />
                            <meshStandardMaterial color="#3c2a1e" roughness={0.95} />
                        </mesh>
                        {[0, 1.25, 2.5, 3.75, 5.0].map((ang, k) => (
                            <group key={k} rotation={[0, ang, 0]}>
                                <mesh position={[0.12, 0.36 + (k % 2) * 0.08, 0]} rotation={[0.1, 0, -0.58]} castShadow>
                                    <boxGeometry args={[0.24, 0.02, 0.14]} />
                                    <meshStandardMaterial color={k % 2 === 0 ? '#3d7b50' : '#4e9160'} roughness={0.6} />
                                </mesh>
                            </group>
                        ))}
                    </group>
                </group>

                {/* Framed Selected Work Architectural Wall Sign */}
                <group position={[5.6, 3.35, -12.76]}>
                    <mesh position={[0, 0, -0.025]}>
                        <boxGeometry args={[4.76, 1.62, 0.04]} />
                        <meshStandardMaterial color={WALL_TRIM} roughness={0.45} />
                    </mesh>
                    <mesh>
                        <planeGeometry args={[4.6, 1.48]} />
                        <meshBasicMaterial map={textures.gallerySign} />
                    </mesh>
                </group>
            </group>

            {/* ================= ROOM 3: BROADCAST & CAT PLAYROOM (03 EXPERIENCE · INDOOR SW) ================= */}
            <group>
                {/* Oak Acoustic Slat Accent Wall (stopped cleanly at y = 2.82 so ON AIR plaque above has zero clipping!) */}
                {[-2.4, -1.6, -0.8, 0.0, 0.8, 1.6].map((sz, i) => (
                    <mesh key={i} position={[-14.74, 1.62, sz]} castShadow>
                        <boxGeometry args={[0.09, 2.4, 0.34]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.68} />
                    </mesh>
                ))}

                {/* 3D Framed ON AIR Illuminated Lightbox mounted cleanly ABOVE acoustic slats (y: 3.0..3.52) */}
                <group position={[-14.72, 3.24, -0.4]} rotation={[0, Math.PI / 2, 0]}>
                    <mesh position={[0, 0, -0.04]} castShadow>
                        <boxGeometry args={[1.76, 0.68, 0.09]} />
                        <meshStandardMaterial color="#181920" roughness={0.4} metalness={0.3} />
                    </mesh>
                    <mesh position={[0, 0, 0.012]}>
                        <planeGeometry args={[1.64, 0.56]} />
                        <meshBasicMaterial map={textures.onAirSign} />
                    </mesh>
                </group>

                {/* Upgraded Trophy Credenza with Oak Countertop, Door Seams & Tiered Milestone Trophies */}
                <group position={[-13.85, 0, -0.2]}>
                    <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.56, 1.04, 4.4]} />
                        <meshStandardMaterial color="#f2efe8" roughness={0.68} />
                    </mesh>
                    <mesh position={[0, 1.07, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.64, 0.08, 4.48]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.56} />
                    </mesh>
                    {/* Door panel seam lines + slim dark pulls */}
                    {[-1.1, 0, 1.1].map((dz, i) => (
                        <mesh key={i} position={[0.785, 0.52, dz]}>
                            <boxGeometry args={[0.015, 0.96, 0.015]} />
                            <meshStandardMaterial color="#d2ccc2" />
                        </mesh>
                    ))}
                    {[-1.6, -0.55, 0.55, 1.6].map((hz, i) => (
                        <mesh key={i} position={[0.795, 0.62, hz]}>
                            <boxGeometry args={[0.025, 0.24, 0.025]} />
                            <meshStandardMaterial color={WALL_TRIM} metalness={0.4} roughness={0.35} />
                        </mesh>
                    ))}
                    {/* 3 Tiered Milestone Awards (ABP, Video Clipper, PT GIT Solution) */}
                    {[-1.35, 0, 1.35].map((tz, i) => (
                        <group key={i} position={[0, 1.11, tz]}>
                            {/* Stepped dark granite plinth */}
                            <mesh position={[0, 0.06, 0]} castShadow>
                                <boxGeometry args={[0.42, 0.12, 0.42]} />
                                <meshStandardMaterial color="#232630" roughness={0.35} metalness={0.35} />
                            </mesh>
                            <mesh position={[0, 0.22, 0]} castShadow>
                                <boxGeometry args={[0.3, 0.22, 0.3]} />
                                <meshStandardMaterial color="#181920" roughness={0.3} metalness={0.45} />
                            </mesh>
                            {/* Gold-orange nameplate strip */}
                            <mesh position={[0.156, 0.21, 0]}>
                                <boxGeometry args={[0.015, 0.07, 0.2]} />
                                <meshStandardMaterial color="#d4a359" metalness={0.7} roughness={0.25} />
                            </mesh>
                            {/* Glowing geometric award crystal */}
                            <mesh position={[0, 0.48, 0]} castShadow>
                                <octahedronGeometry args={[0.15, 0]} />
                                <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.65} roughness={0.18} metalness={0.2} />
                            </mesh>
                        </group>
                    ))}
                </group>

                {/* Pro Cinema Camera Rig on Tripod (Matte Box, Top Handle, Side Flip Screen & Tally Light) */}
                <group position={[-11.95, 0, 1.15]} rotation={[0, 2.25, 0]}>
                    {[0, 2.1, 4.2].map((ang, i) => (
                        <mesh
                            key={i}
                            position={[Math.sin(ang) * 0.3, 0.72, Math.cos(ang) * 0.3]}
                            rotation={[Math.cos(ang) * 0.21, 0, -Math.sin(ang) * 0.21]}
                            castShadow
                        >
                            <cylinderGeometry args={[0.032, 0.022, 1.48, 8]} />
                            <meshStandardMaterial color={WALL_TRIM} metalness={0.5} roughness={0.38} />
                        </mesh>
                    ))}
                    {/* Fluid tripod head */}
                    <mesh position={[0, 1.36, 0]} castShadow>
                        <cylinderGeometry args={[0.13, 0.15, 0.12, 12]} />
                        <meshStandardMaterial color="#272932" metalness={0.5} roughness={0.35} />
                    </mesh>
                    {/* Cinema camera body */}
                    <mesh position={[0, 1.58, 0]} castShadow>
                        <boxGeometry args={[0.46, 0.4, 0.72]} />
                        <meshStandardMaterial color="#181920" roughness={0.38} metalness={0.25} />
                    </mesh>
                    {/* Top carry handle */}
                    <mesh position={[0, 1.88, -0.02]} castShadow>
                        <boxGeometry args={[0.08, 0.06, 0.44]} />
                        <meshStandardMaterial color="#252832" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 1.81, 0.14]}>
                        <boxGeometry args={[0.07, 0.12, 0.07]} />
                        <meshStandardMaterial color="#252832" />
                    </mesh>
                    {/* Cine lens barrel + red ring + matte box hood */}
                    <mesh position={[0, 1.56, 0.48]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.15, 0.13, 0.32, 16]} />
                        <meshStandardMaterial color="#252832" roughness={0.3} metalness={0.5} />
                    </mesh>
                    <mesh position={[0, 1.56, 0.54]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.152, 0.012, 8, 20]} />
                        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.4} />
                    </mesh>
                    <mesh position={[0, 1.56, 0.68]} castShadow>
                        <boxGeometry args={[0.38, 0.28, 0.14]} />
                        <meshStandardMaterial color="#14151b" roughness={0.5} />
                    </mesh>
                    {/* Glowing side flip-out field monitor */}
                    <mesh position={[0.34, 1.58, -0.05]} rotation={[0, 0.35, 0]} castShadow>
                        <boxGeometry args={[0.24, 0.18, 0.03]} />
                        <meshStandardMaterial color="#14151b" roughness={0.4} />
                    </mesh>
                    <mesh position={[0.34, 1.58, -0.07]} rotation={[0, Math.PI + 0.35, 0]}>
                        <planeGeometry args={[0.2, 0.14]} />
                        <meshBasicMaterial color="#38bdf8" />
                    </mesh>
                    {/* Blinking red ON AIR tally light */}
                    <mesh position={[0, 1.94, 0.16]}>
                        <sphereGeometry args={[0.05, 10, 10]} />
                        <meshStandardMaterial ref={tallyLightRef} color="#ef4444" emissive="#ef4444" emissiveIntensity={1.6} />
                    </mesh>
                </group>

                {/* Studio Softbox Key Light on Tripod Stand (cleanly spaced in SW corner, zero overlap!) */}
                <group position={[-13.7, 0, 2.35]} rotation={[0, 0.78, 0]}>
                    {[0, 2.1, 4.2].map((ang, i) => (
                        <mesh
                            key={i}
                            position={[Math.sin(ang) * 0.2, 0.52, Math.cos(ang) * 0.2]}
                            rotation={[Math.cos(ang) * 0.18, 0, -Math.sin(ang) * 0.18]}
                        >
                            <cylinderGeometry args={[0.022, 0.018, 1.08, 6]} />
                            <meshStandardMaterial color={WALL_TRIM} metalness={0.5} roughness={0.4} />
                        </mesh>
                    ))}
                    <mesh position={[0, 1.45, 0]}>
                        <cylinderGeometry args={[0.024, 0.024, 0.92, 8]} />
                        <meshStandardMaterial color={WALL_TRIM} metalness={0.5} roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 1.95, 0.08]} rotation={[0.18, 0, 0]} castShadow>
                        <boxGeometry args={[0.76, 0.6, 0.34]} />
                        <meshStandardMaterial color="#181920" roughness={0.55} />
                    </mesh>
                    <mesh position={[0, 1.92, 0.26]} rotation={[0.18, 0, 0]}>
                        <planeGeometry args={[0.66, 0.5]} />
                        <meshStandardMaterial color="#ffffff" emissive="#fff4e0" emissiveIntensity={1.55} />
                    </mesh>
                </group>

                {/* 2-Tier Modern Cat Tower (Jumpable: Tier 1 = 0.68, Tier 2 = 1.32) + Sisal Posts, Bolster Perch & Pom-Pom */}
                <group position={[-4.3, 0, -2.6]}>
                    <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
                        <boxGeometry args={[2.1, 0.16, 1.9]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.72} />
                    </mesh>
                    {/* 3 visible sisal-wrapped scratching posts with oak collars */}
                    {[[-0.72, -0.62], [0.72, -0.62], [0.72, 0.62]].map(([px, pz], i) => (
                        <group key={i} position={[px, 0, pz]}>
                            <mesh position={[0, 0.36, 0]} castShadow>
                                <cylinderGeometry args={[0.135, 0.135, 0.44, 14]} />
                                <meshStandardMaterial color="#d2ae82" roughness={0.96} />
                            </mesh>
                            {[0.21, 0.36, 0.51].map((ry, j) => (
                                <mesh key={j} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]}>
                                    <torusGeometry args={[0.136, 0.012, 6, 14]} />
                                    <meshStandardMaterial color="#b99062" roughness={0.95} />
                                </mesh>
                            ))}
                        </group>
                    ))}
                    {/* Tier 1 oak deck + cream plush pad (topY = 0.68) */}
                    <mesh position={[0, 0.61, 0]} castShadow receiveShadow>
                        <boxGeometry args={[2.1, 0.08, 1.9]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.68} />
                    </mesh>
                    <mesh position={[0, 0.665, 0]} receiveShadow>
                        <boxGeometry args={[1.92, 0.03, 1.72]} />
                        <meshStandardMaterial color="#f5f1e8" roughness={0.92} />
                    </mesh>
                    {/* Upper sisal scratching column */}
                    <mesh position={[-0.2, 0.96, -0.1]} castShadow>
                        <cylinderGeometry args={[0.155, 0.155, 0.56, 14]} />
                        <meshStandardMaterial color="#d2ae82" roughness={0.96} />
                    </mesh>
                    {[0.8, 0.96, 1.12].map((ry, j) => (
                        <mesh key={j} position={[-0.2, ry, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.156, 0.013, 6, 14]} />
                            <meshStandardMaterial color="#b99062" roughness={0.95} />
                        </mesh>
                    ))}
                    {/* Tier 2 cozy orange perch with low side bolsters (floor topY = 1.32) */}
                    <mesh position={[-0.2, 1.26, -0.1]} castShadow receiveShadow>
                        <boxGeometry args={[1.36, 0.12, 1.36]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.68} />
                    </mesh>
                    <mesh position={[-0.2, 1.325, -0.1]} receiveShadow>
                        <boxGeometry args={[1.22, 0.03, 1.22]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.88} />
                    </mesh>
                    {/* Back & side plush perch rims */}
                    <mesh position={[-0.2, 1.4, -0.72]} castShadow>
                        <boxGeometry args={[1.36, 0.16, 0.12]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.88} />
                    </mesh>
                    <mesh position={[-0.82, 1.4, -0.1]} castShadow>
                        <boxGeometry args={[0.12, 0.16, 1.24]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.88} />
                    </mesh>
                    <mesh position={[0.42, 1.4, -0.1]} castShadow>
                        <boxGeometry args={[0.12, 0.16, 1.24]} />
                        <meshStandardMaterial color={ACCENT} roughness={0.88} />
                    </mesh>
                    {/* Swinging string + dangling cream pom-pom ball */}
                    <group ref={pomPomRef} position={[0.38, 1.2, 0.42]}>
                        <mesh position={[0, -0.16, 0]}>
                            <cylinderGeometry args={[0.01, 0.01, 0.32, 6]} />
                            <meshStandardMaterial color="#d4cfc7" />
                        </mesh>
                        <mesh position={[0, -0.33, 0]} castShadow>
                            <sphereGeometry args={[0.075, 10, 10]} />
                            <meshStandardMaterial color="#fff4e6" roughness={0.9} />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* ================= ROOM 4: CERTIFICATE GALLERY & FOYER (04 CERTIFICATES · INDOOR SE) ================= */}
            <group>
                {/* Upgraded Museum Console Cabinet with Oak Countertop & Recessed Doors */}
                <group position={[0.4, 0, -4.15]}>
                    <mesh position={[0, 0.41, 0]} castShadow receiveShadow>
                        <boxGeometry args={[3.26, 0.82, 1.06]} />
                        <meshStandardMaterial color="#f4f1ea" roughness={0.68} />
                    </mesh>
                    <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
                        <boxGeometry args={[3.34, 0.07, 1.12]} />
                        <meshStandardMaterial map={textures.oakGrain} roughness={0.55} />
                    </mesh>
                    {[-0.8, 0.8].map((sx, i) => (
                        <mesh key={i} position={[sx, 0.41, 0.538]}>
                            <boxGeometry args={[0.015, 0.74, 0.015]} />
                            <meshStandardMaterial color="#d2ccc2" />
                        </mesh>
                    ))}
                    {[-1.1, -0.35, 0.35, 1.1].map((hx, i) => (
                        <mesh key={i} position={[hx, 0.52, 0.548]}>
                            <boxGeometry args={[0.025, 0.2, 0.025]} />
                            <meshStandardMaterial color={WALL_TRIM} metalness={0.4} roughness={0.35} />
                        </mesh>
                    ))}
                    {/* 3 Standing Framed Certificates with crisp CanvasTexture art */}
                    {[-1.0, 0, 1.0].map((cx, i) => (
                        <group key={i} position={[cx, 1.18, -0.05]} rotation={[-0.14, 0, 0]}>
                            <mesh castShadow>
                                <boxGeometry args={[0.78, 0.56, 0.065]} />
                                <meshStandardMaterial color={i === 1 ? ACCENT : WALL_TRIM} roughness={0.45} />
                            </mesh>
                            <mesh position={[0, 0, 0.038]}>
                                <planeGeometry args={[0.66, 0.46]} />
                                <meshBasicMaterial map={textures.certFrame} />
                            </mesh>
                        </group>
                    ))}
                </group>

                {/* Certificate Wall Sign mounted cleanly above the frames with clear breathing space */}
                <mesh position={[0.4, 1.88, -4.8]}>
                    <planeGeometry args={[3.1, 0.72]} />
                    <meshBasicMaterial map={textures.certSign} />
                </mesh>

                {/* Gallery Track Spotlight Bar resting structurally on top wall cap (zero overlap from any angle!) */}
                <group position={[0.4, 2.4, -4.85]}>
                    <mesh>
                        <boxGeometry args={[2.8, 0.045, 0.05]} />
                        <meshStandardMaterial color={WALL_TRIM} metalness={0.5} roughness={0.35} />
                    </mesh>
                    {[-1.0, 0, 1.0].map((sx, i) => (
                        <mesh key={i} position={[sx, 0.03, 0.085]} rotation={[0.85, 0, 0]}>
                            <cylinderGeometry args={[0.04, 0.052, 0.12, 10]} />
                            <meshStandardMaterial color={WALL_TRIM} metalness={0.5} roughness={0.35} />
                        </mesh>
                    ))}
                </group>

                {/* Sculpted Foyer Monstera Plant in Ribbed Ceramic Planter (replaces plain spheres!) */}
                <group position={[9.55, 0, 1.9]}>
                    <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.46, 0.34, 0.84, 18]} />
                        <meshStandardMaterial color="#f2efe8" roughness={0.68} />
                    </mesh>
                    <mesh position={[0, 0.83, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.4, 16]} />
                        <meshStandardMaterial color="#3c2b1f" roughness={0.96} />
                    </mesh>
                    {[0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((ang, i) => (
                        <group key={i} rotation={[0, ang, 0]}>
                            <mesh position={[0.14, 1.08 + (i % 3) * 0.16, 0]} rotation={[0, 0, -0.35]}>
                                <cylinderGeometry args={[0.018, 0.024, 0.65, 6]} />
                                <meshStandardMaterial color="#3d6e43" roughness={0.8} />
                            </mesh>
                            <mesh position={[0.34, 1.32 + (i % 3) * 0.18, 0]} rotation={[0.15, 0, -0.62]}>
                                <boxGeometry args={[0.52, 0.025, 0.32]} />
                                <meshStandardMaterial color={i % 2 === 0 ? '#3a7a4d' : '#4a8f5e'} roughness={0.55} />
                            </mesh>
                        </group>
                    ))}
                </group>
            </group>
            </>
        );
    }, [textures, timeOfDay, stateRef, onRequestFeed]);

    return (
        <>
            <SceneAtmosphere timeOfDay={timeOfDay} />
            {staticVilla}

            {/* ================= ZONES, TREATS, PLAY BALLS & ORANGE CAT ================= */}
            {ROOM_ZONES.map((zone) => (
                <RoomZonePad
                    key={zone.id}
                    zone={zone}
                    active={activeZoneId === zone.id}
                    ringIdle={textures.zoneRingIdle}
                    ringActive={textures.zoneRingActive}
                    labelTex={textures.zoneSigns[zone.id]}
                    onSelectZone={onSelectZone}
                />
            ))}

            {INITIAL_TREATS.map((treat) => (
                <FishTreat
                    key={treat.id}
                    treat={treat}
                    collected={collectedIds.includes(treat.id)}
                />
            ))}

            <AmbientFireflies timeOfDay={timeOfDay} />
            <ToyMice stateRef={stateRef} active={arcadePlaying} />
            <PlayBalls stateRef={stateRef} />
            <CatCharacter stateRef={stateRef} meowBubble={meowBubble} isNapping={isNapping} onCatInteract={onCatInteract} />
        </>
    );
}
