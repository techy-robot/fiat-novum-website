"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbsProps {
  pageTitle?: string;
  customLabels?: Record<string, string>;
  className?: string;
  style?: React.CSSProperties;
}

const staticLabels: Record<string, string> = {
  "/": "Home",
  "/blog": "Blog",
  "/projects": "Projects",
  "/skills": "Skills",
  "/dev": "Development",
};

export default function Breadcrumbs({ pageTitle, customLabels, className, style }: BreadcrumbsProps) {
  const pathname = usePathname();
  if (!pathname) return null;

  // Split path into segments and filter empty ones
  const segments = pathname.split("/").filter(Boolean);

  // If we are on home, don't show breadcrumbs
  if (segments.length === 0) return null;

  // Filter out purely numeric segments (like dates in blog routes)
  // This is only because I don't have pages for dates yet
  const cleanSegments = segments.filter((seg) => isNaN(Number(seg)));

  // Construct the breadcrumbs list: Home / Segment1 / Segment2 / ...
  const items: { label: string; href: string; isLast: boolean }[] = [];

  // Always start with Home
  items.push({
    label: "Home",
    href: "/",
    isLast: false,
  });

  // Helper to format string to Title Case
  const formatLabel = (str: string) => {
    return str
      .split(/[- ]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  cleanSegments.forEach((segment, index) => {
    const isLast = index === cleanSegments.length - 1;
    
    // Find the original path segments up to this clean segment
    const originalIdx = segments.lastIndexOf(segment);
    const pathSegments = segments.slice(0, originalIdx + 1);
    const href = "/" + pathSegments.join("/");

    let label = (customLabels && customLabels[href]) || staticLabels[href] || formatLabel(segment);
    if (isLast && pageTitle) {
      label = pageTitle;
    }

    items.push({
      label,
      href,
      isLast,
    });
  });

  return (
    <nav 
      aria-label="breadcrumb" 
      className={`${styles.breadcrumbs} ${className ?? ""}`}
      style={style}
    >
      {items.map((item, idx) => {
        const showSeparator = idx < items.length - 1;
        return (
          <React.Fragment key={item.href + idx}>
            {item.isLast ? (
              <span className={styles.breadcrumbsLast}>
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className={styles.breadcrumbsLink}
              >
                {item.label}
              </Link>
            )}
            {showSeparator && (
              <span className={styles.breadcrumbsSeparator}>/</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
