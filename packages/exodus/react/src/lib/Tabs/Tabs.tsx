import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import styles from './Tabs.module.css';

export interface TabItem {
  value: string;
  label: ReactNode;
  /** Optional count chip. */
  count?: number;
  disabled?: boolean;
  /** Rendered as the tab's `data-testid`. */
  testId?: string;
}

/**
 * `value` made safe inside an id: whitespace would split an IDREF list
 * (`aria-controls`, `aria-labelledby`). Letters, digits, `-` and `_` stay as
 * they are, so plain values keep readable ids; anything else is
 * percent-encoded with `_` in place of `%` (`"for sale"` → `for_20sale`).
 */
function idSegment(value: string): string {
  return encodeURIComponent(value).replace(/[^A-Za-z0-9_-]/g, (char) =>
    char === '%'
      ? '_'
      : `_${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
  );
}

/** id of the tab for `value`, as rendered by Tabs with this `idBase`. */
export function tabId(idBase: string, value: string): string {
  return `${idBase}-tab-${idSegment(value)}`;
}

/** id of the panel for `value`; pair with `<TabPanel idBase value>`. */
export function tabPanelId(idBase: string, value: string): string {
  return `${idBase}-panel-${idSegment(value)}`;
}

export type TabsVariant = 'underline' | 'pill';

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'aria-label' | 'role'
> {
  tabs: TabItem[];
  /** Accessible name of the tablist (required: there is no English default). */
  label: string;
  /** Selected tab value (controlled). */
  value?: string;
  /** Initially selected tab value (uncontrolled). Defaults to the first enabled tab. */
  defaultValue?: string;
  /** Called with the newly selected tab value. */
  onChange?: (value: string) => void;
  /** Prefix for tab/panel ids (`tabId(idBase, value)`). Defaults to a generated id. */
  idBase?: string;
  /**
   * Set `aria-controls` on each tab. Only when a `TabPanel` with the same
   * `idBase` is rendered (hidden when inactive) for every tab.
   */
  controlsPanels?: boolean;
  /**
   * id of one panel that every tab controls: each tab's `aria-controls` is
   * this id. Render a single `TabPanel` with the same `idBase` and
   * `panelId`, and the selected `value`. Wins over `controlsPanels`.
   */
  panelId?: string;
  /**
   * `underline` (default): a bar with an accent underline under the active
   * tab. `pill`: wrapping bordered chips, the active one filled.
   */
  variant?: TabsVariant;
}

/**
 * Tabs — tab bar with roving tabindex and Arrow/Home/End keys. The active tab
 * gets the accent underline, or the filled chip with `variant="pill"`.
 * Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`). Panels
 * are one per tab (`controlsPanels`) or one shared panel (`panelId`).
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    tabs,
    label,
    value,
    defaultValue,
    onChange,
    idBase: idBaseProp,
    controlsPanels = false,
    panelId,
    variant = 'underline',
    className,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const idBase = idBaseProp ?? generatedId;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const firstEnabled = tabs.find((tab) => !tab.disabled)?.value;
  const selectedValue = (isControlled ? value : internalValue) ?? firstEnabled;
  // Keep one tab reachable with Tab even when the selection is unknown.
  const tabbableValue = tabs.some(
    (tab) => tab.value === selectedValue && !tab.disabled,
  )
    ? selectedValue
    : firstEnabled;

  function select(next: string) {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

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
    select(tabs[nextIndex].value);
    event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  return (
    <div
      {...props}
      ref={ref}
      role="tablist"
      aria-label={label}
      className={cx(styles.tabs, variant === 'pill' && styles.pill, className)}
    >
      {tabs.map((tab, index) => {
        const active = tab.value === selectedValue;
        return (
          <button
            key={tab.value}
            id={tabId(idBase, tab.value)}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={
              panelId ??
              (controlsPanels ? tabPanelId(idBase, tab.value) : undefined)
            }
            tabIndex={tab.value === tabbableValue ? 0 : -1}
            disabled={tab.disabled}
            data-testid={tab.testId}
            className={cx(
              styles.tab,
              active && styles.active,
              tab.disabled && styles.disabled,
            )}
            onClick={() => !tab.disabled && select(tab.value)}
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
});

Tabs.displayName = 'Tabs';

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Same `idBase` as the Tabs it belongs to. */
  idBase: string;
  /** The tab value this panel shows (the selected one for a shared panel). */
  value: string;
  /**
   * id of a panel shared by every tab: the `panelId` given to Tabs. The
   * panel is then labelled by the tab for `value`.
   */
  panelId?: string;
  /** Whether its tab is selected; unselected panels are `hidden`. */
  selected: boolean;
  children?: ReactNode;
}

/**
 * TabPanel — the `role="tabpanel"` region a tab controls (labelled by its
 * tab). With `panelId` it is the one panel all tabs share.
 */
export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel(
    { idBase, value, selected, panelId, className, children, ...props },
    ref,
  ) {
    return (
      <div
        // Focusable so keyboard users can reach a panel without focusable content.
        tabIndex={0}
        {...props}
        ref={ref}
        role="tabpanel"
        id={panelId ?? tabPanelId(idBase, value)}
        aria-labelledby={tabId(idBase, value)}
        hidden={!selected}
        className={cx(styles.panel, className)}
      >
        {children}
      </div>
    );
  },
);

TabPanel.displayName = 'TabPanel';
