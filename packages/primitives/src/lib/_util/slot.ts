import {
  cloneElement,
  isValidElement,
  useMemo,
  type Attributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { composeRefs, getElementRef } from './refs';
import { cx } from './style';

type AnyProps = Record<string, unknown>;

const HANDLER = /^on[A-Z]/;

/** The entries whose value is not `undefined`. */
function defined(props: AnyProps): AnyProps {
  const out: AnyProps = {};
  for (const key of Object.keys(props)) {
    if (props[key] !== undefined) out[key] = props[key];
  }
  return out;
}

/**
 * Merge the props a component wants on its `asChild` element with the child's
 * own props. The child's values win, except: handlers run child-first then
 * ours (a child calling `preventDefault()` can veto ours), `className` is
 * joined, `style` is merged. An `undefined` value on either side never
 * overrides a defined one.
 */
export function mergeSlotProps(
  rawSlotProps: AnyProps,
  rawChildProps: AnyProps,
): AnyProps {
  const slotProps = defined(rawSlotProps);
  const childProps = defined(rawChildProps);
  const merged: AnyProps = { ...slotProps, ...childProps };
  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (HANDLER.test(key) && typeof slotValue === 'function') {
      merged[key] =
        typeof childValue === 'function'
          ? (...args: unknown[]) => {
              (childValue as (...a: unknown[]) => void)(...args);
              const event = args[0] as { defaultPrevented?: boolean } | undefined;
              if (!event?.defaultPrevented) {
                (slotValue as (...a: unknown[]) => void)(...args);
              }
            }
          : slotValue;
    } else if (key === 'style') {
      merged.style = { ...(slotValue as object), ...(childValue as object) };
    }
  }
  merged.className = cx(
    slotProps.className as string | undefined,
    childProps.className as string | undefined,
  );
  return merged;
}

/**
 * One stable ref callback for the component's forwarded ref and, when
 * `children` is an `asChild` element, the child's own ref. Call it on every
 * render (it is a hook); a new callback each render would make React detach
 * and re-attach both refs.
 */
export function useSlotRef<T>(
  ref: Ref<T> | undefined,
  children: ReactNode,
): Ref<T> {
  const childRef = isValidElement(children)
    ? (getElementRef(children) as Ref<T> | undefined)
    : undefined;
  return useMemo(() => composeRefs<T>(ref, childRef), [ref, childRef]);
}

/**
 * Render `child` in place of the component's own element (`asChild`), with
 * merged props and `ref` (from `useSlotRef`, which already includes the
 * child's own ref). `children`, when given, replaces the child's children
 * (used to append visually hidden text).
 */
export function cloneAsChild(
  child: ReactElement<AnyProps>,
  slotProps: AnyProps,
  ref: Ref<unknown> | undefined,
  children?: ReactNode,
): ReactElement {
  const merged = mergeSlotProps(slotProps, child.props);
  merged.ref = ref;
  const props = merged as Partial<AnyProps> & Attributes;
  return children === undefined
    ? cloneElement(child, props)
    : cloneElement(child, props, children);
}
