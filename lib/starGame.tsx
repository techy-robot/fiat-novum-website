"use client";

import React from "react";

export type CursorState = {
  x: number;
  y: number;
  inside: boolean;
};

export const DEFAULTS = {
  seedActivationRadius: 48,
  collectRadius: 48,
  driftSpeed: 0.085,
};

export function distanceBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

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

export function useMouseTracker() {
  const [cursor, setCursor] = React.useState<CursorState>({ x: 0, y: 0, inside: false });

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setCursor({ x: event.clientX - rect.left, y: event.clientY - rect.top, inside: true });
  }, []);

  const onPointerLeave = React.useCallback(() => {
    setCursor((prev) => ({ ...prev, inside: false }));
  }, []);

  return { cursor, onPointerMove, onPointerLeave } as const;
}

type GameState = { active: boolean; total: number; collected: number };
type GameListener = (s: GameState) => void;

class StarGame {
  private state: GameState = { active: false, total: 0, collected: 0 };
  private listeners = new Set<GameListener>();

  start() {
    if (!this.state.active) {
      this.state.active = true;
      this.emit();
    }
  }

  stop() {
    if (this.state.active) {
      this.state.active = false;
      this.emit();
    }
  }

  reset() {
    this.state = { active: false, total: 0, collected: 0 };
    this.emit();
  }

  // Update totals (useful when provider manages per-area seeds)
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

  collect(n = 1) {
    this.state.collected += n;
    this.emit();
  }

  getState() {
    return { ...this.state };
  }

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

export const starGame = new StarGame();
