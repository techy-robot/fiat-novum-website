export type StarFieldRole = "seed" | "collectable" | "fixed";

export type StarFieldDefinition = {
  id: string;
  role: StarFieldRole;
  x: number;
  y: number;
  size: number;
  twinkleDuration: number;
  twinkleDelay?: number;
};

export type PositionedStarFieldDefinition = StarFieldDefinition;

export const STAR_FIELD_LAYOUT_SIZE = { width: 840, height: 320 };

export const STAR_FIELD_STARS: StarFieldDefinition[] = [
  { id: "seed-1", role: "seed", x: 96, y: 82, size: 18, twinkleDuration: 2.4 },
  { id: "seed-2", role: "seed", x: 220, y: 178, size: 14, twinkleDuration: 2.9, twinkleDelay: 0.25 },
  { id: "seed-3", role: "seed", x: 372, y: 120, size: 16, twinkleDuration: 2.6, twinkleDelay: 0.5 },
  { id: "collect-1", role: "collectable", x: 492, y: 204, size: 15, twinkleDuration: 3.2 },
  { id: "collect-2", role: "collectable", x: 612, y: 108, size: 13, twinkleDuration: 2.7, twinkleDelay: 0.2 },
  { id: "collect-3", role: "collectable", x: 744, y: 182, size: 17, twinkleDuration: 3, twinkleDelay: 0.4 },
  { id: "fixed-1", role: "fixed", x: 164, y: 266, size: 10, twinkleDuration: 4.1, twinkleDelay: 0.15 },
  { id: "fixed-2", role: "fixed", x: 564, y: 54, size: 9, twinkleDuration: 3.7, twinkleDelay: 0.55 },
  { id: "fixed-3", role: "fixed", x: 802, y: 256, size: 11, twinkleDuration: 4.4, twinkleDelay: 0.8 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeX(value: number) {
  return value / STAR_FIELD_LAYOUT_SIZE.width;
}

function normalizeY(value: number) {
  return value / STAR_FIELD_LAYOUT_SIZE.height;
}

function getContainerBounds(width: number, height: number) {
  const paddingX = clamp(width * 0.06, 18, 56);
  const paddingY = clamp(height * 0.08, 18, 48);

  return {
    minX: paddingX,
    maxX: Math.max(paddingX, width - paddingX),
    minY: paddingY,
    maxY: Math.max(paddingY, height - paddingY),
  };
}

function applySpacing(stars: PositionedStarFieldDefinition[], width: number, height: number) {
  if (stars.length <= 1) return stars;

  const minimumDistance = Math.max(28, Math.min(width, height) * 0.12);
  const bounds = getContainerBounds(width, height);
  const placed: PositionedStarFieldDefinition[] = [];

  for (const star of stars) {
    let x = clamp(star.x, bounds.minX, bounds.maxX);
    let y = clamp(star.y, bounds.minY, bounds.maxY);
    const seed = hashString(star.id);

    for (let attempt = 0; attempt < 24; attempt += 1) {
      let hasCollision = false;

      for (const other of placed) {
        const distance = Math.hypot(x - other.x, y - other.y);
        const requiredDistance = minimumDistance + (star.size + other.size) * 0.35;

        if (distance < requiredDistance) {
          hasCollision = true;
          break;
        }
      }

      if (!hasCollision) {
        break;
      }

      const angle = ((seed + attempt * 97) % 360) * (Math.PI / 180);
      const strength = 8 + attempt * 1.7;
      x = clamp(x + Math.cos(angle) * strength, bounds.minX, bounds.maxX);
      y = clamp(y + Math.sin(angle) * strength, bounds.minY, bounds.maxY);
    }

    placed.push({ ...star, x, y });
  }

  return placed;
}

/**
 * Convert the field's design coordinates into responsive positions for the current surface.
 * The layout keeps the overall constellation shape while still allowing the points to nudge apart
 * when the available space gets tight.
 */
export function layoutStarField(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return STAR_FIELD_STARS.map((star) => ({ ...star }));
  }

  const scaled = STAR_FIELD_STARS.map((star) => ({
    ...star,
    x: width * normalizeX(star.x),
    y: height * normalizeY(star.y),
  }));

  return applySpacing(scaled, width, height);
}

export function getStarInteractionMode(role: StarFieldRole) {
  if (role === "seed") return "seed" as const;
  if (role === "fixed") return "fixed" as const;
  return "gameState" as const;
}