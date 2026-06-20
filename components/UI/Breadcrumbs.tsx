"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface BreadcrumbsProps {
  pageTitle?: string;
}

export default function Breadcrumbs({ pageTitle }: BreadcrumbsProps) {
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

    let label = formatLabel(segment);
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
        fontSize: "1.25rem",
        fontFamily: "'Nunito', Arial, sans-serif",
        color: "var(--foreground, #00ffa5)",
        marginBottom: "1.5rem",
        border: "2px solid var(--foreground, #00ffa5)",
        borderRadius: "9999px",
        padding: "0.4rem 1.25rem",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
    >
      {items.map((item, idx) => {
        const showSeparator = idx < items.length - 1;
        return (
          <React.Fragment key={item.href + idx}>
            {item.isLast ? (
              <span style={{ fontWeight: "normal", opacity: 0.85 }}>
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                style={{
                  color: "var(--foreground, #00ffa5)",
                  textDecoration: "underline",
                  transition: "color 0.3s ease, text-decoration-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#45abb7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--foreground, #00ffa5)";
                }}
              >
                {item.label}
              </Link>
            )}
            {showSeparator && (
              <span style={{ opacity: 0.5, userSelect: "none" }}>/</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
