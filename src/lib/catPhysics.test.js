import test from 'node:test';
import assert from 'node:assert/strict';
import {
    BOWL_POS,
    CAT_RADIUS,
    IDLE_EMOTES,
    INITIAL_TREATS,
    ROOM_ZONES,
    WORLD_BOUNDS,
    applyCatPetting,
    createInitialWorldState,
    getArcadeRank,
    isInsideHouse,
    isNearLauza,
    navigateCatToZone,
    startArcadeGame,
    stepCatWorld,
    toggleCatNap,
    triggerCatEmote,
    triggerFeeding,
    warpCatToZone,
} from './catPhysics.js';

const idleInput = { moveX: 0, moveY: 0, sprint: false, jump: false, meow: false };

test('cat can walk from inside the house out to the yard through the front doorway', () => {
    const state = createInitialWorldState();
    state.cat.x = 5.2;
    state.cat.z = 1.5;
    assert.equal(isInsideHouse(state.cat.x, state.cat.z), true);

    for (let i = 0; i < 60; i++) {
        stepCatWorld(state, { ...idleInput, moveX: -0.7, moveY: -0.7 }, 0.04);
    }
    assert.equal(isInsideHouse(state.cat.x, state.cat.z), false);
    assert.ok(state.cat.z > 3.2, `expected cat outside South wall, got z=${state.cat.z}`);
});

test('cat can enter the new Master Bedroom and nap on the queen bed', () => {
    const state = createInitialWorldState();
    warpCatToZone(state, 'bedroom');
    stepCatWorld(state, idleInput, 0.02);
    assert.equal(state.activeZoneId, 'bedroom');
    assert.equal(isInsideHouse(state.cat.x, state.cat.z), true);

    const napping = toggleCatNap(state);
    assert.equal(napping, true);
    assert.equal(state.cat.napping, true);
    assert.ok(Math.abs(state.cat.y - 0.64) < 0.01);

    // Moving wakes the cat up cleanly
    stepCatWorld(state, { ...idleInput, moveX: 1 }, 0.03);
    assert.equal(state.cat.napping, false);
});

test('cat stays clamped inside the outer garden bounds and cannot go behind North/West house walls', () => {
    const state = createInitialWorldState();
    state.cat.x = -19;
    state.cat.z = 1;
    for (let i = 0; i < 120; i++) {
        stepCatWorld(state, { ...idleInput, moveX: -1, moveY: 1, sprint: true }, 0.05);
    }
    assert.ok(state.cat.x >= WORLD_BOUNDS.minX + CAT_RADIUS - 1e-6);
    assert.ok(state.cat.z >= WORLD_BOUNDS.minZ + CAT_RADIUS - 1e-6);
});

test('cat can leap from the floor cleanly onto Lauza editing desk', () => {
    const state = createInitialWorldState();
    // Stand right beside the studio desk front edge (z = -9.6) and leap onto the desk (z = -10.8)
    state.cat.x = 3.5;
    state.cat.z = -9.65;
    state.cat.y = 0;
    state.cat.grounded = true;

    // Trigger jump while moving toward -Z (screen-up + screen-right => +X, -Z, or directly steer onto desk)
    stepCatWorld(state, { ...idleInput, jump: true, moveX: 0.65, moveY: 0.76 }, 0.03);
    for (let i = 0; i < 45; i++) {
        stepCatWorld(state, { ...idleInput, moveX: 0.65, moveY: 0.76 }, 0.03);
    }
    assert.equal(state.cat.grounded, true);
    assert.ok(Math.abs(state.cat.y - 1.07) < 0.02, `expected cat on studio desk y=1.07, got y=${state.cat.y}, z=${state.cat.z}`);
});

test('cat lands cleanly on elevated 2-tier cat tower', () => {
    const state = createInitialWorldState();
    state.cat.x = -4.5;
    state.cat.z = -2.7;
    state.cat.y = 1.9;
    state.cat.grounded = false;

    for (let i = 0; i < 50; i++) {
        stepCatWorld(state, idleInput, 0.03);
    }
    assert.equal(state.cat.grounded, true);
    assert.ok(Math.abs(state.cat.y - 1.32) < 0.01);
});

test('toy mouse arcade mini-game catches mice, tracks combo & finishes on timer', () => {
    const state = createInitialWorldState();
    startArcadeGame(state);
    assert.equal(state.arcade.status, 'playing');

    // Place cat directly onto the first toy mouse to catch it
    const m = state.arcade.mice[0];
    state.cat.x = m.x;
    state.cat.z = m.z;
    const ev = stepCatWorld(state, idleInput, 0.02);
    assert.ok(ev.caughtMouse, 'expected mouse catch event');
    assert.equal(state.arcade.caught, 1);
    assert.ok(state.arcade.score >= 100);
    assert.equal(state.arcade.combo, 1);

    // Exhaust timer and verify arcade finishes cleanly
    state.arcade.timeLeft = 0.01;
    const endEv = stepCatWorld(state, idleInput, 0.04);
    assert.equal(endEv.arcadeFinished, true);
    assert.equal(state.arcade.status, 'finished');
    assert.equal(getArcadeRank(2500), 'S');
});

test('collecting all 10 fish treats unlocks zoomies mode', () => {
    const state = createInitialWorldState();
    let unlocked = false;
    for (const treat of INITIAL_TREATS) {
        state.cat.x = treat.x;
        state.cat.y = Math.max(0, treat.y - 0.45);
        state.cat.z = treat.z;
        const ev = stepCatWorld(state, idleInput, 0.02);
        if (ev.unlockedZoomies) unlocked = true;
    }
    assert.equal(state.collectedIds.length, INITIAL_TREATS.length);
    assert.equal(state.zoomies, true);
    assert.equal(unlocked, true);
});

test('approaching Lauza and pressing E triggers feeding animation, fills bowl, and lets Oyen eat', () => {
    const state = createInitialWorldState();
    state.cat.x = 5.0;
    state.cat.z = -8.6;
    assert.equal(isNearLauza(state.cat.x, state.cat.z), true);

    // Pressing E near Lauza calls triggerFeeding()
    assert.equal(triggerFeeding(state), true);
    assert.equal(state.feeding.phase, 'standup');

    // Advance through standup -> to_bowl -> pour -> return -> sit
    let filled = false;
    for (let i = 0; i < 160; i++) {
        const ev = stepCatWorld(state, idleInput, 0.04);
        if (ev.bowlFilled) filled = true;
    }
    assert.equal(filled, true);
    assert.equal(state.feeding.phase, 'idle');
    assert.equal(state.feeding.bowlFull, 1);

    // Triggering again while bowl is already full returns false
    assert.equal(triggerFeeding(state), false);

    // Walk Oyen up to the filled bowl -> eats happily!
    state.cat.x = BOWL_POS.x + 0.5;
    state.cat.z = BOWL_POS.z;
    const eatEv = stepCatWorld(state, idleInput, 0.03);
    assert.equal(eatEv.catAte, true);
    assert.ok(state.cat.eatingTimer > 1.5);
    assert.equal(state.feeding.bowlFull, 0);
    assert.equal(state.feeding.mealsFed, 1);
});

test('every portfolio & bedroom warp lands cleanly inside its zone', () => {
    const state = createInitialWorldState();
    for (const zone of ROOM_ZONES) {
        warpCatToZone(state, zone.id);
        stepCatWorld(state, idleInput, 0.02);
        assert.equal(state.activeZoneId, zone.id, `warp failed for ${zone.id}`);
    }
});

test('auto-run pathfinder runs Oyen between every room pair and triggers arrival event', () => {
    for (const from of ROOM_ZONES) {
        for (const to of ROOM_ZONES) {
            if (from.id === to.id) continue;
            const state = createInitialWorldState();
            warpCatToZone(state, from.id);
            const ok = navigateCatToZone(state, to.id, true);
            assert.equal(ok, true);
            assert.ok(state.autoNav && state.autoNav.waypoints.length > 0);
            // Cat must NOT teleport instantaneously
            assert.ok(Math.hypot(state.cat.x - to.x, state.cat.z - to.z) > 1.0);

            let arrived = null;
            let openAfter = false;
            for (let i = 0; i < 360; i++) {
                const ev = stepCatWorld(state, idleInput, 1 / 30);
                if (ev.arrivedZoneId) {
                    arrived = ev.arrivedZoneId;
                    openAfter = ev.openZoneAfterArrive;
                    break;
                }
            }
            assert.equal(arrived, to.id, `failed running ${from.id} -> ${to.id} (ended at ${state.cat.x.toFixed(1)}, ${state.cat.z.toFixed(1)})`);
            assert.equal(openAfter, true);
            assert.equal(state.autoNav, null);
        }
    }
});

test('manual input cancels auto-run immediately', () => {
    const state = createInitialWorldState();
    navigateCatToZone(state, 'contact', true);
    assert.ok(state.autoNav);
    stepCatWorld(state, { ...idleInput, moveX: 1 }, 1 / 60);
    assert.equal(state.autoNav, null);
});

test('idle cat autonomously triggers emotes after standing still and cancels on movement', () => {
    const state = createInitialWorldState();
    for (let i = 0; i < 120; i++) {
        stepCatWorld(state, idleInput, 1 / 30); // 4.0s idle
    }
    assert.ok(IDLE_EMOTES.includes(state.cat.emote), `expected idle emote, got ${state.cat.emote}`);
    // Moving cancels the emote immediately
    for (let i = 0; i < 10; i++) {
        stepCatWorld(state, { ...idleInput, moveX: 1 }, 1 / 30);
    }
    assert.equal(state.cat.emote, null);
});

test('cursor petting builds happiness streak and triggers blissful belly-up roll', () => {
    const state = createInitialWorldState();
    let gotHappy = false;
    let gotRoll = false;
    for (let i = 0; i < 30; i++) {
        const res = applyCatPetting(state, 0.1, i % 2 === 0 ? 1 : -1);
        if (res.happyBubble) gotHappy = true;
        if (res.rolled) gotRoll = true;
    }
    assert.equal(gotHappy, true);
    assert.equal(gotRoll, true);
    assert.equal(state.cat.emote, 'roll');
    assert.ok(state.cat.petTimer > 0);
});

test('triggerCatEmote cycles cleanly through all 5 cat emotes', () => {
    const state = createInitialWorldState();
    const seen = IDLE_EMOTES.map(() => triggerCatEmote(state));
    assert.deepEqual(seen, IDLE_EMOTES);
});
