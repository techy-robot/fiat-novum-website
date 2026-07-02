"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimate, AnimationPlaybackControls } from 'framer-motion';
import UiButton from "@/components/UI/UiButton";
import DynamicIcon from "@/components/UI/DynamicIcon";
import { Skill } from "@/types/skills";
import styles from "./SkillsMarquee.module.css";

interface SkillsMarqueeProps {
  skills: Skill[];
  speed?: number; // duration in seconds for one full loop cycle
}

export default function SkillsMarquee({ skills, speed = 30 }: SkillsMarqueeProps) {
  const [scope, animate] = useAnimate();
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  // Duplicate the skills array 4 times to ensure seamless infinite looping on any screen size
  const marqueeItems = React.useMemo(() => {
    if (!skills || skills.length === 0) return [];
    return [...skills, ...skills, ...skills, ...skills];
  }, [skills]);

  // Framer Motion (motion.dev) animation setup with percentage-based transform (0% to -50%)
  // This allows seamless looping and continuous fluid scaling on resize without JS layout calculations.
  useEffect(() => {
    if (!scope.current || marqueeItems.length === 0) return;

    animationRef.current = animate(
      scope.current,
      { x: ["0%", "-50%"] },
      {
        ease: "linear",
        duration: speed,
        repeat: Infinity,
        repeatType: "loop",
      }
    );

    return () => {
      animationRef.current?.stop();
    };
  }, [speed, animate, scope, marqueeItems.length]);

  // Handle play/pause smoothly on hover
  useEffect(() => {
    if (animationRef.current) {
      if (isHovered) {
        animationRef.current.pause();
      } else {
        animationRef.current.play();
      }
    }
  }, [isHovered]);

  if (marqueeItems.length === 0) return null;

  return (
    <div
      className={styles.marqueeContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div ref={scope} className={styles.marqueeTrack}>
        {marqueeItems.map((skill, index) => (
          <div key={`${skill.name}-${index}`} className={styles.marqueeItem}>
            <UiButton
              label={skill.name}
              linkTo={skill.link}
              iconStart={true}
              iconSlot={
                <DynamicIcon
                  iconName={skill.iconName}
                  size={20}
                  stroke={1.5}
                  color="#000000"
                  style={{ marginRight: "8px" }}
                />
              }
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
