import { render, screen } from '@testing-library/react';
import * as primitives from '@thijulio/primitives';
import * as faune from './index';

describe('@thijulio/faune-react', () => {
  it('re-exports every shared primitive unchanged', () => {
    // A new primitive must be adopted (or deliberately excluded) here, so the
    // Faune surface never silently drifts from the shared catalog.
    expect(Object.keys(faune).sort()).toEqual(Object.keys(primitives).sort());
    for (const name of Object.keys(primitives) as Array<
      keyof typeof primitives
    >) {
      expect(faune[name]).toBe(primitives[name]);
    }
  });

  it('renders a primitive through the brand entry point', () => {
    render(<faune.Button>Adopt Rocket</faune.Button>);
    expect(
      screen.getByRole('button', { name: 'Adopt Rocket' }),
    ).toBeInTheDocument();
  });
});
