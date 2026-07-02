"use client";

import React, { lazy, Suspense, useMemo } from "react";
import { IconCpu, type IconProps } from "@tabler/icons-react";

// In-memory cache for loaded icon components to optimize performance and bundle size
const iconCache = new Map<string, React.ComponentType<IconProps>>();

interface DynamicIconProps extends IconProps {
  iconName: string;
}

export default function DynamicIcon({ iconName, ...props }: DynamicIconProps) {
  const iconKey = useMemo(() => {
    if (!iconName) return "IconCpu";
    const cleaned = iconName.trim();
    return cleaned.startsWith("Icon") ? cleaned : `Icon${cleaned}`;
  }, [iconName]);

  const LazyIcon = useMemo(() => {
    if (iconCache.has(iconKey)) {
      return iconCache.get(iconKey)!;
    }

    const Component = lazy(async () => {
      try {
        const mod = await import("@tabler/icons-react");
        const FoundIcon = (mod as unknown as Record<string, React.ComponentType<IconProps>>)[iconKey];
        return { default: FoundIcon || mod.IconCpu };
      } catch {
        return { default: IconCpu };
      }
    });

    iconCache.set(iconKey, Component);
    return Component;
  }, [iconKey]);

  return (
    <Suspense fallback={<IconCpu {...props} />}>
      <LazyIcon {...props} />
    </Suspense>
  );
}
