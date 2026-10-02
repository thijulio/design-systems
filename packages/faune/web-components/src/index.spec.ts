import * as primitives from '@thijulio/primitives-web-components';
import * as faune from './index';

describe('@thijulio/faune-web-components', () => {
  it('re-exports every shared element unchanged', () => {
    expect(Object.keys(faune).sort()).toEqual(Object.keys(primitives).sort());
    for (const name of Object.keys(primitives) as Array<
      keyof typeof primitives
    >) {
      expect(faune[name]).toBe(primitives[name]);
    }
  });

  it('registers the tj-* tags once defineCustomElements() runs', () => {
    expect(customElements.get('tj-button')).toBeUndefined();
    faune.defineCustomElements();
    // Idempotent: Stencil skips tags that are already defined.
    expect(() => faune.defineCustomElements()).not.toThrow();
    expect(customElements.get('tj-button')).toBeDefined();
    expect(customElements.get('tj-input')).toBeDefined();
  });
});
