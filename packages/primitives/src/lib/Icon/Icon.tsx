import { forwardRef, type SVGAttributes } from 'react';
import { cx } from '../_util/style';
import styles from './Icon.module.css';

/** Every glyph in the registry, in display order. */
export const ICON_NAMES = [
  'close',
  'check',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'chevron-down',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-down',
  'arrow-up-down',
  'bookmark',
  'bookmark-filled',
  'star',
  'share',
  'alert',
  'info',
  'upload',
  'external',
  'search',
  'menu',
  'plus',
  'minus',
  'edit',
  'trash',
  'calendar',
  'mail',
  'phone',
  'map-pin',
  'heart',
  'user',
  'settings',
  'filter',
  'download',
  'eye',
  'eye-off',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** 24×24 stroke paths (round caps and joins, currentColor). */
const ICON_PATHS: Record<IconName, readonly string[]> = {
  close: ['M18 6 6 18', 'M6 6l12 12'],
  check: ['M20 6 9 17l-5-5'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'chevron-up': ['m18 15-6-6-6 6'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-up': ['M12 19V5', 'm5 12 7-7 7 7'],
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-up-down': ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  bookmark: ['M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'],
  'bookmark-filled': ['M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'],
  star: [
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  ],
  share: [
    'M18 5m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M18 19m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'm8.6 13.5 6.8 4M15.4 6.5l-6.8 4',
  ],
  alert: [
    'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    'M12 9v4',
    'M12 17h.01',
  ],
  info: [
    'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
    'M12 16v-4',
    'M12 8h.01',
  ],
  upload: [
    'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
    'm17 8-5-5-5 5',
    'M12 3v12',
  ],
  external: [
    'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
    'M15 3h6v6',
    'M10 14 21 3',
  ],
  search: ['M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'm21 21-4.35-4.35'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z'],
  trash: [
    'M3 6h18',
    'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
    'M10 11v6',
    'M14 11v6',
    'M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  ],
  calendar: [
    'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M16 2v4',
    'M8 2v4',
    'M3 10h18',
  ],
  mail: [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'm22 6-10 7L2 6',
  ],
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
  ],
  'map-pin': [
    'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z',
    'M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  ],
  heart: [
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z',
  ],
  user: [
    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
    'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  ],
  settings: [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7.5 7.5 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.5 7.5 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7.5 7.5 0 0 0 1.7-1l2.3 1 2-3.4z',
  ],
  filter: ['M22 3H2l8 9.46V19l4 2v-8.54z'],
  download: [
    'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
    'm7 10 5 5 5-5',
    'M12 15V3',
  ],
  eye: [
    'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z',
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  ],
  'eye-off': [
    'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94',
    'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19',
    'M14.12 14.12a3 3 0 1 1-4.24-4.24',
    'M1 1l22 22',
  ],
};

/** Glyphs drawn as a solid shape rather than an outline. */
const FILLED: ReadonlySet<IconName> = new Set<IconName>(['bookmark-filled']);

export interface IconProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'name' | 'children'
> {
  name: IconName;
  /** Rendered width and height in px. */
  size?: number;
  /** Accessible name. Without it the icon is decorative (`aria-hidden`). */
  label?: string;
  strokeWidth?: number;
}

/** Icon — a stroked glyph from the shared registry. Inherits currentColor. */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 20, label, strokeWidth = 2, className, ...props },
  ref,
) {
  const paths = ICON_PATHS[name] ?? [];
  const filled = FILLED.has(name);
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-icon={name}
      {...props}
      className={cx(styles.icon, className)}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
});
Icon.displayName = 'Icon';
