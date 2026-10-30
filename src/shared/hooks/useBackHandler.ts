import { useEffect, useRef } from 'react';

// Return false to stay where you are (e.g. after asking for confirmation)
type BackHandler = () => boolean | void;

interface Layer {
    handle: () => boolean | void;
}

// Each active layer (screen or sheet) should own one browser history entry, newest last
const layers: Layer[] = [];
// History entries we have pushed that are still at or below the current position
let ownEntries = 0;
// True while our own history.go() is in flight; its popstate is not a user "back"
let traversing = false;
let syncScheduled = false;

// Brings history in line with the open layers using at most one history call.
// Browsers merge several history.back() calls made at once, so never issue them per layer.
function syncHistory() {
    syncScheduled = false;
    if (traversing) return;

    const difference = layers.length - ownEntries;
    if (difference > 0) {
        for (let i = 0; i < difference; i++) {
            window.history.pushState({ charadesLayer: true }, '');
        }
        ownEntries += difference;
    } else if (difference < 0) {
        traversing = true;
        ownEntries += difference;
        window.history.go(difference);
    }
}

function scheduleSync() {
    if (syncScheduled) return;
    syncScheduled = true;
    // Runs after the current batch of effects, so a screen closing and another opening cancel out
    queueMicrotask(syncHistory);
}

function handlePopState() {
    if (traversing) {
        traversing = false;
        syncHistory();
        return;
    }

    ownEntries = Math.max(0, ownEntries - 1);
    const layer = layers.pop();
    if (!layer) return;

    if (layer.handle() === false) {
        // The layer is still open, so it needs its history entry back
        layers.push(layer);
    }
    scheduleSync();
}

if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState);
}

/**
 * Makes the browser/phone back gesture act inside the app while `active`:
 * it calls `onBack` instead of leaving the page. Closing the layer from the UI
 * removes its history entry, so back never skips a step.
 */
export function useBackHandler(active: boolean, onBack: BackHandler) {
    const onBackRef = useRef(onBack);
    onBackRef.current = onBack;

    useEffect(() => {
        if (!active) return;

        const layer: Layer = { handle: () => onBackRef.current() };
        layers.push(layer);
        scheduleSync();

        return () => {
            const index = layers.indexOf(layer);
            // Still listed means it closed from the UI rather than via back
            if (index !== -1) {
                layers.splice(index, 1);
                scheduleSync();
            }
        };
    }, [active]);
}
