import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';
import textStyles from '../Text/Text.module.css';

describe('Heading', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)('renders an h%s', (level) => {
    render(<Heading level={level}>Title</Heading>);
    expect(screen.getByRole('heading', { level, name: 'Title' })).toBeInTheDocument();
  });

  it('derives size and weight from the level', () => {
    const { rerender } = render(<Heading level={1}>Title</Heading>);
    expect(screen.getByRole('heading')).toHaveClass(textStyles.h1, textStyles.bold);

    rerender(<Heading level={3}>Title</Heading>);
    expect(screen.getByRole('heading')).toHaveClass(
      textStyles.h3,
      textStyles.semibold,
    );

    rerender(<Heading level={5}>Title</Heading>);
    expect(screen.getByRole('heading')).toHaveClass(textStyles.body);
  });

  it('lets size and weight be set independently of the level', () => {
    render(
      <Heading level={2} size="lead" weight="medium" tone="muted">
        Title
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass(textStyles.lead, textStyles.medium, textStyles.toneMuted);
    expect(heading).not.toHaveClass(textStyles.h2);
  });

  it('forwards ref and id', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading level={2} ref={ref} id="section-title">
        Title
      </Heading>,
    );
    expect(ref.current).toBe(screen.getByRole('heading'));
    expect(ref.current).toHaveAttribute('id', 'section-title');
  });
});
