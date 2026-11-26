// Pure simulation for Lauza's Modern White 3D Villa (Indoor + Outdoor + Bedroom + Toy Mouse Arcade).
// Zero Three/DOM imports so `node --test` verifies all physics & game rules deterministically.

// Flush against North (-13.0) and West (-22.5) house walls so Oyen cannot wander behind the house.
export const WORLD_BOUNDS = {
    minX: -22.3,
    maxX: 20.2,
    minZ: -12.8,
    maxZ: 16.2,
};

export const HOUSE_BOUNDS = {
    minX: -15.0,
    maxX: 11.0,
    minZ: -13.0,
    maxZ: 3.0,
};

export const BEDROOM_BOUNDS = {
    minX: -22.5,
    maxX: -15.0,
    minZ: -13.0,
    maxZ: -2.5,
};

export const CAT_RADIUS = 0.52;
export const CAMERA_OFFSET_CLOSE = [11.2, 12.6, 12.2];
export const CAMERA_OFFSET_WIDE = [23.0, 27.5, 24.5];
export const CAMERA_OFFSET = CAMERA_OFFSET_CLOSE;

const camLen = Math.hypot(CAMERA_OFFSET[0], CAMERA_OFFSET[2]);
export const CAM_FORWARD = { x: -CAMERA_OFFSET[0] / camLen, z: -CAMERA_OFFSET[2] / camLen };
export const CAM_RIGHT = { x: -CAM_FORWARD.z, z: CAM_FORWARD.x };

export const ROOM_ZONES = [
    {
        id: 'about',
        index: '01',
        label: 'About',
        roomName: 'Living Lounge',
        area: 'Inside',
        hint: 'Bio, stack & GitHub',
        x: -7.8,
        z: -7.6,
        radius: 3.0,
        warp: { x: -6.8, z: -6.9 },
    },
    {
        id: 'projects',
        index: '02',
        label: 'Projects',
        roomName: 'Dev & Edit Studio',
        area: 'Inside',
        hint: 'Portfolio projects & services',
        x: 4.7,
        z: -7.1,
        radius: 3.1,
        warp: { x: 4.1, z: -6.4 },
    },
    {
        id: 'experience',
        index: '03',
        label: 'Experience',
        roomName: 'Broadcast Room',
        area: 'Inside',
        hint: 'Work & video timeline',
        x: -8.6,
        z: -0.6,
        radius: 3.0,
        warp: { x: -7.8, z: -0.2 },
    },
    {
        id: 'certificates',
        index: '04',
        label: 'Certificates',
        roomName: 'Gallery Hall',
        area: 'Inside',
        hint: 'Credentials & awards',
        x: 4.8,
        z: -0.8,
        radius: 3.0,
        warp: { x: 4.4, z: -0.3 },
    },
    {
        id: 'contact',
        index: '05',
        label: 'Contact',
        roomName: 'Front Yard & Mailbox',
        area: 'Outside',
        hint: 'Socials, WA & email',
        x: 6.0,
        z: 9.2,
        radius: 3.3,
        warp: { x: 5.2, z: 7.4 },
    },
    {
        id: 'bedroom',
        index: '06',
        label: 'Bedroom',
        roomName: 'Master Bedroom',
        area: 'Inside',
        hint: 'Cozy bed nap & mini-game',
        x: -16.9,
        z: -5.4,
        radius: 3.9,
        warp: { x: -16.7, z: -5.2 },
    },
];

// Impassable house walls (wide 3.4-4.7 doorways), furniture, and koi pond edges.
export const SOLID_OBSTACLES = [
    // Outer House Walls (Main Wing X: -15..11, Z: -13..3 + Bedroom Wing X: -22.5..-15, Z: -13..-2.5)
    { id: 'wall-north', minX: -22.7, maxX: 11.2, minZ: -13.25, maxZ: -12.75 },
    // West Bedroom outer wall
    { id: 'wall-bedroom-w', minX: -22.75, maxX: -22.25, minZ: -13.2, maxZ: -2.3 },
    // South Bedroom outer wall with wide garden door (-20.4..-16.8)
    { id: 'wall-bedroom-s-w', minX: -22.7, maxX: -20.4, minZ: -2.75, maxZ: -2.25 },
    { id: 'wall-bedroom-s-e', minX: -16.8, maxX: -15.0, minZ: -2.75, maxZ: -2.25 },
    // Wall separating Bedroom & Main Wing with wide doorway (-6.6..-3.2)
    { id: 'wall-west-n', minX: -15.25, maxX: -14.75, minZ: -13.2, maxZ: -6.6 },
    { id: 'wall-west-s', minX: -15.25, maxX: -14.75, minZ: -3.2, maxZ: 3.2 },
    // South main outer wall with 2 wide sliding/entry doors (-10.5..-5.8 and 3.0..7.4)
    { id: 'wall-south-w', minX: -15.2, maxX: -10.5, minZ: 2.75, maxZ: 3.25 },
    { id: 'wall-south-m', minX: -5.8, maxX: 3.0, minZ: 2.75, maxZ: 3.25 },
    { id: 'wall-south-e', minX: 7.4, maxX: 11.2, minZ: 2.75, maxZ: 3.25 },
    // East outer wall with wide sliding patio door to Koi Pond (-2.5..1.5)
    { id: 'wall-east-n', minX: 10.75, maxX: 11.25, minZ: -13.2, maxZ: -2.5 },
    { id: 'wall-east-s', minX: 10.75, maxX: 11.25, minZ: 1.5, maxZ: 3.2 },

    // Interior Partition Walls (wide archways)
    { id: 'part-ns-n', minX: -2.2, maxX: -1.8, minZ: -13.0, maxZ: -9.2 },
    { id: 'part-ns-m', minX: -2.2, maxX: -1.8, minZ: -5.2, maxZ: -3.2 },
    { id: 'part-ns-s', minX: -2.2, maxX: -1.8, minZ: 0.8, maxZ: 3.0 },
    // Note: West stub omitted so Bedroom/Living/Broadcast share an open corridor hub!
    { id: 'part-ew-m', minX: -10.0, maxX: 2.5, minZ: -5.2, maxZ: -4.8 },
    { id: 'part-ew-e', minX: 6.8, maxX: 11.0, minZ: -5.2, maxZ: -4.8 },

    // Master Bedroom & Main Wing tall / non-walkable solids (tables & cabinets moved to PLATFORMS so cat can jump on them!)
    { id: 'bedroom-wardrobe', minX: -21.8, maxX: -17.6, minZ: -12.75, maxZ: -11.5 },
    { id: 'living-bookshelf', minX: -13.8, maxX: -9.6, minZ: -12.75, maxZ: -11.5 },
    { id: 'studio-monitors-back', minX: 1.4, maxX: 9.8, minZ: -12.75, maxZ: -11.5 },
    { id: 'lauza-chair', minX: 4.9, maxX: 6.3, minZ: -10.1, maxZ: -8.9 },
    { id: 'camera-tripod', minX: -12.6, maxX: -11.3, minZ: 0.5, maxZ: 1.8 },
    { id: 'foyer-plant', minX: 8.8, maxX: 10.3, minZ: 1.2, maxZ: 2.6 },

    // Outdoor Features (Koi Pond deep water + architectural planters & corner trees)
    { id: 'koi-pond-north', minX: 13.5, maxX: 19.0, minZ: -10.2, maxZ: -7.1 },
    { id: 'koi-pond-south', minX: 13.5, maxX: 19.0, minZ: -4.9, maxZ: -1.8 },
    { id: 'front-mailbox', minX: 9.0, maxX: 10.2, minZ: 9.6, maxZ: 10.8 },
    { id: 'west-planter', minX: -22.3, maxX: -20.8, minZ: 1.5, maxZ: 6.5 },
    { id: 'tree-sw', minX: -21.7, maxX: -19.7, minZ: 12.6, maxZ: 14.6 },
    { id: 'tree-ne', minX: 17.3, maxX: 19.3, minZ: -12.4, maxZ: -10.5 },
    { id: 'tree-se', minX: 16.6, maxX: 18.6, minZ: 12.4, maxZ: 14.4 },
];

// Jumpable surfaces: tables, studio desk, cabinets, bed, sofa, 2-tier cat tower, outdoor benches & steps!
export const PLATFORMS = [
    { id: 'master-bed', minX: -22.2, maxX: -18.2, minZ: -9.8, maxZ: -6.6, topY: 0.64 },
    { id: 'nightstand-n', minX: -22.15, maxX: -21.05, minZ: -11.05, maxZ: -10.05, topY: 0.74 },
    { id: 'nightstand-s', minX: -22.15, maxX: -21.05, minZ: -6.35, maxZ: -5.35, topY: 0.74 },
    { id: 'sofa-seat', minX: -14.3, maxX: -12.0, minZ: -11.1, maxZ: -7.0, topY: 0.68 },
    { id: 'coffee-table', minX: -10.6, maxX: -8.3, minZ: -10.2, maxZ: -8.5, topY: 0.52 },
    { id: 'studio-desk', minX: 1.5, maxX: 9.2, minZ: -11.45, maxZ: -10.3, topY: 1.07 },
    { id: 'studio-cabinet', minX: 9.3, maxX: 10.7, minZ: -10.1, maxZ: -6.3, topY: 1.13 },
    { id: 'broadcast-credenza', minX: -14.65, maxX: -13.05, minZ: -2.4, maxZ: 2.0, topY: 1.1 },
    { id: 'gallery-console', minX: -1.25, maxX: 2.05, minZ: -4.7, maxZ: -3.55, topY: 0.88 },
    { id: 'cat-tower-low', minX: -5.4, maxX: -3.2, minZ: -3.6, maxZ: -1.6, topY: 0.68 },
    { id: 'cat-tower-top', minX: -5.2, maxX: -3.8, minZ: -3.4, maxZ: -2.0, topY: 1.32 },
    { id: 'patio-bench', minX: -13.2, maxX: -9.6, minZ: 6.4, maxZ: 7.8, topY: 0.56 },
    { id: 'patio-table', minX: -8.0, maxX: -6.4, minZ: 6.35, maxZ: 7.45, topY: 0.42 },
    { id: 'garden-step-1', minX: -13.4, maxX: -11.4, minZ: 11.2, maxZ: 12.8, topY: 0.52 },
    { id: 'garden-step-2', minX: -10.8, maxX: -8.8, minZ: 11.4, maxZ: 13.0, topY: 0.96 },
    { id: 'koi-bench', minX: 14.2, maxX: 17.8, minZ: 1.6, maxZ: 3.0, topY: 0.54 },
];

export const INITIAL_TREATS = [
    // Inside (6 — including new Bedroom bed!)
    { id: 'treat-bed', x: -19.8, y: 1.04, z: -8.2, label: 'Queen Bed' },
    { id: 'treat-sofa', x: -13.1, y: 1.08, z: -9.0, label: 'Living Sofa' },
    { id: 'treat-studio', x: 2.3, y: 0.48, z: -8.4, label: 'Dev Studio' },
    { id: 'treat-tower', x: -4.5, y: 1.72, z: -2.7, label: 'Cat Tower Top' },
    { id: 'treat-broadcast', x: -11.4, y: 0.48, z: -1.2, label: 'Broadcast Set' },
    { id: 'treat-gallery', x: 8.1, y: 0.48, z: -3.0, label: 'Certificate Hall' },
    // Outside (4)
    { id: 'treat-deck', x: -11.4, y: 0.96, z: 7.1, label: 'Patio Bench' },
    { id: 'treat-agility', x: -9.8, y: 1.36, z: 12.2, label: 'Garden Parkour' },
    { id: 'treat-koi', x: 16.2, y: 0.52, z: -6.0, label: 'Koi Pond Bridge' },
    { id: 'treat-porch', x: 5.2, y: 0.48, z: 5.0, label: 'Front Porch' },
];

export const INITIAL_BALLS = [
    { id: 'yarn-orange', color: '#ff7a30', x: -5.8, z: -7.0, r: 0.36 },
    { id: 'yarn-cream', color: '#f3e8d8', x: 2.2, z: -0.6, r: 0.34 },
    { id: 'garden-ball', color: '#38bdf8', x: -4.2, z: 9.6, r: 0.42 },
];

// Open navigable spawn/wander waypoints across all rooms & outdoor yard for the Toy Mouse Chase mini-game.
export const MOUSE_WAYPOINTS = [
    { x: -16.8, z: -7.5 },  // Bedroom
    { x: -18.5, z: -4.2 },  // Bedroom balcony door
    { x: -8.2, z: -7.0 },   // Living room
    { x: -5.2, z: -9.8 },   // Living north
    { x: 3.4, z: -7.6 },    // Dev studio
    { x: 7.4, z: -7.2 },    // Dev studio east
    { x: -8.8, z: -0.5 },   // Broadcast room
    { x: 4.8, z: -0.6 },    // Gallery hall
    { x: -9.2, z: 5.2 },    // Cedar deck
    { x: -18.5, z: 5.0 },   // West garden
    { x: -5.5, z: 12.0 },   // Backyard lawn
    { x: 5.6, z: 9.4 },     // Front yard
    { x: 13.8, z: 5.5 },    // East garden south
    { x: 16.2, z: -6.0 },   // Koi pond bridge!
];

export const ARCADE_DURATION = 45;
export const BOWL_POS = { x: 3.35, z: -9.35 };
export const LAUZA_DESK_POS = { x: 5.6, z: -9.85 };
export const IDLE_EMOTES = ['roll', 'stretch', 'groom', 'loaf', 'chase_tail'];
const EMOTE_DURATIONS = {
    roll: 3.6,
    stretch: 2.8,
    groom: 3.2,
    loaf: 4.0,
    chase_tail: 2.5,
};

export function isNearLauza(x, z) {
    return Math.hypot(x - LAUZA_DESK_POS.x, z - LAUZA_DESK_POS.z) < 2.65;
}

export function isInsideHouse(x, z) {
    const inMain =
        x >= HOUSE_BOUNDS.minX &&
        x <= HOUSE_BOUNDS.maxX &&
        z >= HOUSE_BOUNDS.minZ &&
        z <= HOUSE_BOUNDS.maxZ;
    const inBedroom =
        x >= BEDROOM_BOUNDS.minX &&
        x < BEDROOM_BOUNDS.maxX &&
        z >= BEDROOM_BOUNDS.minZ &&
        z <= BEDROOM_BOUNDS.maxZ;
    return inMain || inBedroom;
}

export function isOnBed(x, y, z) {
    const bed = PLATFORMS[0];
    return (
        x >= bed.minX - 0.1 &&
        x <= bed.maxX + 0.1 &&
        z >= bed.minZ - 0.1 &&
        z <= bed.maxZ + 0.1 &&
        y >= bed.topY - 0.12
    );
}

export function getLocationLabel(x, z, activeZoneId) {
    if (activeZoneId) {
        const zObj = ROOM_ZONES.find((r) => r.id === activeZoneId);
        if (zObj) return { inside: zObj.area === 'Inside', name: zObj.roomName };
    }
    if (x >= BEDROOM_BOUNDS.minX && x < BEDROOM_BOUNDS.maxX && z >= BEDROOM_BOUNDS.minZ && z <= BEDROOM_BOUNDS.maxZ) {
        return { inside: true, name: 'Master Bedroom' };
    }
    if (isInsideHouse(x, z)) {
        if (x < -2 && z < -5) return { inside: true, name: 'Living Lounge' };
        if (x >= -2 && z < -5) return { inside: true, name: 'Dev & Edit Studio' };
        if (x < -2 && z >= -5) return { inside: true, name: 'Broadcast Room' };
        return { inside: true, name: 'Gallery & Foyer' };
    }
    if (x > 11.2 && z < 4) return { inside: false, name: 'Koi Pond Garden' };
    if (z > 3 && x < 2) return { inside: false, name: 'Backyard Deck & Lawn' };
    if (z > 3 && x >= 2) return { inside: false, name: 'Front Walkway' };
    return { inside: false, name: 'Garden Path' };
}

function pickDistantWaypoint(avoidX, avoidZ, seed) {
    const candidates = MOUSE_WAYPOINTS.filter((p) => Math.hypot(p.x - avoidX, p.z - avoidZ) > 6.5);
    const pool = candidates.length ? candidates : MOUSE_WAYPOINTS;
    const idx = Math.abs(Math.floor(seed)) % pool.length;
    return pool[idx];
}

function createMouse(id, startIdx, color) {
    const wp = MOUSE_WAYPOINTS[startIdx % MOUSE_WAYPOINTS.length];
    const nextWp = MOUSE_WAYPOINTS[(startIdx + 3) % MOUSE_WAYPOINTS.length];
    return {
        id,
        color,
        x: wp.x,
        z: wp.z,
        vx: 0,
        vz: 0,
        yaw: 0,
        targetX: nextWp.x,
        targetZ: nextWp.z,
        wpSeed: startIdx + 5,
        golden: id === 'mouse-gold',
    };
}

export function createInitialWorldState() {
    return {
        cat: {
            x: 1.5,
            y: 0.0,
            z: 0.8,
            vx: 0,
            vy: 0,
            vz: 0,
            yaw: Math.PI * 0.12,
            grounded: true,
            speed: 0,
            walkCycle: 0,
            meowTimer: 0,
            jumpCooldown: 0,
            eatingTimer: 0,
            napping: false,
            idleTime: 0,
            emote: null,
            emoteTimer: 0,
            emoteDuration: 0,
            emoteCursor: 0,
            petTimer: 0,
            petStreak: 0,
            petTilt: 0,
        },
        balls: INITIAL_BALLS.map((b) => ({ ...b, vx: 0, vz: 0, rotX: 0, rotZ: 0 })),
        collectedIds: [],
        activeZoneId: null,
        autoNav: null,
        zoomies: false,
        feeding: {
            phase: 'idle', // 'idle' | 'standup' | 'to_bowl' | 'pour' | 'return' | 'sit'
            t: 0,
            bowlFull: 0, // 0..1
            mealsFed: 0,
        },
        arcade: {
            status: 'idle', // 'idle' | 'playing' | 'finished'
            timeLeft: ARCADE_DURATION,
            score: 0,
            caught: 0,
            combo: 0,
            maxCombo: 0,
            comboTimer: 0,
            mice: [
                createMouse('mouse-1', 0, '#9ca3af'),
                createMouse('mouse-2', 8, '#cbd5e1'),
                createMouse('mouse-gold', 13, '#fbbf24'),
            ],
        },
    };
}

export function startArcadeGame(state) {
    const { cat } = state;
    cat.napping = false;
    state.autoNav = null;
    state.arcade = {
        status: 'playing',
        timeLeft: ARCADE_DURATION,
        score: 0,
        caught: 0,
        combo: 0,
        maxCombo: 0,
        comboTimer: 0,
        mice: [
            createMouse('mouse-1', 2, '#9ca3af'),
            createMouse('mouse-2', 8, '#cbd5e1'),
            createMouse('mouse-gold', 13, '#fbbf24'),
        ],
    };
    // Keep initial mice well separated from the cat's current position
    state.arcade.mice.forEach((m, idx) => {
        const wp = pickDistantWaypoint(cat.x, cat.z, idx * 4 + 1);
        m.x = wp.x;
        m.z = wp.z;
        const nxt = pickDistantWaypoint(wp.x, wp.z, idx * 5 + 3);
        m.targetX = nxt.x;
        m.targetZ = nxt.z;
    });
}

export function stopArcadeGame(state) {
    state.arcade.status = 'idle';
    state.arcade.timeLeft = ARCADE_DURATION;
    state.arcade.combo = 0;
    state.arcade.comboTimer = 0;
}

export function toggleCatNap(state) {
    const { cat } = state;
    state.autoNav = null;
    if (cat.napping) {
        cat.napping = false;
        return false;
    }
    // Hop right onto the cozy terracotta throw blanket on the queen bed
    cat.x = -19.6;
    cat.z = -8.1;
    cat.y = 0.64;
    cat.vx = 0;
    cat.vy = 0;
    cat.vz = 0;
    cat.grounded = true;
    cat.napping = true;
    return true;
}

export function triggerFeeding(state) {
    if (state.feeding.phase !== 'idle') return false;
    if (state.feeding.bowlFull >= 0.85) return false;
    state.feeding.phase = 'standup';
    state.feeding.t = 0;
    return true;
}

export function triggerCatEmote(state, specificEmote = null) {
    const { cat } = state;
    cat.napping = false;
    state.autoNav = null;
    const next = specificEmote && EMOTE_DURATIONS[specificEmote]
        ? specificEmote
        : IDLE_EMOTES[cat.emoteCursor % IDLE_EMOTES.length];
    cat.emoteCursor = (cat.emoteCursor + 1) % IDLE_EMOTES.length;
    cat.emote = next;
    cat.emoteTimer = 0;
    cat.emoteDuration = EMOTE_DURATIONS[next] || 3.2;
    cat.idleTime = 0;
    return next;
}

export function applyCatPetting(state, rubAmount = 0.08, rubDir = 0) {
    const { cat } = state;
    cat.napping = false;
    const prevStreak = cat.petStreak;
    cat.petTimer = 0.72;
    cat.petStreak = Math.min(4.0, cat.petStreak + rubAmount);
    cat.petTilt = clamp(cat.petTilt * 0.55 + rubDir * 0.45, -1, 1);
    cat.idleTime = 0;

    // Sustained gentle rubbing makes Oyen flop into a blissful belly-up roll!
    let rolled = false;
    if (prevStreak < 2.2 && cat.petStreak >= 2.2 && cat.grounded && cat.speed < 0.25) {
        triggerCatEmote(state, 'roll');
        rolled = true;
    }
    return {
        happyBubble: prevStreak < 0.85 && cat.petStreak >= 0.85,
        rolled,
    };
}

export function getArcadeRank(score) {
    if (score >= 2200) return 'S';
    if (score >= 1400) return 'A';
    if (score >= 700) return 'B';
    return 'C';
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function resolveCircleVsAabb(x, z, r, box) {
    const closestX = clamp(x, box.minX, box.maxX);
    const closestZ = clamp(z, box.minZ, box.maxZ);
    const dx = x - closestX;
    const dz = z - closestZ;
    const distSq = dx * dx + dz * dz;
    if (distSq >= r * r) return { x, z, hit: false, nx: 0, nz: 0 };

    if (distSq > 1e-8) {
        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const nz = dz / dist;
        return { x: closestX + nx * r, z: closestZ + nz * r, hit: true, nx, nz };
    }

    const left = Math.abs(x - box.minX);
    const right = Math.abs(box.maxX - x);
    const top = Math.abs(z - box.minZ);
    const bottom = Math.abs(box.maxZ - z);
    const m = Math.min(left, right, top, bottom);
    if (m === left) return { x: box.minX - r, z, hit: true, nx: -1, nz: 0 };
    if (m === right) return { x: box.maxX + r, z, hit: true, nx: 1, nz: 0 };
    if (m === top) return { x, z: box.minZ - r, hit: true, nx: 0, nz: -1 };
    return { x, z: box.maxZ + r, hit: true, nx: 0, nz: 1 };
}

export function getSupportHeight(x, z, currentY) {
    let support = 0;
    for (const p of PLATFORMS) {
        if (x >= p.minX - 0.16 && x <= p.maxX + 0.16 && z >= p.minZ - 0.16 && z <= p.maxZ + 0.16) {
            if (currentY >= p.topY - 0.3) {
                support = Math.max(support, p.topY);
            }
        }
    }
    return support;
}

export function findActiveZone(x, z) {
    let best = null;
    let bestDist = Infinity;
    for (const zone of ROOM_ZONES) {
        const d = Math.hypot(x - zone.x, z - zone.z);
        if (d <= zone.radius && d < bestDist) {
            best = zone.id;
            bestDist = d;
        }
    }
    return best;
}

function shortestAngleDiff(from, to) {
    let diff = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
}

// Waypoint graph linking all 6 zones & wide doorways so Oyen runs smoothly without snagging walls.
const NAV_NODES = {
    about: { x: -7.8, z: -7.6 },
    projects: { x: 4.7, z: -7.1 },
    experience: { x: -8.6, z: -0.6 },
    certificates: { x: 4.8, z: -0.8 },
    contact: { x: 6.0, z: 9.2 },
    bedroom: { x: -16.9, z: -5.4 },
    hub_west: { x: -11.4, z: -5.2 },
    arch_north: { x: -2.0, z: -7.2 },
    arch_east: { x: 4.7, z: -5.0 },
    arch_south: { x: -2.0, z: -0.4 },
    door_front: { x: 5.2, z: 3.0 },
    door_patio: { x: -8.2, z: 3.0 },
    patio_east: { x: -4.4, z: 5.2 },
    yard_mid: { x: 0.5, z: 8.6 },
    door_bed_s: { x: -18.6, z: -2.5 },
    yard_west: { x: -16.4, z: 4.0 },
    patio_sw: { x: -15.2, z: 9.8 },
    door_east: { x: 11.0, z: -0.5 },
    koi_south: { x: 12.2, z: 4.6 },
};

const NAV_ADJ = (() => {
    const edges = [
        ['bedroom', 'hub_west'],
        ['hub_west', 'about'],
        ['hub_west', 'experience'],
        ['about', 'arch_north'],
        ['arch_north', 'projects'],
        ['projects', 'arch_east'],
        ['arch_east', 'certificates'],
        ['experience', 'arch_south'],
        ['arch_south', 'certificates'],
        ['certificates', 'door_front'],
        ['door_front', 'contact'],
        ['experience', 'door_patio'],
        ['door_patio', 'patio_east'],
        ['patio_east', 'yard_mid'],
        ['yard_mid', 'contact'],
        ['bedroom', 'door_bed_s'],
        ['door_bed_s', 'yard_west'],
        ['yard_west', 'patio_sw'],
        ['patio_sw', 'yard_mid'],
        ['certificates', 'door_east'],
        ['door_east', 'koi_south'],
        ['koi_south', 'contact'],
    ];
    const map = {};
    for (const k of Object.keys(NAV_NODES)) map[k] = [];
    for (const [a, b] of edges) {
        const d = Math.hypot(NAV_NODES[a].x - NAV_NODES[b].x, NAV_NODES[a].z - NAV_NODES[b].z);
        map[a].push({ id: b, d });
        map[b].push({ id: a, d });
    }
    return map;
})();

function pointBlocked(x, z, includePlatforms = true) {
    const r = CAT_RADIUS * 0.92;
    for (const box of SOLID_OBSTACLES) {
        if (x > box.minX - r && x < box.maxX + r && z > box.minZ - r && z < box.maxZ + r) return true;
    }
    if (includePlatforms) {
        for (const p of PLATFORMS) {
            if (p.topY > 0.3 && x > p.minX - r && x < p.maxX + r && z > p.minZ - r && z < p.maxZ + r) return true;
        }
    }
    return false;
}

function hasClearSegment(x1, z1, x2, z2, includePlatforms = true) {
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const steps = Math.max(2, Math.ceil(dist / 0.45));
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        if (pointBlocked(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, includePlatforms)) return false;
    }
    return true;
}

function computePathToZone(startX, startZ, startY, zoneId) {
    const target = NAV_NODES[zoneId];
    if (!target) return [];

    // Direct run if unobstructed on ground level
    if (startY < 0.35 && hasClearSegment(startX, startZ, target.x, target.z, true)) {
        return [{ x: target.x, z: target.z }];
    }

    const keys = Object.keys(NAV_NODES);
    const dist = {};
    const prev = {};
    const unvisited = new Set(keys);
    for (const k of keys) dist[k] = Infinity;

    // Seed Dijkstra from all line-of-sight visible nodes (fallback to nearest node if elevated on furniture)
    let seeded = 0;
    for (const k of keys) {
        const n = NAV_NODES[k];
        if (hasClearSegment(startX, startZ, n.x, n.z, startY < 0.35)) {
            dist[k] = Math.hypot(n.x - startX, n.z - startZ);
            seeded += 1;
        }
    }
    if (seeded === 0) {
        let bestK = keys[0];
        let bestD = Infinity;
        for (const k of keys) {
            const d = Math.hypot(NAV_NODES[k].x - startX, NAV_NODES[k].z - startZ);
            if (d < bestD) {
                bestD = d;
                bestK = k;
            }
        }
        dist[bestK] = bestD;
    }

    while (unvisited.size > 0) {
        let u = null;
        let best = Infinity;
        for (const k of unvisited) {
            if (dist[k] < best) {
                best = dist[k];
                u = k;
            }
        }
        if (!u || best === Infinity) break;
        unvisited.delete(u);
        if (u === zoneId) break;
        for (const edge of NAV_ADJ[u]) {
            if (!unvisited.has(edge.id)) continue;
            const alt = dist[u] + edge.d;
            if (alt < dist[edge.id]) {
                dist[edge.id] = alt;
                prev[edge.id] = u;
            }
        }
    }

    const chain = [];
    let cur = zoneId;
    while (cur) {
        chain.unshift({ x: NAV_NODES[cur].x, z: NAV_NODES[cur].z });
        cur = prev[cur];
    }
    // Skip redundant first hop if second hop is already directly visible
    if (chain.length >= 2 && startY < 0.35 && hasClearSegment(startX, startZ, chain[1].x, chain[1].z, true)) {
        chain.shift();
    }
    return chain.length > 0 ? chain : [{ x: target.x, z: target.z }];
}

export function navigateCatToZone(state, zoneId, openOnArrive = true) {
    const zone = ROOM_ZONES.find((z) => z.id === zoneId);
    if (!zone) return false;
    state.cat.napping = false;
    const waypoints = computePathToZone(state.cat.x, state.cat.z, state.cat.y, zoneId);
    state.autoNav = {
        zoneId,
        openOnArrive,
        waypoints,
        stuckTimer: 0,
        lastX: state.cat.x,
        lastZ: state.cat.z,
    };
    return true;
}

export function warpCatToZone(state, zoneId) {
    const zone = ROOM_ZONES.find((z) => z.id === zoneId);
    if (!zone) return;
    state.autoNav = null;
    state.cat.napping = false;
    state.cat.x = zone.warp.x;
    state.cat.z = zone.warp.z;
    state.cat.y = 0.25;
    state.cat.vx = 0;
    state.cat.vy = 0;
    state.cat.vz = 0;
    state.cat.yaw = Math.atan2(zone.x - zone.warp.x, zone.z - zone.warp.z);
    state.activeZoneId = zone.id;
}

/**
 * Advances simulation by dt seconds in-place and returns frame events.
 */
export function stepCatWorld(state, input, rawDt) {
    const dt = Math.min(rawDt, 0.05);
    const { cat, balls, arcade } = state;
    const events = {
        jumped: false,
        meowed: false,
        collected: [],
        unlockedZoomies: false,
        caughtMouse: null,
        arcadeFinished: false,
        feedingStarted: false,
        bowlFilled: false,
        catAte: false,
        arrivedZoneId: null,
        openZoneAfterArrive: false,
    };

    const rawLen = Math.hypot(input.moveX || 0, input.moveY || 0);
    // Manual movement or jumping immediately wakes cat & cancels autopilot run
    if (rawLen > 0.12 || input.jump) {
        if (cat.napping) cat.napping = false;
        if (state.autoNav) state.autoNav = null;
    }

    const arcadeBoost = arcade.status === 'playing' ? 1.16 : 1;
    const baseSpeed = (state.zoomies ? 7.6 : 6.0) * arcadeBoost;
    let targetVx = 0;
    let targetVz = 0;
    let movingIntent = rawLen > 0.05;

    if (state.autoNav && !cat.napping) {
        const nav = state.autoNav;
        // Pop reached waypoints cleanly
        while (nav.waypoints.length > 0) {
            const wp = nav.waypoints[0];
            const rem = Math.hypot(wp.x - cat.x, wp.z - cat.z);
            const reach = nav.waypoints.length === 1 ? 0.68 : 0.78;
            if (rem <= reach) {
                nav.waypoints.shift();
                nav.stuckTimer = 0;
            } else {
                break;
            }
        }
        if (nav.waypoints.length === 0) {
            events.arrivedZoneId = nav.zoneId;
            events.openZoneAfterArrive = nav.openOnArrive;
            state.activeZoneId = nav.zoneId;
            state.autoNav = null;
            movingIntent = false;
        } else {
            const wp = nav.waypoints[0];
            const dx = wp.x - cat.x;
            const dz = wp.z - cat.z;
            const d = Math.hypot(dx, dz) || 1;
            const runSpeed = baseSpeed * 1.42;
            targetVx = (dx / d) * runSpeed;
            targetVz = (dz / d) * runSpeed;
            movingIntent = true;

            // Gentle anti-snag failsafe if cat starts tucked behind a low table/corner
            const moved = Math.hypot(cat.x - nav.lastX, cat.z - nav.lastZ);
            if (moved < 0.03) {
                nav.stuckTimer += dt;
                if (nav.stuckTimer > 0.45 && cat.grounded) {
                    cat.vy = 7.4;
                    cat.grounded = false;
                    nav.stuckTimer = 0;
                }
            } else {
                nav.stuckTimer = 0;
                nav.lastX = cat.x;
                nav.lastZ = cat.z;
            }
        }
    } else {
        const normX = cat.napping ? 0 : (rawLen > 1 ? input.moveX / rawLen : (input.moveX || 0));
        const normY = cat.napping ? 0 : (rawLen > 1 ? input.moveY / rawLen : (input.moveY || 0));
        const dirX = CAM_RIGHT.x * normX + CAM_FORWARD.x * normY;
        const dirZ = CAM_RIGHT.z * normX + CAM_FORWARD.z * normY;
        const maxSpeed = input.sprint ? baseSpeed * 1.48 : baseSpeed;
        targetVx = dirX * maxSpeed;
        targetVz = dirZ * maxSpeed;
    }

    const accel = movingIntent ? 15 : 11;
    const blend = 1 - Math.exp(-accel * dt);

    cat.vx += (targetVx - cat.vx) * blend;
    cat.vz += (targetVz - cat.vz) * blend;

    cat.jumpCooldown = Math.max(0, cat.jumpCooldown - dt);
    if (input.jump && cat.grounded && cat.jumpCooldown <= 0) {
        // Tuned so Oyen effortlessly leaps onto 1.07-1.13m desks, cabinets & credenzas!
        cat.vy = state.zoomies ? 8.2 : 7.5;
        cat.grounded = false;
        cat.jumpCooldown = 0.16;
        events.jumped = true;
    }

    if (input.meow && cat.meowTimer <= 0) {
        cat.meowTimer = 1.15;
        events.meowed = true;
    } else if (cat.meowTimer > 0) {
        cat.meowTimer = Math.max(0, cat.meowTimer - dt);
    }

    if (cat.eatingTimer > 0) {
        cat.eatingTimer = Math.max(0, cat.eatingTimer - dt);
    }

    // Advance Lauza's stand-up -> walk -> pour -> return -> sit feeding animation state machine
    const { feeding } = state;
    if (feeding.phase !== 'idle') {
        feeding.t += dt;
        if (feeding.phase === 'standup' && feeding.t >= 0.65) {
            feeding.phase = 'to_bowl';
            feeding.t = 0;
        } else if (feeding.phase === 'to_bowl' && feeding.t >= 1.15) {
            feeding.phase = 'pour';
            feeding.t = 0;
        } else if (feeding.phase === 'pour') {
            feeding.bowlFull = Math.min(1, feeding.t / 1.15);
            if (feeding.t >= 1.45) {
                feeding.bowlFull = 1;
                feeding.phase = 'return';
                feeding.t = 0;
                events.bowlFilled = true;
            }
        } else if (feeding.phase === 'return' && feeding.t >= 1.15) {
            feeding.phase = 'sit';
            feeding.t = 0;
        } else if (feeding.phase === 'sit' && feeding.t >= 0.65) {
            feeding.phase = 'idle';
            feeding.t = 0;
        }
    }

    // Oyen eats happily when walking up to the filled food bowl!
    if (feeding.bowlFull >= 0.9 && feeding.phase !== 'pour' && cat.y < 0.35 && cat.eatingTimer <= 0) {
        const distBowl = Math.hypot(cat.x - BOWL_POS.x, cat.z - BOWL_POS.z);
        if (distBowl < 1.15) {
            cat.eatingTimer = 2.0;
            cat.yaw = Math.atan2(BOWL_POS.x - cat.x, BOWL_POS.z - cat.z);
            feeding.bowlFull = 0;
            feeding.mealsFed += 1;
            events.catAte = true;
        }
    }

    const prevY = cat.y;
    cat.vy -= 19.5 * dt;
    cat.x += cat.vx * dt;
    cat.z += cat.vz * dt;
    cat.y += cat.vy * dt;

    cat.x = clamp(cat.x, WORLD_BOUNDS.minX + CAT_RADIUS, WORLD_BOUNDS.maxX - CAT_RADIUS);
    cat.z = clamp(cat.z, WORLD_BOUNDS.minZ + CAT_RADIUS, WORLD_BOUNDS.maxZ - CAT_RADIUS);

    for (const box of SOLID_OBSTACLES) {
        const res = resolveCircleVsAabb(cat.x, cat.z, CAT_RADIUS, box);
        if (res.hit) {
            cat.x = res.x;
            cat.z = res.z;
        }
    }

    for (const p of PLATFORMS) {
        if (cat.y < p.topY - 0.25) {
            const res = resolveCircleVsAabb(cat.x, cat.z, CAT_RADIUS * 0.9, p);
            if (res.hit) {
                cat.x = res.x;
                cat.z = res.z;
            }
        }
    }

    const floorY = getSupportHeight(cat.x, cat.z, Math.max(prevY, cat.y));
    if (cat.y <= floorY) {
        cat.y = floorY;
        cat.vy = 0;
        cat.grounded = true;
    } else {
        cat.grounded = false;
    }

    cat.speed = Math.hypot(cat.vx, cat.vz);
    if (cat.speed > 0.18) {
        const targetYaw = Math.atan2(cat.vx, cat.vz);
        cat.yaw += shortestAngleDiff(cat.yaw, targetYaw) * (1 - Math.exp(-13 * dt));
        cat.walkCycle += cat.speed * dt * 2.45;
    }

    // Autonomous idle emotes (roll, stretch, groom, loaf, chase_tail) & petting decay
    const isBusy = cat.speed > 0.24 || !cat.grounded || cat.napping || cat.eatingTimer > 0 || Boolean(state.autoNav);
    if (isBusy) {
        cat.idleTime = 0;
        if (cat.emote) {
            cat.emote = null;
            cat.emoteTimer = 0;
        }
        if (cat.speed > 0.6 || !cat.grounded) {
            cat.petTimer = 0;
            cat.petStreak = 0;
        }
    } else {
        if (cat.petTimer > 0) {
            cat.petTimer = Math.max(0, cat.petTimer - dt);
        } else if (cat.petStreak > 0) {
            cat.petStreak = Math.max(0, cat.petStreak - dt * 1.4);
            cat.petTilt *= Math.exp(-6 * dt);
        }

        if (cat.emote) {
            cat.emoteTimer += dt;
            if (cat.emote === 'chase_tail') {
                cat.yaw += dt * 5.8;
                cat.walkCycle += dt * 12.0;
            }
            if (cat.emoteTimer >= cat.emoteDuration) {
                cat.emote = null;
                cat.emoteTimer = 0;
                cat.idleTime = 0;
            }
        } else if (cat.petTimer <= 0 && arcade.status !== 'playing') {
            cat.idleTime += dt;
            if (cat.idleTime >= 2.8) {
                triggerCatEmote(state);
            }
        }
    }

    // Pushable indoor yarn balls & outdoor beach ball
    for (const ball of balls) {
        const dx = ball.x - cat.x;
        const dz = ball.z - cat.z;
        const dist = Math.hypot(dx, dz);
        const minDist = CAT_RADIUS + ball.r;
        if (dist < minDist && cat.y < 0.75) {
            const nx = dist > 1e-4 ? dx / dist : 1;
            const nz = dist > 1e-4 ? dz / dist : 0;
            const overlap = minDist - dist;
            ball.x += nx * overlap;
            ball.z += nz * overlap;
            const push = Math.max(2.8, cat.speed * 1.15);
            ball.vx = nx * push + cat.vx * 0.4;
            ball.vz = nz * push + cat.vz * 0.4;
        }

        ball.x += ball.vx * dt;
        ball.z += ball.vz * dt;
        const drag = Math.exp(-2.3 * dt);
        ball.vx *= drag;
        ball.vz *= drag;
        ball.rotX += (ball.vz * dt) / ball.r;
        ball.rotZ -= (ball.vx * dt) / ball.r;

        if (ball.x < WORLD_BOUNDS.minX + ball.r) {
            ball.x = WORLD_BOUNDS.minX + ball.r;
            ball.vx = Math.abs(ball.vx) * 0.65;
        } else if (ball.x > WORLD_BOUNDS.maxX - ball.r) {
            ball.x = WORLD_BOUNDS.maxX - ball.r;
            ball.vx = -Math.abs(ball.vx) * 0.65;
        }
        if (ball.z < WORLD_BOUNDS.minZ + ball.r) {
            ball.z = WORLD_BOUNDS.minZ + ball.r;
            ball.vz = Math.abs(ball.vz) * 0.65;
        } else if (ball.z > WORLD_BOUNDS.maxZ - ball.r) {
            ball.z = WORLD_BOUNDS.maxZ - ball.r;
            ball.vz = -Math.abs(ball.vz) * 0.65;
        }

        for (const box of [...SOLID_OBSTACLES, ...PLATFORMS]) {
            const res = resolveCircleVsAabb(ball.x, ball.z, ball.r, box);
            if (res.hit) {
                ball.x = res.x;
                ball.z = res.z;
                const dot = ball.vx * res.nx + ball.vz * res.nz;
                if (dot < 0) {
                    ball.vx -= 1.65 * dot * res.nx;
                    ball.vz -= 1.65 * dot * res.nz;
                }
            }
        }
    }

    // Collectible fish treats
    for (const treat of INITIAL_TREATS) {
        if (state.collectedIds.includes(treat.id)) continue;
        const dx = cat.x - treat.x;
        const dz = cat.z - treat.z;
        const dy = Math.abs((cat.y + 0.45) - treat.y);
        if (dx * dx + dz * dz < 1.1 * 1.1 && dy < 0.9) {
            state.collectedIds.push(treat.id);
            events.collected.push(treat.id);
            if (!state.zoomies && state.collectedIds.length === INITIAL_TREATS.length) {
                state.zoomies = true;
                events.unlockedZoomies = true;
            }
        }
    }

    // ============ TOY MOUSE CHASE ARCADE MINI-GAME ============
    if (arcade.status === 'playing') {
        arcade.timeLeft = Math.max(0, arcade.timeLeft - dt);
        if (arcade.comboTimer > 0) {
            arcade.comboTimer = Math.max(0, arcade.comboTimer - dt);
            if (arcade.comboTimer <= 0) arcade.combo = 0;
        }

        for (const m of arcade.mice) {
            // Scurry toward waypoint, or bolt away slightly if cat gets close
            const distCat = Math.hypot(m.x - cat.x, m.z - cat.z);
            const distTarget = Math.hypot(m.targetX - m.x, m.targetZ - m.z);
            if (distTarget < 1.1) {
                m.wpSeed += 3;
                const nxt = pickDistantWaypoint(m.x, m.z, m.wpSeed);
                m.targetX = nxt.x;
                m.targetZ = nxt.z;
            }

            let moveX = m.targetX - m.x;
            let moveZ = m.targetZ - m.z;
            const len = Math.hypot(moveX, moveZ) || 1;
            moveX /= len;
            moveZ /= len;

            if (distCat < 3.4 && distCat > 0.01) {
                // Playful evade juke so chasing feels lively yet totally catchable
                moveX = moveX * 0.45 + ((m.x - cat.x) / distCat) * 0.55;
                moveZ = moveZ * 0.45 + ((m.z - cat.z) / distCat) * 0.55;
                const ml = Math.hypot(moveX, moveZ) || 1;
                moveX /= ml;
                moveZ /= ml;
            }

            const speed = m.golden ? 3.8 : 2.9;
            m.vx = moveX * speed;
            m.vz = moveZ * speed;
            m.x = clamp(m.x + m.vx * dt, WORLD_BOUNDS.minX + 0.6, WORLD_BOUNDS.maxX - 0.6);
            m.z = clamp(m.z + m.vz * dt, WORLD_BOUNDS.minZ + 0.6, WORLD_BOUNDS.maxZ - 0.6);

            let hitWall = false;
            for (const box of [...SOLID_OBSTACLES, ...PLATFORMS]) {
                const res = resolveCircleVsAabb(m.x, m.z, 0.35, box);
                if (res.hit) {
                    m.x = res.x;
                    m.z = res.z;
                    hitWall = true;
                }
            }
            if (hitWall) {
                m.wpSeed += 2;
                const nxt = pickDistantWaypoint(cat.x, cat.z, m.wpSeed);
                m.targetX = nxt.x;
                m.targetZ = nxt.z;
            }

            m.yaw = Math.atan2(m.vx, m.vz);

            // Check pounce / catch!
            if (Math.hypot(m.x - cat.x, m.z - cat.z) < 1.15 && cat.y < 1.1) {
                arcade.combo = Math.min(5, arcade.combo + 1);
                arcade.maxCombo = Math.max(arcade.maxCombo, arcade.combo);
                arcade.comboTimer = 6.5;
                arcade.caught += 1;
                const pts = (m.golden ? 250 : 100) * arcade.combo;
                arcade.score += pts;
                if (m.golden) arcade.timeLeft = Math.min(ARCADE_DURATION + 10, arcade.timeLeft + 3);
                events.caughtMouse = { golden: m.golden, points: pts, combo: arcade.combo };

                // Respawn mouse at a distant room/garden waypoint
                m.wpSeed += 7;
                const respawn = pickDistantWaypoint(cat.x, cat.z, m.wpSeed);
                m.x = respawn.x;
                m.z = respawn.z;
                const nxt = pickDistantWaypoint(respawn.x, respawn.z, m.wpSeed + 2);
                m.targetX = nxt.x;
                m.targetZ = nxt.z;
            }
        }

        if (arcade.timeLeft <= 0) {
            arcade.status = 'finished';
            events.arcadeFinished = true;
        }
    }

    state.activeZoneId = findActiveZone(cat.x, cat.z);
    return events;
}
