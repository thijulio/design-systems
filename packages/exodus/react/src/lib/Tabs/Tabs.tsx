import type { KeyboardEvent, ReactNode } from 'react';
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
  const selectedValue = value ?? tabs.find((tab) => !tab.disabled)?.value;

  function moveToTab(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const enabledIndexes = tabs.flatMap((tab, index) =>
      tab.disabled ? [] : [index],
    );
    const enabledPosition = enabledIndexes.indexOf(currentIndex);
    if (enabledPosition === -1) return;

    const nextPosition =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? (enabledPosition + 1) % enabledIndexes.length
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? (enabledPosition - 1 + enabledIndexes.length) %
            enabledIndexes.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? enabledIndexes.length - 1
              : undefined;

    if (nextPosition === undefined) return;

    const nextIndex = enabledIndexes[nextPosition];
    event.preventDefault();
    onChange?.(tabs[nextIndex].value);
    event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  return (
    <div
      className={cx(styles.tabs, className)}
      role="tablist"
      aria-label="Content sections"
    >
      {tabs.map((tab, index) => {
        const active = tab.value === selectedValue;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={tab.disabled}
            className={cx(
              styles.tab,
              active && styles.active,
              tab.disabled && styles.disabled,
            )}
            onClick={() => !tab.disabled && onChange?.(tab.value)}
            onKeyDown={(event) => moveToTab(event, index)}
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
