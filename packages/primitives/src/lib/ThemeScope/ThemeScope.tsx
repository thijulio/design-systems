import {
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
} from 'react';
import { cloneAsChild, useSlotRef } from '../_util/slot';

/** The theme and mode in force, from the nearest scopes that set them. */
export interface ThemeScopeValue {
  theme?: string;
  mode?: string;
}

export interface ThemeScopeProps extends HTMLAttributes<HTMLElement> {
  /**
   * Theme name, set as `data-theme`. Unset, the scope puts no `data-theme`
   * on its element and passes the enclosing scope's theme on.
   */
  theme?: string;
  /**
   * Colour mode (e.g. `dark`), set as `data-mode`. Unset, the enclosing
   * scope's mode is passed on.
   */
  mode?: string;
  /** Element to render; defaults to `div`. */
  as?: ElementType;
  /**
   * Put `data-theme`, `data-mode`, props and ref on the single child element
   * instead of rendering a wrapper. `as` is ignored. The child's own
   * `data-theme` would win in the DOM, so set the theme here only.
   */
  asChild?: boolean;
}

const NO_SCOPE: ThemeScopeValue = {};

/**
 * Internal: read by portalled components (`Dialog`, `ToastViewport`), which
 * leave the themed DOM subtree but not the React tree.
 */
export const ThemeScopeContext = createContext<ThemeScopeValue>(NO_SCOPE);
ThemeScopeContext.displayName = 'ThemeScopeContext';

/**
 * The theme and mode of the nearest `ThemeScope` (each from the nearest
 * scope that set it). Empty outside any scope.
 */
export function useThemeScope(): ThemeScopeValue {
  return useContext(ThemeScopeContext);
}

/** The value a nested scope provides: its own values over the parent's. */
export function useNestedThemeScope(
  theme: string | undefined,
  mode: string | undefined,
): ThemeScopeValue {
  const parent = useThemeScope();
  const nextTheme = theme ?? parent.theme;
  const nextMode = mode ?? parent.mode;
  return useMemo(
    () => ({ theme: nextTheme, mode: nextMode }),
    [nextTheme, nextMode],
  );
}

/**
 * ThemeScope — sets `data-theme` (and `data-mode`) on its element, so the
 * theme's `--ds-*` tokens apply below it, and passes both down in React.
 * Portalled components read them from there, so a dialog keeps the theme of
 * the scope it was rendered in even when it opens without a focused opener.
 * Nested scopes override the enclosing one.
 */
export const ThemeScope = forwardRef<HTMLElement, ThemeScopeProps>(
  function ThemeScope(
    { theme, mode, as: Component = 'div', asChild = false, children, ...props },
    ref,
  ) {
    const value = useNestedThemeScope(theme, mode);
    const slotRef = useSlotRef(ref, asChild ? children : undefined);
    // Only the values set here: an `undefined` would erase a caller's own
    // `data-*` prop.
    const attributes: Record<string, string> = {};
    if (theme !== undefined) attributes['data-theme'] = theme;
    if (mode !== undefined) attributes['data-mode'] = mode;

    const element =
      asChild && isValidElement(children) ? (
        cloneAsChild(
          children as ReactElement<Record<string, unknown>>,
          { ...props, ...attributes },
          slotRef,
        )
      ) : (
        <Component ref={ref} {...props} {...attributes}>
          {children}
        </Component>
      );

    return (
      <ThemeScopeContext.Provider value={value}>
        {element}
      </ThemeScopeContext.Provider>
    );
  },
);
ThemeScope.displayName = 'ThemeScope';
