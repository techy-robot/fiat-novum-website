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

/** 2D point used for cursor and star positions. */
export type Position = {
  x: number;
  y: number;
};

/**
 * Default interaction tuning shared by the glow surface and star components.
 * Keeping these values in one place prevents the field from drifting out of sync.
 */
export const DEFAULTS = {
  activationRadius: 48,
  size: 14,
  interactionMode: "gameState" as const,
  twinkleDuration: 2.7,
  twinkleDelay: 0,
  callbackSequence: 0,
  callbackTarget: null,
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

/** Convert viewport coordinates into the star's local parent coordinates. */
export function getLocalCursorPosition(cursor: Position, starElement: HTMLSpanElement | null) {
  const offsetParent = starElement?.offsetParent instanceof HTMLElement ? starElement.offsetParent : starElement?.parentElement;

  if (!offsetParent) {
    return cursor;
  }

  const rect = offsetParent.getBoundingClientRect();
  return {
    x: cursor.x - rect.left,
    y: cursor.y - rect.top,
  };
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
type GameState = { active: boolean; total: number; collected: number; resetRevision: number };
type GameListener = (s: GameState) => void;

type PersistedStarGameState = {
  version: 1;
  active: boolean;
  collectedStarIds: string[];
};

const STAR_GAME_STORAGE_KEY = "fiat-novum.star-game-state";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function uniqueStrings(values: unknown) {
  if (!Array.isArray(values)) return [];

  return Array.from(new Set(values.filter((value): value is string => typeof value === "string")));
}

function readPersistedStarGameState(): PersistedStarGameState | null {
  if (!canUseLocalStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(STAR_GAME_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<PersistedStarGameState> & { collectedStarIds?: unknown };
    if (parsed.version !== 1 || typeof parsed.active !== "boolean") {
      return null;
    }

    return {
      version: 1,
      active: parsed.active,
      collectedStarIds: uniqueStrings(parsed.collectedStarIds),
    };
  } catch {
    return null;
  }
}

function writePersistedStarGameState(state: PersistedStarGameState) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(STAR_GAME_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures so the game keeps working in restricted contexts.
  }
}

/**
 * Observable singleton store for the star-game lifecycle and counters.
 * The shared hooks keep React in sync with this store so the rest of the UI can stay declarative.
 */
class StarGame {
  private state: GameState = { active: false, total: 0, collected: 0, resetRevision: 0 };
  private listeners = new Set<GameListener>();
  private collector = createCollector();
  private cursorGlowReports = new Map<string, number>();
  private collectedStarIds = new Set<string>();
  private hydrated = false;

  hydrate() {
    if (this.hydrated) return;

    this.hydrated = true;

    const persisted = readPersistedStarGameState();
    if (!persisted) return;

    let changed = false;
    let nextActive = this.state.active;

    if (this.state.active !== persisted.active) {
      nextActive = persisted.active;
      changed = true;
    }

    if (persisted.collectedStarIds.length > 0) {
      this.collectedStarIds = new Set(persisted.collectedStarIds);
    }

    if (changed) {
      this.state = { ...this.state, active: nextActive };
      this.emit();
    }
  }

  private persist() {
    writePersistedStarGameState({
      version: 1,
      active: this.state.active,
      collectedStarIds: Array.from(this.collectedStarIds),
    });
  }

  private syncCounts() {
    const total = this.collector.getSeedCount();
    const collected = this.collector.getCollectedCount();

    if (this.state.total !== total || this.state.collected !== collected) {
      this.state = { ...this.state, total, collected };
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

    if (this.collectedStarIds.has(id)) {
      this.collector.markCollected(id);
    }

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
    this.markCollected(id);
    this.collector.markCollected(id);
    this.syncCounts();
    this.maybeStartGame();
  }

  /** Remember that a star has been collected on this device. */
  markCollected(id: string) {
    if (this.collectedStarIds.has(id)) return;

    this.collectedStarIds.add(id);
    this.persist();
  }

  /** Read whether a star has already been collected on this device. */
  isCollected(id: string) {
    return this.collectedStarIds.has(id);
  }

  /** Activate the field once the seed collection phase is complete. */
  start() {
    if (!this.state.active) {
      this.state = { ...this.state, active: true };
      this.persist();
      this.emit();
    }
  }

  /** Return the store to its inactive state without touching progress counters. */
  stop() {
    if (this.state.active) {
      this.state = { ...this.state, active: false };
      this.persist();
      this.emit();
    }
  }

  /** Reset both the lifecycle state and the progress counters. */
  reset() {
    this.state = { active: false, total: 0, collected: 0, resetRevision: this.state.resetRevision + 1 };
    this.collector = createCollector();
    this.cursorGlowReports.clear();
    this.collectedStarIds.clear();
    this.hydrated = true;
    this.persist();
    this.emit();
  }

  /**
  * Keep the shared counters aligned with the internal collector.
   * This lets the rest of the UI react to stars mounting and unmounting dynamically.
   */
  setCounts(total: number, collected: number) {
    if (this.state.total !== total || this.state.collected !== collected) {
      this.state = { ...this.state, total, collected };
      this.emit();
    }
  }

  /** Increment the collected counter directly for ad hoc consumers. */
  collect(n = 1) {
    this.state = { ...this.state, collected: this.state.collected + n };
    this.emit();
  }

  /** Read the current seed collection progress as a 0-1 ratio. */
  getSeedCollectionProgress() {
    return this.state.total > 0 ? this.state.collected / this.state.total : 0;
  }

  /** Read the current snapshot without subscribing. */
  getState() {
    return this.state;
  }

  /** Subscribe to updates. Returns cleanup function. */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
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
