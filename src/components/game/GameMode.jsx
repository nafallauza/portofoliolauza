import React, { Component, Suspense, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
    ABOUT_DATA,
    CONTACT_EMAIL,
    CONTACT_SOCIALS,
    CV_URL,
    EXPERIENCE_DATA,
    GITHUB_USER,
    services,
} from '../../data/projects';
import { useItems } from '../../lib/useItems';
import {
    ARCADE_DURATION,
    BEDROOM_BOUNDS,
    CAMERA_OFFSET,
    HOUSE_BOUNDS,
    INITIAL_TREATS,
    ROOM_ZONES,
    WORLD_BOUNDS,
    createInitialWorldState,
    getArcadeRank,
    getLocationLabel,
    isNearLauza,
    navigateCatToZone,
    startArcadeGame,
    stopArcadeGame,
    toggleCatNap,
    triggerCatEmote,
    triggerFeeding,
} from '../../lib/catPhysics';
import HouseWorld from './HouseWorld';
import './GameMode.css';

const MEOW_LINES = ['meow!', 'purr~', 'mrrp!', 'nya~'];
const BABU_LINES = [
    'oi babu beri aku makan!!',
    'babu, mangkok kosong tuh!',
    'berhenti ngedit, kasih makan!',
    'makan dulu baru render, babu!',
];
const DESK_BABU_LINES = [
    'oi babu beri aku makan!!',
    'asdkjfhg— oi babu makan!!',
    'turunin render, kasih whiskas!',
];
const PET_HAPPY_LINES = [
    'prrrrr~ enak babu!',
    'lagi dong elus kepalanya~',
    'purr purr~ ♡',
    'jangan berhenti babu!',
];
const POKE_LINES = [
    'mrrp?! apa babu?',
    'elus dong, bukan colek~',
    'nyaa~ ada apa?',
];
const EMOTE_BUBBLES = {
    roll: 'guling-guling gemoy~',
    stretch: 'ngulet dulu~',
    groom: 'cuci muka dulu~',
    loaf: 'mode roti tawar~',
    chase_tail: 'tangkap ekor!!',
};

// Clean 1.5px stroke monochrome icons (zero OS emoji clutter!)
const IconArrowLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
);
const IconPlay = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6 4.5v15l13-7.5L6 4.5Z" />
    </svg>
);
const IconExpand = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="m21 3-7 7" /><path d="m3 21 7-7" />
    </svg>
);
const IconFish = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 12c2.5-4 7-5.5 11.5-3.5 1.5.7 2.8 1.9 3.5 3.5-.7 1.6-2 2.8-3.5 3.5C13.5 17.5 9 16 6.5 12Z" />
        <path d="M6.5 12 2.5 8.5v7L6.5 12Z" />
        <circle cx="16.5" cy="11.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
);
const IconSound = ({ muted }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5Z" />
        {muted ? (
            <><path d="m22 9-6 6" /><path d="m16 9 6 6" /></>
        ) : (
            <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></>
        )}
    </svg>
);
const IconClose = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);
const IconTime = ({ mode }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {mode === 'night' ? (
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        ) : mode === 'sunset' ? (
            <>
                <path d="M12 10V4" /><path d="m4.9 10.9 1.4 1.4" /><path d="m19.1 10.9-1.4 1.4" />
                <path d="M2 18h20" /><path d="M16 18a4 4 0 0 0-8 0" />
            </>
        ) : (
            <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
            </>
        )}
    </svg>
);
const TIME_ORDER = ['night', 'sunset', 'day'];
const TIME_LABELS = { night: 'Night', sunset: 'Sunset', day: 'Day' };

function createSoundBank() {
    let ctx = null;
    const ensure = () => {
        if (typeof window === 'undefined') return null;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        if (!ctx) ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        return ctx;
    };

    const tone = (freqStart, freqEnd, duration, type = 'triangle', gainPeak = 0.1) => {
        const ac = ensure();
        if (!ac) return;
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, now);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
    };

    return {
        meow() {
            const ac = ensure();
            if (!ac) return;
            const now = ac.currentTime;
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(820, now + 0.09);
            osc.frequency.exponentialRampToValueAtTime(460, now + 0.25);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.11, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.27);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(now);
            osc.stop(now + 0.29);
        },
        jump() {
            tone(280, 440, 0.11, 'sine', 0.06);
        },
        pickup() {
            tone(660, 880, 0.12, 'triangle', 0.09);
            setTimeout(() => tone(990, 1320, 0.16, 'triangle', 0.09), 70);
        },
        zoomies() {
            [523, 659, 784, 1046].forEach((f, idx) => {
                setTimeout(() => tone(f, f * 1.03, 0.18, 'triangle', 0.1), idx * 75);
            });
        },
        catchMouse(combo, golden) {
            const base = 520 + Math.min(combo, 5) * 90;
            tone(base, base * 1.25, 0.11, 'triangle', 0.1);
            if (golden) {
                setTimeout(() => tone(base * 1.4, base * 1.85, 0.18, 'triangle', 0.11), 65);
            }
        },
        pourKibble() {
            [440, 520, 480, 560, 510, 600].forEach((f, idx) => {
                setTimeout(() => tone(f, f * 0.85, 0.05, 'sine', 0.05), idx * 90);
            });
        },
        munch() {
            [380, 460, 420, 520, 660].forEach((f, idx) => {
                setTimeout(() => tone(f, f * 1.12, 0.09, 'triangle', 0.08), idx * 140);
            });
        },
        purr() {
            const ac = ensure();
            if (!ac) return;
            const now = ac.currentTime;
            const osc = ac.createOscillator();
            const lfo = ac.createOscillator();
            const lfoGain = ac.createGain();
            const gain = ac.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(56, now);
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(24, now);
            lfoGain.gain.setValueAtTime(0.035, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.055, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(now);
            lfo.start(now);
            osc.stop(now + 0.48);
            lfo.stop(now + 0.48);
        },
    };
}

const BEST_SCORE_KEY = 'lauza_cat_arcade_best';
function readBestScore() {
    try { return Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0; } catch { return 0; }
}
function saveBestScore(score) {
    try { window.localStorage.setItem(BEST_SCORE_KEY, String(score)); } catch { /* ignore */ }
}

class CanvasErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="game-fallback">
                    <h2 className="game-drawer-title">3D View unavailable on this device</h2>
                    <p className="game-drawer-text">WebGL context could not be started. You can still view the full portfolio in Normal Mode.</p>
                    <button className="game-zone-open-btn" onClick={this.props.onExit}>
                        ← Back to Normal Mode
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function TouchJoystick({ onChange }) {
    const baseRef = useRef(null);
    const pointerIdRef = useRef(null);
    const [knob, setKnob] = useState({ x: 0, y: 0 });
    const maxRadius = 34;

    const updateFromClient = (clientX, clientY) => {
        const rect = baseRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
        }
        setKnob({ x: dx, y: dy });
        onChange(dx / maxRadius, -dy / maxRadius);
    };

    const handleDown = (e) => {
        pointerIdRef.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromClient(e.clientX, e.clientY);
    };

    const handleMove = (e) => {
        if (pointerIdRef.current !== e.pointerId) return;
        updateFromClient(e.clientX, e.clientY);
    };

    const handleUp = (e) => {
        if (pointerIdRef.current !== e.pointerId) return;
        pointerIdRef.current = null;
        setKnob({ x: 0, y: 0 });
        onChange(0, 0);
    };

    return (
        <div
            ref={baseRef}
            className="game-joystick-base"
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
            aria-label="Move cat joystick"
        >
            <div
                className="game-joystick-knob"
                style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
            />
        </div>
    );
}

// Live SVG radar showing L-shaped white house (incl. Bedroom), garden, koi pond, zones, fish treats, toy mice & cat dot.
const MAP_W = 176;
const MAP_H = 132;
const toMapX = (x) => ((x - WORLD_BOUNDS.minX) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)) * MAP_W;
const toMapY = (z) => ((z - WORLD_BOUNDS.minZ) / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ)) * MAP_H;

const MiniMap = memo(function MiniMap({ stateRef, activeZoneId, collectedIds, arcadePlaying, isNight, onWarp }) {
    const catMarkerRef = useRef(null);
    const mouseDotRefs = useRef([]);

    useEffect(() => {
        let rafId = 0;
        let lastTransform = '';
        const tick = () => {
            const { cat, arcade } = stateRef.current;
            if (catMarkerRef.current) {
                const mx = toMapX(cat.x).toFixed(1);
                const my = toMapY(cat.z).toFixed(1);
                const nextT = `translate(${mx}, ${my})`;
                if (nextT !== lastTransform) {
                    catMarkerRef.current.setAttribute('transform', nextT);
                    lastTransform = nextT;
                }
            }
            if (arcade.status === 'playing') {
                for (let i = 0; i < arcade.mice.length; i++) {
                    const el = mouseDotRefs.current[i];
                    const m = arcade.mice[i];
                    if (el && m) {
                        el.setAttribute('cx', toMapX(m.x).toFixed(1));
                        el.setAttribute('cy', toMapY(m.z).toFixed(1));
                    }
                }
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [stateRef]);

    const hx = toMapX(HOUSE_BOUNDS.minX);
    const hy = toMapY(HOUSE_BOUNDS.minZ);
    const hw = toMapX(HOUSE_BOUNDS.maxX) - hx;
    const hh = toMapY(HOUSE_BOUNDS.maxZ) - hy;

    const bx = toMapX(BEDROOM_BOUNDS.minX);
    const by = toMapY(BEDROOM_BOUNDS.minZ);
    const bw = toMapX(BEDROOM_BOUNDS.maxX) - bx;
    const bh = toMapY(BEDROOM_BOUNDS.maxZ) - by;

    const mapPalette = isNight
        ? {
              lawn: '#1c2a23',
              deck: '#5c412a',
              pond: '#215f6e',
              house: '#2a3142',
              houseStroke: '#3f4961',
              divider: '#3d475e',
              roomIdle: '#cbd5e1',
          }
        : {
              lawn: '#dce6d6',
              deck: '#cfa67c',
              pond: '#8fd0db',
              house: '#ffffff',
              houseStroke: '#d4d0c7',
              divider: '#e4e0d8',
              roomIdle: '#3f3f46',
          };

    return (
        <div className="game-minimap hud-surface" aria-label="Villa floorplan minimap">
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width={MAP_W} height={MAP_H}>
                {/* Lawn */}
                <rect x="0" y="0" width={MAP_W} height={MAP_H} rx="6" fill={mapPalette.lawn} />
                {/* Cedar backyard deck */}
                <rect x={toMapX(-14.8)} y={toMapY(3.1)} width={toMapX(-4.0) - toMapX(-14.8)} height={toMapY(9.0) - toMapY(3.1)} rx="2" fill={mapPalette.deck} />
                {/* Koi pond */}
                <rect x={toMapX(13.5)} y={toMapY(-10.2)} width={toMapX(19.0) - toMapX(13.5)} height={toMapY(-1.8) - toMapY(-10.2)} rx="3" fill={mapPalette.pond} />
                {/* Modern White House Main Wing + Master Bedroom Wing */}
                <rect x={bx} y={by} width={bw + 2} height={bh} rx="2" fill={mapPalette.house} stroke={mapPalette.houseStroke} strokeWidth="1" />
                <rect x={hx} y={hy} width={hw} height={hh} rx="2" fill={mapPalette.house} stroke={mapPalette.houseStroke} strokeWidth="1.2" />
                {/* Interior room dividers */}
                <line x1={toMapX(-2)} y1={hy} x2={toMapX(-2)} y2={hy + hh} stroke={mapPalette.divider} strokeWidth="1" strokeDasharray="3 2" />
                <line x1={hx} y1={toMapY(-5)} x2={hx + hw} y2={toMapY(-5)} stroke={mapPalette.divider} strokeWidth="1" strokeDasharray="3 2" />

                {/* Uncollected fish treats */}
                {!arcadePlaying && INITIAL_TREATS.map((t) =>
                    collectedIds.includes(t.id) ? null : (
                        <circle key={t.id} cx={toMapX(t.x)} cy={toMapY(t.z)} r="2.0" fill="#f59e0b" />
                    )
                )}

                {/* Clickable room markers */}
                {ROOM_ZONES.map((z) => (
                    <g key={z.id} className="minimap-zone" onClick={() => onWarp(z.id)}>
                        <circle
                            cx={toMapX(z.x)}
                            cy={toMapY(z.z)}
                            r={activeZoneId === z.id ? 5.2 : 3.6}
                            fill={activeZoneId === z.id ? '#ff7a30' : mapPalette.roomIdle}
                            stroke={isNight ? '#11141e' : '#ffffff'}
                            strokeWidth="1.2"
                        />
                    </g>
                ))}

                {/* Live Toy Mice targets during Arcade mode */}
                {arcadePlaying && [0, 1, 2].map((idx) => (
                    <circle
                        key={idx}
                        ref={(el) => { mouseDotRefs.current[idx] = el; }}
                        cx="0"
                        cy="0"
                        r={idx === 2 ? 4.4 : 3.6}
                        fill={idx === 2 ? '#f59e0b' : '#0284c7'}
                        stroke="#ffffff"
                        strokeWidth="1.2"
                    />
                ))}

                {/* Live cat dot */}
                <g ref={catMarkerRef} transform={`translate(${toMapX(1.5)}, ${toMapY(0.8)})`}>
                    <circle r="4.6" fill="#ff7a30" stroke="#ffffff" strokeWidth="1.8" />
                </g>
            </svg>
        </div>
    );
});

function RoomDrawer({ zone, projects, certificates, status, onClose, onExitToNormal }) {
    const [workTab, setWorkTab] = useState('projects');
    const [playingId, setPlayingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [photoIdx, setPhotoIdx] = useState({});

    if (!zone) return null;

    return (
        <div className="game-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={zone.label}>
            <aside className="game-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="game-drawer-head">
                    <div>
                        <div className="game-drawer-kicker">{zone.index} · {zone.area} · {zone.roomName}</div>
                        <h2 className="game-drawer-title">{zone.label}</h2>
                    </div>
                    <button className="game-drawer-close" onClick={onClose} aria-label="Close panel">
                        <IconClose />
                    </button>
                </div>

                <div className="game-drawer-body">
                    {zone.id === 'about' && (
                        <>
                            <p className="game-drawer-lead">{ABOUT_DATA.headline}</p>
                            <p className="game-drawer-text">{ABOUT_DATA.bio}</p>
                            <div className="game-card">
                                <div className="game-card-meta">CURRENTLY</div>
                                <div className="game-card-title">{ABOUT_DATA.currentRole}</div>
                                <p className="game-drawer-text">{ABOUT_DATA.currentOrg}</p>
                            </div>
                            <div className="game-card">
                                <div className="game-card-meta">TOOLS &amp; STACK</div>
                                <div className="game-tags">
                                    {ABOUT_DATA.skills.map((s) => (
                                        <span key={s} className="game-tag">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="game-links">
                                <a className="game-link-btn" href={CV_URL} download="CV-Nafal-Lauza.pdf">
                                    Download CV (PDF) ↓
                                </a>
                                <a className="game-link-btn" href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">
                                    GitHub · @{GITHUB_USER} ↗
                                </a>
                            </div>
                        </>
                    )}

                    {zone.id === 'projects' && (
                        <>
                            <div className="game-tabs">
                                <button
                                    className={`game-tab ${workTab === 'projects' ? 'active' : ''}`}
                                    onClick={() => setWorkTab('projects')}
                                >
                                    Projects ({status === 'ready' ? projects.length : '–'})
                                </button>
                                <button
                                    className={`game-tab ${workTab === 'services' ? 'active' : ''}`}
                                    onClick={() => setWorkTab('services')}
                                >
                                    Services
                                </button>
                            </div>

                            {workTab === 'projects' && (
                                <>
                                    {status === 'loading' && <p className="game-drawer-text">Loading projects…</p>}
                                    {status === 'error' && <p className="game-drawer-text">Could not load projects from Supabase.</p>}
                                    {status === 'ready' && projects.length === 0 && (
                                        <p className="game-drawer-text">No published projects yet.</p>
                                    )}
                                    {projects.map((item) => {
                                        const isPlaying = playingId === item.id && item.youtubeId;
                                        const isExpanded = expandedId === item.id;
                                        const photos = item.gallery?.length ? item.gallery : (item.imageSrc ? [item.imageSrc] : []);
                                        const activePhoto = photos[photoIdx[item.id] || 0] || item.imageSrc;
                                        const isShortVideo = item.category === 'video';
                                        return (
                                            <article key={item.id} className="game-card">
                                                {isPlaying ? (
                                                    <div className={`game-inline-video ${isShortVideo ? 'is-vertical' : ''}`}>
                                                        <iframe
                                                            src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                                                            title={item.title}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                ) : activePhoto ? (
                                                    <button
                                                        type="button"
                                                        className="game-card-thumb-btn"
                                                        onClick={() => {
                                                            if (item.youtubeId) setPlayingId(item.id);
                                                            else setExpandedId(isExpanded ? null : item.id);
                                                        }}
                                                        aria-label={item.youtubeId ? `Play ${item.title}` : `Inspect ${item.title}`}
                                                    >
                                                        <img src={activePhoto} alt={item.title} className="game-card-thumb" loading="lazy" />
                                                        {item.youtubeId && (
                                                            <span className="game-thumb-play" aria-hidden="true">
                                                                <IconPlay />
                                                            </span>
                                                        )}
                                                    </button>
                                                ) : null}

                                                {photos.length > 1 && !isPlaying && (
                                                    <div className="game-gallery-strip">
                                                        {photos.map((src, idx) => (
                                                            <button
                                                                key={src + idx}
                                                                type="button"
                                                                className={`game-gallery-thumb ${(photoIdx[item.id] || 0) === idx ? 'is-active' : ''}`}
                                                                onClick={() => setPhotoIdx((prev) => ({ ...prev, [item.id]: idx }))}
                                                                aria-label={`Photo ${idx + 1}`}
                                                            >
                                                                <img src={src} alt="" loading="lazy" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="game-card-row">
                                                    <span className="game-card-meta">{item.categoryLabel || item.category}</span>
                                                    {item.date && <span className="game-drawer-text">{item.date}</span>}
                                                </div>
                                                <h3 className="game-card-title">{item.title}</h3>
                                                {item.desc && <p className="game-drawer-text">{isExpanded && item.fullDesc ? item.fullDesc : item.desc}</p>}
                                                <div className="game-links">
                                                    {item.youtubeId && (
                                                        <button
                                                            type="button"
                                                            className="game-link-btn"
                                                            onClick={() => setPlayingId(isPlaying ? null : item.id)}
                                                        >
                                                            {isPlaying ? 'Close Player' : 'Play Inline'}
                                                        </button>
                                                    )}
                                                    {item.fullDesc && item.fullDesc !== item.desc && (
                                                        <button
                                                            type="button"
                                                            className="game-link-btn"
                                                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                                        >
                                                            {isExpanded ? 'Less' : 'Details'}
                                                        </button>
                                                    )}
                                                    {(item.links ?? []).map((l, idx) => (
                                                        <a key={idx} className="game-link-btn" href={l.url} target="_blank" rel="noreferrer">
                                                            {l.label} ↗
                                                        </a>
                                                    ))}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </>
                            )}

                            {workTab === 'services' && (
                                <>
                                    {services.map((svc) => (
                                        <article key={svc.slug} className="game-card">
                                            <h3 className="game-card-title">{svc.title}</h3>
                                            <p className="game-drawer-text">{svc.lead}</p>
                                            <div className="game-tags">
                                                {svc.tags.map((t) => <span key={t} className="game-tag">{t}</span>)}
                                            </div>
                                            <div className="game-links">
                                                <a className="game-link-btn" href={`/work/${svc.slug}`}>
                                                    Browse {svc.title} ↗
                                                </a>
                                            </div>
                                        </article>
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {zone.id === 'certificates' && (
                        <>
                            <p className="game-drawer-text">
                                Verified credentials, trainings and competition certificates.
                            </p>
                            {status === 'loading' && <p className="game-drawer-text">Loading certificates…</p>}
                            {status === 'ready' && certificates.length === 0 && (
                                <p className="game-drawer-text">No certificates published yet.</p>
                            )}
                            {certificates.map((cert) => (
                                <article key={cert.id} className="game-card">
                                    {cert.imageSrc && (
                                        <img src={cert.imageSrc} alt={cert.title} className="game-card-thumb" loading="lazy" />
                                    )}
                                    <div className="game-card-row">
                                        <span className="game-card-meta">{cert.issuer || 'Certificate'}</span>
                                        {cert.date && <span className="game-drawer-text">{cert.date}</span>}
                                    </div>
                                    <h3 className="game-card-title">{cert.title}</h3>
                                    {cert.desc && <p className="game-drawer-text">{cert.desc}</p>}
                                    {cert.link && (
                                        <div className="game-links">
                                            <a className="game-link-btn" href={cert.link} target="_blank" rel="noreferrer">
                                                View Certificate ↗
                                            </a>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </>
                    )}

                    {zone.id === 'experience' && (
                        <>
                            <p className="game-drawer-text">
                                Design, video and frontend work for a startup incubator, a software house and freelance clients.
                            </p>
                            {EXPERIENCE_DATA.map((item) => (
                                <article key={item.id} className="game-card">
                                    <span className="game-card-meta">{item.date}</span>
                                    <h3 className="game-card-title">{item.title}</h3>
                                    <p className="game-drawer-text" style={{ fontWeight: 500 }}>{item.company}</p>
                                    <p className="game-drawer-text">{item.desc}</p>
                                    {item.highlights?.length > 0 && (
                                        <div className="game-tags">
                                            {item.highlights.map((tag) => (
                                                <span key={tag} className="game-tag">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </>
                    )}

                    {zone.id === 'contact' && (
                        <>
                            <p className="game-drawer-lead">Let&apos;s create something together.</p>
                            <p className="game-drawer-text">
                                Open for freelance websites, UI/UX design, and short-form or event video editing.
                            </p>
                            <div className="game-card">
                                <div className="game-card-meta">DIRECT</div>
                                <div className="game-links">
                                    <a className="game-link-btn" href={`mailto:${CONTACT_EMAIL}?subject=Hello%20Lauza`}>
                                        Email · {CONTACT_EMAIL} ↗
                                    </a>
                                </div>
                            </div>
                            <div className="game-card">
                                <div className="game-card-meta">SOCIALS</div>
                                <div className="game-links">
                                    {CONTACT_SOCIALS.map((s) => (
                                        <a key={s.label} className="game-link-btn" href={s.url} target="_blank" rel="noreferrer">
                                            {s.label} ↗
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <button className="game-zone-open-btn" onClick={() => onExitToNormal('#contact')}>
                                Open Contact Form in Normal Mode →
                            </button>
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default function GameMode({ onExit }) {
    const { projects, certificates, status } = useItems();
    const [initialWorld] = useState(createInitialWorldState);
    const stateRef = useRef(initialWorld);

    const inputRef = useRef({ moveX: 0, moveY: 0, sprint: false, jump: false, meow: false });
    const keysRef = useRef(new Set());
    const joyRef = useRef({ x: 0, y: 0 });
    const [sound] = useState(createSoundBank);

    const [activeZoneId, setActiveZoneId] = useState(null);
    const [navTargetId, setNavTargetId] = useState(null);
    const [openZoneId, setOpenZoneId] = useState(null);
    const [collectedIds, setCollectedIds] = useState([]);
    const [zoomies, setZoomies] = useState(false);
    const [wideCamera, setWideCamera] = useState(false);
    const [timeOfDay, setTimeOfDay] = useState('night');
    const zoomScaleRef = useRef(1);
    const [muted, setMuted] = useState(false);
    const [meowBubble, setMeowBubble] = useState(null);
    const [isNapping, setIsNapping] = useState(false);
    const [canAskFeed, setCanAskFeed] = useState(false);
    const [bestScore, setBestScore] = useState(readBestScore);
    const [arcadeHud, setArcadeHud] = useState({
        status: 'idle',
        timeLeft: ARCADE_DURATION,
        score: 0,
        caught: 0,
        combo: 0,
        maxCombo: 0,
    });
    const [locationInfo, setLocationInfo] = useState({ inside: true, name: 'Gallery & Foyer' });
    const [toast, setToast] = useState('Explore the white villa, nap in the Bedroom, or click Play Game (G) to chase Toy Mice!');
    const bubbleTimerRef = useRef(null);
    const toastTimerRef = useRef(null);

    const showToast = useCallback((text, ms = 3200) => {
        setToast(text);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), ms);
    }, []);

    const handleStartArcade = useCallback(() => {
        setOpenZoneId(null);
        setIsNapping(false);
        startArcadeGame(stateRef.current);
        setArcadeHud({
            status: 'playing',
            timeLeft: ARCADE_DURATION,
            score: 0,
            caught: 0,
            combo: 0,
            maxCombo: 0,
        });
        showToast('Mouse Chase started! Follow the orange arrow & minimap dots — Golden Mouse = +250 & +3s!', 3600);
    }, [showToast]);

    const handleStopArcade = useCallback(() => {
        stopArcadeGame(stateRef.current);
        setArcadeHud({
            status: 'idle',
            timeLeft: ARCADE_DURATION,
            score: 0,
            caught: 0,
            combo: 0,
            maxCombo: 0,
        });
    }, []);

    const cycleTimeOfDay = useCallback(() => {
        setTimeOfDay((prev) => TIME_ORDER[(TIME_ORDER.indexOf(prev) + 1) % TIME_ORDER.length]);
    }, []);

    const handleToggleNap = useCallback(() => {
        const nextNap = toggleCatNap(stateRef.current);
        setIsNapping(nextNap);
        if (nextNap) showToast('Oyen is napping on the bed… move or press Space to wake up.', 2600);
    }, [showToast]);

    const handleRequestFeed = useCallback(() => {
        const started = triggerFeeding(stateRef.current);
        if (started) {
            if (!muted) sound.meow();
            setMeowBubble('oi babu beri aku makan!!');
            clearTimeout(bubbleTimerRef.current);
            bubbleTimerRef.current = setTimeout(() => setMeowBubble(null), 2200);
            showToast('Lauza is getting up to feed Oyen!', 2800);
        } else if (stateRef.current.feeding.bowlFull >= 0.85) {
            showToast('Bowl is already full — walk to the bowl beside the desk to eat.', 2400);
        }
    }, [muted, showToast, sound]);

    const triggerMeow = useCallback(() => {
        inputRef.current.meow = true;
    }, []);

    const showCatBubble = useCallback((text, ms = 1800) => {
        setMeowBubble(text);
        clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = setTimeout(() => setMeowBubble(null), ms);
    }, []);

    const handleCatInteract = useCallback((type, payload) => {
        if (type === 'pet_purr') {
            if (!muted) sound.purr();
        } else if (type === 'pet_happy') {
            if (!muted) sound.purr();
            showCatBubble(PET_HAPPY_LINES[Math.floor(Math.random() * PET_HAPPY_LINES.length)], 2000);
        } else if (type === 'pet_roll') {
            if (!muted) sound.purr();
            showCatBubble('guling-guling manja~ ♡', 2400);
        } else if (type === 'poke') {
            if (!muted) sound.meow();
            showCatBubble(POKE_LINES[Math.floor(Math.random() * POKE_LINES.length)], 1600);
        } else if (type === 'emote') {
            if (!muted) sound.jump();
            showCatBubble(EMOTE_BUBBLES[payload] || 'nya~', 1800);
        }
    }, [muted, showCatBubble, sound]);

    const syncMoveFromSources = useCallback(() => {
        const k = keysRef.current;
        const kx = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
        const ky = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
        inputRef.current.moveX = kx !== 0 ? kx : joyRef.current.x;
        inputRef.current.moveY = ky !== 0 ? ky : joyRef.current.y;
        inputRef.current.sprint = k.has('ShiftLeft') || k.has('ShiftRight');
        if (Math.hypot(inputRef.current.moveX, inputRef.current.moveY) > 0.12) {
            setNavTargetId(null);
        }
    }, []);

    useEffect(() => {
        toastTimerRef.current = setTimeout(() => setToast(null), 5000);
        return () => {
            clearTimeout(toastTimerRef.current);
            clearTimeout(bubbleTimerRef.current);
        };
    }, []);

    // Update indoor/outdoor location pill, nap state & arcade timer gently at 5 Hz
    useEffect(() => {
        const id = setInterval(() => {
            const { cat, activeZoneId: zId, arcade } = stateRef.current;
            const next = getLocationLabel(cat.x, cat.z, zId);
            setLocationInfo((prev) =>
                prev.inside === next.inside && prev.name === next.name ? prev : next
            );
            setIsNapping((prev) => (prev === cat.napping ? prev : cat.napping));
            const nextCanFeed =
                isNearLauza(cat.x, cat.z) &&
                stateRef.current.feeding.phase === 'idle' &&
                stateRef.current.feeding.bowlFull < 0.85;
            setCanAskFeed((prev) => (prev === nextCanFeed ? prev : nextCanFeed));
            if (arcade.status === 'playing') {
                setArcadeHud({
                    status: arcade.status,
                    timeLeft: Math.ceil(arcade.timeLeft),
                    score: arcade.score,
                    caught: arcade.caught,
                    combo: arcade.combo,
                    maxCombo: arcade.maxCombo,
                });
            }
        }, 200);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.code === 'Escape') {
                if (openZoneId) setOpenZoneId(null);
                return;
            }
            if (openZoneId) return;

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
            if (e.code === 'Space') {
                inputRef.current.jump = true;
                return;
            }
            if (e.code === 'KeyM') {
                inputRef.current.meow = true;
                return;
            }
            if (e.code === 'KeyR') {
                const emote = triggerCatEmote(stateRef.current);
                handleCatInteract('emote', emote);
                return;
            }
            if (e.code === 'KeyV') {
                zoomScaleRef.current = 1;
                setWideCamera((w) => !w);
                return;
            }
            if (e.code === 'KeyT') {
                cycleTimeOfDay();
                return;
            }
            if (e.code === 'KeyG') {
                if (stateRef.current.arcade.status === 'playing') handleStopArcade();
                else handleStartArcade();
                return;
            }
            if (e.code === 'KeyE' || e.code === 'Enter') {
                if (stateRef.current.arcade.status === 'playing') {
                    inputRef.current.meow = true;
                    return;
                }
                const { cat, feeding, activeZoneId: currentZone } = stateRef.current;
                if (isNearLauza(cat.x, cat.z) && feeding.phase === 'idle' && feeding.bowlFull < 0.85) {
                    handleRequestFeed();
                } else if (currentZone === 'bedroom') {
                    handleToggleNap();
                } else if (currentZone) {
                    setOpenZoneId(currentZone);
                } else {
                    inputRef.current.meow = true;
                }
                return;
            }

            keysRef.current.add(e.code);
            syncMoveFromSources();
        };

        const onKeyUp = (e) => {
            keysRef.current.delete(e.code);
            syncMoveFromSources();
        };

        const onBlur = () => {
            keysRef.current.clear();
            joyRef.current = { x: 0, y: 0 };
            syncMoveFromSources();
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
    }, [openZoneId, syncMoveFromSources, handleStartArcade, handleStopArcade, handleToggleNap, handleRequestFeed, handleCatInteract, cycleTimeOfDay]);

    useEffect(() => {
        if (openZoneId) {
            keysRef.current.clear();
            joyRef.current = { x: 0, y: 0 };
            inputRef.current.moveX = 0;
            inputRef.current.moveY = 0;
            inputRef.current.sprint = false;
        }
    }, [openZoneId]);

    const handleFrameEvents = useCallback((events, nextZoneId) => {
        setActiveZoneId((prev) => (prev !== nextZoneId ? nextZoneId : prev));

        if (events.jumped && !muted) sound.jump();
        if (events.meowed) {
            if (!muted) sound.meow();
            const { cat } = stateRef.current;
            const nearLauza = Math.hypot(cat.x - 5.6, cat.z - (-9.85)) < 5.0;
            const onDesk = cat.y > 0.9 && nearLauza;
            let line;
            if (onDesk) {
                line = DESK_BABU_LINES[Math.floor(Math.random() * DESK_BABU_LINES.length)];
            } else if (nearLauza) {
                line = BABU_LINES[Math.floor(Math.random() * BABU_LINES.length)];
            } else if (stateRef.current.zoomies) {
                line = 'zoomies!';
            } else {
                line = MEOW_LINES[Math.floor(Math.random() * MEOW_LINES.length)];
            }
            setMeowBubble(line);
            clearTimeout(bubbleTimerRef.current);
            bubbleTimerRef.current = setTimeout(() => setMeowBubble(null), nearLauza ? 2200 : 1150);
        }
        if (events.collected.length > 0) {
            setCollectedIds([...stateRef.current.collectedIds]);
            if (events.unlockedZoomies) {
                setZoomies(true);
                if (!muted) sound.zoomies();
                showToast('All 10 fish treats found! Zoomies speed boost unlocked!', 4500);
            } else {
                if (!muted) sound.pickup();
                showToast(`Fish treat collected (${stateRef.current.collectedIds.length}/${INITIAL_TREATS.length})`, 2000);
            }
        }
        if (events.feedingStarted) {
            showToast('Lauza is getting up to feed Oyen!', 2800);
        }
        if (events.bowlFilled) {
            if (!muted) sound.pourKibble();
            showToast('Bowl filled! Walk over to the bowl beside the desk to eat.', 3200);
        }
        if (events.catAte) {
            if (!muted) sound.munch();
            setMeowBubble('nyam nyam~ enak babu!');
            clearTimeout(bubbleTimerRef.current);
            bubbleTimerRef.current = setTimeout(() => setMeowBubble(null), 2200);
            showToast(`Oyen is full! (${stateRef.current.feeding.mealsFed}× fed)`, 2400);
        }
        if (events.caughtMouse) {
            const { golden, points, combo } = events.caughtMouse;
            if (!muted) sound.catchMouse(combo, golden);
            const { arcade } = stateRef.current;
            setArcadeHud({
                status: arcade.status,
                timeLeft: Math.ceil(arcade.timeLeft),
                score: arcade.score,
                caught: arcade.caught,
                combo: arcade.combo,
                maxCombo: arcade.maxCombo,
            });
            showToast(
                golden
                    ? `Golden Mouse! +${points} pts (+3s)`
                    : `Caught! +${points} pts${combo > 1 ? ` · Combo ×${combo}` : ''}`,
                1500
            );
        }
        if (events.arcadeFinished) {
            const { arcade } = stateRef.current;
            if (!muted) sound.zoomies();
            setArcadeHud({
                status: 'finished',
                timeLeft: 0,
                score: arcade.score,
                caught: arcade.caught,
                combo: arcade.combo,
                maxCombo: arcade.maxCombo,
            });
            setBestScore((prev) => {
                if (arcade.score > prev) {
                    saveBestScore(arcade.score);
                    return arcade.score;
                }
                return prev;
            });
        }
        if (events.arrivedZoneId) {
            setNavTargetId(null);
            if (events.openZoneAfterArrive && events.arrivedZoneId !== 'bedroom') {
                setOpenZoneId(events.arrivedZoneId);
            }
        }
    }, [muted, showToast, sound]);

    // Smooth auto-run: Oyen runs across doorways to the clicked zone, then opens the right drawer on arrival
    const handleGoToRoom = useCallback((zoneId, openAfter = true) => {
        setOpenZoneId(null);
        setIsNapping(false);
        setNavTargetId(zoneId);
        navigateCatToZone(stateRef.current, zoneId, openAfter);
    }, []);

    const activeZone = ROOM_ZONES.find((z) => z.id === activeZoneId) || null;
    const openZone = ROOM_ZONES.find((z) => z.id === openZoneId) || null;

    return (
        <div className={`game-shell ${timeOfDay === 'night' ? 'is-night' : ''}`}>
            <div
                className="game-canvas-wrap"
                onWheel={(e) => {
                    if (openZone) return;
                    const next = zoomScaleRef.current + (e.deltaY > 0 ? 0.08 : -0.08);
                    zoomScaleRef.current = Math.max(0.75, Math.min(1.55, next));
                }}
            >
                <CanvasErrorBoundary onExit={() => onExit()}>
                    <Canvas
                        frameloop={openZone ? 'demand' : 'always'}
                        shadows="percentage"
                        dpr={[1, 1.25]}
                        camera={{ position: CAMERA_OFFSET, fov: 38, near: 0.5, far: 150 }}
                        gl={{
                            antialias: true,
                            powerPreference: 'high-performance',
                            toneMapping: THREE.ACESFilmicToneMapping,
                            toneMappingExposure: 1.05,
                        }}
                    >
                        <Suspense fallback={null}>
                            <HouseWorld
                                stateRef={stateRef}
                                inputRef={inputRef}
                                activeZoneId={activeZoneId}
                                collectedIds={collectedIds}
                                meowBubble={meowBubble}
                                isNapping={isNapping}
                                arcadePlaying={arcadeHud.status === 'playing'}
                                projectCount={status === 'ready' ? projects.length : 0}
                                certCount={status === 'ready' ? certificates.length : 0}
                                wideCamera={wideCamera}
                                zoomScaleRef={zoomScaleRef}
                                timeOfDay={timeOfDay}
                                onEvents={handleFrameEvents}
                                onSelectZone={(id) => handleGoToRoom(id, true)}
                                onRequestFeed={handleRequestFeed}
                                onCatInteract={handleCatInteract}
                            />
                        </Suspense>
                    </Canvas>
                </CanvasErrorBoundary>
            </div>

            {/* Top Minimalist Architectural HUD */}
            <header className="game-hud-top">
                <div className="game-hud-group">
                    <button className="hud-btn hud-surface" onClick={() => onExit()}>
                        <IconArrowLeft />
                        <span>Portfolio</span>
                    </button>
                    <div className={`hud-loc hud-surface ${locationInfo.inside ? 'is-inside' : 'is-outside'}`}>
                        <span className="hud-loc-dot" aria-hidden="true" />
                        <span>{locationInfo.name}</span>
                    </div>
                </div>

                {arcadeHud.status === 'playing' ? (
                    <div className="game-arcade-bar hud-surface" role="status">
                        <span className={`arcade-timer ${arcadeHud.timeLeft <= 10 ? 'low' : ''}`}>
                            {arcadeHud.timeLeft}s
                        </span>
                        <span className="arcade-stat">
                            Score <strong>{arcadeHud.score}</strong>
                        </span>
                        <span className="arcade-stat">
                            Mice <strong>{arcadeHud.caught}</strong>
                        </span>
                        {arcadeHud.combo > 1 && (
                            <span className="arcade-combo">×{arcadeHud.combo}</span>
                        )}
                        <button className="arcade-stop-btn" onClick={handleStopArcade}>
                            Stop
                        </button>
                    </div>
                ) : (
                    <nav className="game-rooms-bar hud-surface" aria-label="Villa rooms">
                        {ROOM_ZONES.map((z) => (
                            <button
                                key={z.id}
                                className={`game-room-chip ${activeZoneId === z.id || navTargetId === z.id ? 'active' : ''}`}
                                onClick={() => handleGoToRoom(z.id, true)}
                                title={`${z.area} — ${z.roomName}`}
                            >
                                {z.label}
                            </button>
                        ))}
                    </nav>
                )}

                <div className="hud-utility-dock hud-surface">
                    {arcadeHud.status !== 'playing' && (
                        <>
                            <button
                                className="hud-seg is-primary"
                                onClick={handleStartArcade}
                                title="Play 45s Toy Mouse Chase (G)"
                            >
                                <IconPlay />
                                <span>Play</span>
                            </button>
                            <span className="hud-divider" aria-hidden="true" />
                        </>
                    )}
                    <button
                        className={`hud-seg ${wideCamera ? 'is-active' : ''}`}
                        onClick={() => { zoomScaleRef.current = 1; setWideCamera((w) => !w); }}
                        title="Toggle Wide / Close Camera (V) · Scroll wheel to zoom"
                    >
                        <IconExpand />
                        <span>{wideCamera ? 'Close' : 'Wide'}</span>
                    </button>
                    <span className="hud-divider" aria-hidden="true" />
                    <button
                        className="hud-seg"
                        onClick={cycleTimeOfDay}
                        title={`Lighting: ${TIME_LABELS[timeOfDay]} (Press T to cycle Day / Sunset / Night)`}
                    >
                        <IconTime mode={timeOfDay} />
                        <span>{TIME_LABELS[timeOfDay]}</span>
                    </button>
                    <span className="hud-divider" aria-hidden="true" />
                    <div className={`hud-seg is-stat ${zoomies ? 'zoomies' : ''}`} title="Fish treats collected">
                        <IconFish />
                        <span>{zoomies ? 'Zoomies' : `${collectedIds.length}/${INITIAL_TREATS.length}`}</span>
                    </div>
                    <span className="hud-divider" aria-hidden="true" />
                    <button
                        className="hud-seg is-icon"
                        onClick={() => setMuted((m) => !m)}
                        aria-label={muted ? 'Unmute sound' : 'Mute sound'}
                        title={muted ? 'Unmute sound' : 'Mute sound'}
                    >
                        <IconSound muted={muted} />
                    </button>
                </div>
            </header>

            {toast && <div className="game-toast hud-surface" role="status">{toast}</div>}

            {/* Contextual Bottom Action Prompt (Lauza Feed [E] takes priority when right beside Lauza!) */}
            {(canAskFeed || activeZone) && !openZone && arcadeHud.status === 'idle' && (
                <div className="game-zone-prompt hud-surface">
                    {canAskFeed ? (
                        <>
                            <div className="game-zone-meta">
                                <span className="game-zone-title">Lauza</span>
                                <span className="game-zone-sub">Coding &amp; editing video</span>
                            </div>
                            <div className="game-prompt-actions">
                                <button className="game-zone-open-btn" onClick={handleRequestFeed}>
                                    Feed Oyen <kbd>E</kbd>
                                </button>
                                {activeZone?.id === 'projects' && (
                                    <button className="game-zone-sec-btn" onClick={() => setOpenZoneId('projects')}>
                                        Projects
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="game-zone-meta">
                                <span className="game-zone-title">{activeZone.roomName}</span>
                                <span className="game-zone-sub">{activeZone.area} · {activeZone.hint}</span>
                            </div>
                            {activeZone.id === 'bedroom' ? (
                                <div className="game-prompt-actions">
                                    <button className="game-zone-open-btn" onClick={handleToggleNap}>
                                        {isNapping ? 'Wake Up' : 'Nap on Bed'} <kbd>E</kbd>
                                    </button>
                                    <button className="game-zone-sec-btn" onClick={handleStartArcade}>
                                        <IconPlay />
                                        <span>Mouse Chase</span>
                                    </button>
                                </div>
                            ) : (
                                <button className="game-zone-open-btn" onClick={() => setOpenZoneId(activeZone.id)}>
                                    Open {activeZone.label} <kbd>E</kbd>
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Whisper-quiet Desktop Keybind Legend */}
            <div className="game-controls-hint hud-surface" aria-hidden="true">
                <span><kbd>WASD</kbd> Move</span>
                <span><kbd>Space</kbd> Jump</span>
                <span><kbd>R</kbd> Emote</span>
                <span><kbd>G</kbd> Play</span>
                <span><kbd>T</kbd> Mood</span>
                <span><kbd>V</kbd> View</span>
                <span><kbd>M</kbd> Meow</span>
            </div>

            {/* Live Villa + Yard Minimap (desktop) */}
            {!openZone && (
                <MiniMap
                    stateRef={stateRef}
                    activeZoneId={navTargetId || activeZoneId}
                    collectedIds={collectedIds}
                    arcadePlaying={arcadeHud.status === 'playing'}
                    isNight={timeOfDay === 'night'}
                    onWarp={(id) => handleGoToRoom(id, true)}
                />
            )}

            {/* Mobile virtual joystick & action buttons */}
            {!openZone && arcadeHud.status !== 'finished' && (
                <div className="game-touch-controls">
                    <TouchJoystick
                        onChange={(x, y) => {
                            joyRef.current = { x, y };
                            syncMoveFromSources();
                        }}
                    />
                    <div className="game-touch-actions">
                        {(canAskFeed || activeZone) && arcadeHud.status === 'idle' && (
                            <button
                                className="game-touch-btn primary"
                                onClick={() =>
                                    canAskFeed
                                        ? handleRequestFeed()
                                        : activeZone.id === 'bedroom'
                                            ? handleToggleNap()
                                            : setOpenZoneId(activeZone.id)
                                }
                            >
                                {canAskFeed
                                    ? 'Feed Oyen'
                                    : activeZone.id === 'bedroom'
                                        ? (isNapping ? 'Wake Up' : 'Nap on Bed')
                                        : `Open ${activeZone.label}`}
                            </button>
                        )}
                        <button
                            className="game-touch-btn"
                            onPointerDown={() => { inputRef.current.jump = true; }}
                        >
                            Jump
                        </button>
                        <button
                            className="game-touch-btn"
                            onPointerDown={triggerMeow}
                        >
                            Meow
                        </button>
                    </div>
                </div>
            )}

            {/* Arcade Result Card when 45s round finishes */}
            {arcadeHud.status === 'finished' && (
                <div className="game-arcade-modal-backdrop" role="dialog" aria-modal="true" aria-label="Mouse Chase Results">
                    <div className="game-arcade-modal">
                        <div className="arcade-rank-badge">{getArcadeRank(arcadeHud.score)}</div>
                        <div className="game-drawer-kicker">TOY MOUSE CHASE · TIME UP!</div>
                        <h2 className="game-drawer-title">Score {arcadeHud.score}</h2>
                        <div className="arcade-summary-grid">
                            <div className="arcade-summary-cell">
                                <span>Mice Caught</span>
                                <strong>{arcadeHud.caught}</strong>
                            </div>
                            <div className="arcade-summary-cell">
                                <span>Max Combo</span>
                                <strong>×{Math.max(1, arcadeHud.maxCombo)}</strong>
                            </div>
                            <div className="arcade-summary-cell">
                                <span>Best Score</span>
                                <strong>{bestScore}</strong>
                            </div>
                        </div>
                        <div className="arcade-modal-actions">
                            <button className="game-zone-open-btn" onClick={handleStartArcade}>
                                Play Again
                            </button>
                            <button className="game-zone-sec-btn" onClick={handleStopArcade}>
                                Free Roam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Portfolio Content Drawer */}
            <RoomDrawer
                zone={openZone}
                projects={projects}
                certificates={certificates}
                status={status}
                onClose={() => setOpenZoneId(null)}
                onExitToNormal={(hash) => onExit(hash)}
            />
        </div>
    );
}
