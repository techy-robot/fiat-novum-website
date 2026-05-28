"use client";

/**
 * Cursor position tracked relative to the star field.
 * `inside` becomes false when the pointer leaves the wrapper element.
 */
export type CursorState = {
  x: number;
  y: number;
  inside: boolean;
};

/**
 * Default interaction tuning shared by the glow surface and star components.
 * Keeping these values in one place prevents the field from drifting out of sync.
 */
export const DEFAULTS = {
  activationRadius: 48,
  driftSpeed: 0.085,
};

/** Measure the Euclidean distance between two points. */
export function distanceBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Turn a string into a deterministic unsigned hash.
 * Stars use the result to derive stable motion variation from their ids.
 */
export function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

/**
 * Track mounted seed stars and their collected state.
 * Completed seeds stay counted even if their component later unmounts.
 */
export function createCollector() {
  const seeds = new Set<string>();
  const collected = new Set<string>();

  return {
    register(id: string) {
      seeds.add(id);
    },
    unregister(id: string) {
      if (!collected.has(id)) {
        seeds.delete(id);
      }
    },
    markCollected(id: string) {
      if (!collected.has(id)) collected.add(id);
    },
    getSeedCount() {
      return seeds.size;
    },
    getCollectedCount() {
      return collected.size;
    },
    allCollected() {
      return seeds.size > 0 && seeds.size === collected.size;
    },
  };
}

/** The shared game snapshot that the surface, hook, and stars observe. */
type GameState = { active: boolean; total: number; collected: number; cursorGlowIntensity: number };
type GameListener = (s: GameState) => void;

/**
 * Observable singleton store for the star-game lifecycle and counters.
 * The shared hooks keep React in sync with this store so the rest of the UI can stay declarative.
 */
class StarGame {
  private state: GameState = { active: false, total: 0, collected: 0, cursorGlowIntensity: 0 };
  private listeners = new Set<GameListener>();
  private collector = createCollector();
  private cursorGlowReports = new Map<string, number>();

  private syncCounts() {
    const total = this.collector.getSeedCount();
    const collected = this.collector.getCollectedCount();

    let changed = false;

    if (this.state.total !== total) {
      this.state.total = total;
      changed = true;
    }

    if (this.state.collected !== collected) {
      this.state.collected = collected;
      changed = true;
    }

    if (changed) {
      this.emit();
    }
  }

  private syncCursorGlow() {
    let maxIntensity = 0;

    for (const intensity of this.cursorGlowReports.values()) {
      if (intensity > maxIntensity) {
        maxIntensity = intensity;
      }
    }

    if (this.state.cursorGlowIntensity !== maxIntensity) {
      this.state.cursorGlowIntensity = maxIntensity;
      this.emit();
    }
  }

  private maybeStartGame() {
    if (this.collector.allCollected() && !this.state.active) {
      this.start();
    }
  }

  /** Register a seed star so it participates in the unlock check. */
  registerSeedStar(id: string) {
    this.collector.register(id);
    this.syncCounts();
    this.maybeStartGame();
  }

  /** Remove a seed star from the unlock check unless it has already been collected. */
  unregisterSeedStar(id: string) {
    this.collector.unregister(id);
    this.syncCounts();
    this.maybeStartGame();
  }

  /** Mark a registered seed star as collected. */
  markSeedCollected(id: string) {
    this.collector.markCollected(id);
    this.syncCounts();
    this.maybeStartGame();
  }

  /** Report a live glow contribution from a star. */
  reportCursorGlow(id: string, intensity: number) {
    if (intensity <= 0) {
      this.cursorGlowReports.delete(id);
      this.syncCursorGlow();
      return;
    }

    this.cursorGlowReports.set(id, Math.min(1, intensity));
    this.syncCursorGlow();
  }

  /** Clear a live glow contribution for a star. */
  clearCursorGlow(id: string) {
    if (this.cursorGlowReports.delete(id)) {
      this.syncCursorGlow();
    }
  }

  /** Activate the field once the seed collection phase is complete. */
  start() {
    if (!this.state.active) {
      this.state.active = true;
      this.emit();
    }
  }

  /** Return the store to its inactive state without touching progress counters. */
  stop() {
    if (this.state.active) {
      this.state.active = false;
      this.emit();
    }
  }

  /** Reset both the lifecycle state and the progress counters. */
  reset() {
    this.state = { active: false, total: 0, collected: 0, cursorGlowIntensity: 0 };
    this.collector = createCollector();
    this.cursorGlowReports.clear();
    this.emit();
  }

  /**
  * Keep the shared counters aligned with the internal collector.
   * This lets the rest of the UI react to stars mounting and unmounting dynamically.
   */
  setCounts(total: number, collected: number) {
    let changed = false;
    if (this.state.total !== total) {
      this.state.total = total;
      changed = true;
    }
    if (this.state.collected !== collected) {
      this.state.collected = collected;
      changed = true;
    }
    if (changed) this.emit();
  }

  /** Increment the collected counter directly for ad hoc consumers. */
  collect(n = 1) {
    this.state.collected += n;
    this.emit();
  }

  /** Read the current seed collection progress as a 0-1 ratio. */
  getSeedCollectionProgress() {
    return this.state.total > 0 ? this.state.collected / this.state.total : 0;
  }

  /** Read the current snapshot without subscribing. */
  getState() {
    return { ...this.state };
  }

  /** Subscribe to updates and receive the current snapshot immediately. */
  subscribe(listener: GameListener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    for (const l of Array.from(this.listeners)) l(this.getState());
  }
}

/** Shared singleton used by the provider, hook, and star components. */
export const starGame = new StarGame();
