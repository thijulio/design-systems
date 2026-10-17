import * as primitives from '@thijulio/primitives';
import * as exodus from './index';

describe('@thijulio/exodus-react', () => {
  it('exports every shared primitive, re-exported or wrapped', () => {
    // A new primitive must reach the Exodus entry point, either from the
    // re-exported-unchanged block or as an Exodus wrapper of the same name, so
    // consumers never need `@thijulio/primitives` directly. Faune's own
    // `index.spec.tsx` holds Faune to the same catalog; brand packages may not
    // import each other, so each checks itself.
    const shared = Object.keys(primitives);
    const missing = shared.filter(
      (name) => exodus[name as keyof typeof exodus] === undefined,
    );

    expect(shared.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
