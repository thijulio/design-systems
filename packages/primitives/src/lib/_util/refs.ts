import { version, type ReactElement, type Ref, type RefCallback } from 'react';

/** Assign one node to several refs (callback or object). */
export function composeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

const REACT_MAJOR = Number.parseInt(version, 10);

/**
 * The ref a caller put on an element. React 19 moved it into `props`; reading
 * `element.ref` there logs a deprecation warning, so branch on the version.
 */
export function getElementRef(element: ReactElement): Ref<unknown> | undefined {
  if (REACT_MAJOR >= 19) {
    return (element.props as { ref?: Ref<unknown> }).ref;
  }
  return (element as unknown as { ref?: Ref<unknown> }).ref;
}
