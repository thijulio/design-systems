import type { CSSProperties } from 'react';

/**
 * The standard inline-SVG glyph set, keyed by name. The whole product draws
 * icons from this one registry (round caps, currentColor) — never emoji, never
 * a webfont.
 */
export const ICON_PATHS = {
  dashboard: ['M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z'],
  animals: ['M4 7h16M4 12h16M4 17h16'],
  paw: [
    'M6.3 5.5a1.7 1.7 0 1 0 3.4 0 1.7 1.7 0 1 0 -3.4 0',
    'M14.3 5.5a1.7 1.7 0 1 0 3.4 0 1.7 1.7 0 1 0 -3.4 0',
    'M2.4 11a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0 -3.2 0',
    'M18.4 11a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0 -3.2 0',
    'M12 12.5c3 0 5.3 2.2 5.3 4.7 0 2-1.6 3.3-3.5 3.3-.7 0-1.2-.3-1.8-.3s-1.1.3-1.8.3c-1.9 0-3.5-1.3-3.5-3.3 0-2.5 2.3-4.7 5.3-4.7z',
  ],
  litters: ['M12 2 2 7l10 5 10-5z', 'M2 17l10 5 10-5M2 12l10 5 10-5'],
  reservations: [
    'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  ],
  clients: [
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  ],
  milestones: [
    'M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M9.5 13.5 7 22l5-3 5 3-2.5-8.5',
  ],
  documents: [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
  ],
  members: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 .01M22 21v-2a4 4 0 0 0-3-3.87',
  ],
  settings: [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7.5 7.5 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.5 7.5 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7.5 7.5 0 0 0 1.7-1l2.3 1 2-3.4z',
  ],
  search: ['M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'm20 20-3-3'],
  bell: [
    'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  ],
  pin: [
    'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z',
    'M12 10m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0',
  ],
  heart: [
    'M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5 4.5 4.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7z',
  ],
  share: [
    'M18 5m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M18 19m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'm8.6 13.5 6.8 4M15.4 6.5l-6.8 4',
  ],
  plus: ['M12 5v14M5 12h14'],
  chevron: ['M6 9l6 6 6-6'],
  chevronRight: ['M9 18l6-6-6-6'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3'],
  filter: ['M3 6h18M7 12h10M11 18h2'],
  eye: [
    'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z',
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  ],
  lock: [
    'M5 11h14a0 0 0 0 1 0 0v9a0 0 0 0 1 0 0H5a0 0 0 0 1 0 0v-9a0 0 0 0 1 0 0z',
    'M8 11V8a4 4 0 0 1 8 0v3',
  ],
} as const;

export type IconName = keyof typeof ICON_PATHS;

export interface NavIconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

/** NavIcon — a stroked glyph from the shared registry. Inherits currentColor. */
export function NavIcon({
  name,
  size = 18,
  strokeWidth = 1.9,
  className,
  style,
  'aria-label': ariaLabel,
}: NavIconProps) {
  const paths = ICON_PATHS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
