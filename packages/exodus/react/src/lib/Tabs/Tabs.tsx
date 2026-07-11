import type { ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Tabs.module.css';

export interface TabItem {
  value: string;
  label: ReactNode;
  /** Optional count chip. */
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Currently selected tab value. */
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/** Tabs — underline tab bar. Active tab gets the accent underline. Controlled. */
export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cx(styles.tabs, className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={tab.disabled}
            className={cx(
              styles.tab,
              active && styles.active,
              tab.disabled && styles.disabled,
            )}
            onClick={() => !tab.disabled && onChange?.(tab.value)}
          >
            {tab.label}
            {tab.count != null && (
              <span className={styles.count}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
