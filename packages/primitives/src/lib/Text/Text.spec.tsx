import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';
import styles from './Text.module.css';

describe('Text', () => {
  it('renders a paragraph with body size and default tone', () => {
    render(<Text>Hello</Text>);
    const p = screen.getByText('Hello');
    expect(p.tagName).toBe('P');
    expect(p).toHaveClass(styles.text, styles.body, styles.toneDefault);
  });

  it('maps size, tone, weight, align, transform, tracking, truncate and wrap', () => {
    render(
      <Text
        as="span"
        size="caption"
        tone="soft"
        weight="semibold"
        align="center"
        transform="uppercase"
        tracking="eyebrow"
        truncate
        wrap="anywhere"
      >
        Label
      </Text>,
    );
    const span = screen.getByText('Label');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveClass(
      styles.caption,
      styles.toneSoft,
      styles.semibold,
      styles.alignCenter,
      styles.uppercase,
      styles.trackingEyebrow,
      styles.truncate,
      styles.wrapAnywhere,
    );
  });

  it('maps hyphenated tones and sizes', () => {
    render(
      <Text size="body-sm" tone="inverse-muted">
        Fine print
      </Text>,
    );
    expect(screen.getByText('Fine print')).toHaveClass(
      styles.bodySm,
      styles.toneInverseMuted,
    );
  });

  it('maps the measure and leaves it off by default', () => {
    const { rerender } = render(<Text>Prose</Text>);
    const p = screen.getByText('Prose');
    expect(p).not.toHaveClass(styles.measureProse);
    expect(p).not.toHaveClass(styles.measureNarrow);

    rerender(<Text measure="prose">Prose</Text>);
    expect(p).toHaveClass(styles.measureProse);

    rerender(<Text measure="narrow">Prose</Text>);
    expect(p).toHaveClass(styles.measureNarrow);
    expect(p).not.toHaveClass(styles.measureProse);
  });

  it('forwards ref and DOM props', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Text ref={ref} id="intro" data-testid="intro">
        Intro
      </Text>,
    );
    expect(ref.current).toBe(screen.getByTestId('intro'));
    expect(ref.current).toHaveAttribute('id', 'intro');
  });
});
