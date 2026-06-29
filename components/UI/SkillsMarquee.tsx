"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimate, AnimationPlaybackControls } from 'framer-motion';
import UiButton from "@/components/UI/UiButton";
import DynamicIcon from "@/components/UI/DynamicIcon";
import { Skill } from "@/types/skills";
import styles from "./SkillsMarquee.module.css";

interface SkillsMarqueeProps {
  skills: Skill[];
  speed?: number; // pixels per second
}

export default function SkillsMarquee({ skills, speed = 50 }: SkillsMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const singleSetRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();

  const [singleWidth, setSingleWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  // Measure container and single set widths
  useEffect(() => {
    const handleResize = () => {
      if (singleSetRef.current && containerRef.current) {
        setSingleWidth(singleSetRef.current.offsetWidth);
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Perform initial measurement
    handleResize();

    // Set up resize observer to keep measurements updated dynamically
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (singleSetRef.current) {
      resizeObserver.observe(singleSetRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Compute number of copies needed to avoid gaps on big screens.
  // We need enough copies such that (numCopies - 1) * singleWidth >= containerWidth.
  // Plus we always need at least 2 copies to loop.
  const numCopies = singleWidth > 0 && containerWidth > 0
    ? Math.max(2, Math.ceil(containerWidth / singleWidth) + 1)
    : 3; // Fallback during SSR / initial mount

  // Control animation when singleWidth or speed changes
  useEffect(() => {
    if (singleWidth > 0) {
      animationRef.current?.stop();
      animationRef.current = animate(
        scope.current,
        { x: [0, -singleWidth] },
        {
          ease: "linear",
          duration: singleWidth / speed,
          repeat: Infinity,
          repeatType: "loop",
        }
      );
    }
    return () => {
      animationRef.current?.stop();
    };
  }, [singleWidth, speed, animate, scope]);

  // Handle play/pause on hover changes
  useEffect(() => {
    if (animationRef.current) {
      if (isHovered) {
        animationRef.current.pause();
      } else {
        animationRef.current.play();
      }
    }
  }, [isHovered, singleWidth]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        overflow: "hidden",
        width: "100%",
        display: "flex",
        gridColumn: "1 / -1",
        padding: "16px 0",
        alignItems: "center",
      }}
    >
      <motion.div
        ref={scope}
        style={{
          display: "flex",
          flexDirection: "row",
          width: "max-content",
          flexWrap: "nowrap",
          willChange: "transform",
          alignItems: "center",
        }}
      >
        {Array.from({ length: numCopies }).map((_, copyIndex) => (
          <div
            key={copyIndex}
            ref={copyIndex === 0 ? singleSetRef : undefined}
            style={{
              display: "flex",
              flexDirection: "row",
              flexShrink: 0,
              alignItems: "center",
            }}
          >
            {skills.map((skill, i) => {
              const iconKey = `Icon${skill.iconName}`;
              const IconsRecord = Icons as unknown as Record<string, React.FC<IconProps>>;
              const SelectedIcon = IconsRecord[iconKey] || Icons.IconCpu;

              return (
                <div
                  key={`${skill.name}-${i}`}
                  style={{
                    padding: "0 8px",
                    display: "inline-flex",
                  }}
                >
                  <UiButton
                    label={skill.name}
                    linkTo={skill.link}
                    iconStart={true}
                    iconSlot={
                      <SelectedIcon
                        size={20}
                        stroke={1.5}
                        color="#000000"
                        style={{ marginRight: "8px" }}
                      />
                    }
                  />
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
