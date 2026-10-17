import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Code } from './Code';
import styles from './Code.module.css';

describe('Code', () => {
  it('renders inline code that inherits the text size', () => {
    const { container } = render(
      <p>
        Run <Code>npm test</Code> first.
      </p>,
    );
    const code = screen.getByText('npm test');
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveClass(styles.code, styles.inline);
    expect(code).not.toHaveClass(styles.block);
    expect(code).not.toHaveClass(styles.bodySm);
    expect(container.querySelector('pre')).toBeNull();
  });

  it('renders a block as pre > code, with props and ref on the code', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <Code block ref={ref} id="snippet" data-testid="snippet">
        {'line one\nline two'}
      </Code>,
    );
    const code = screen.getByTestId('snippet');
    expect(ref.current).toBe(code);
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveAttribute('id', 'snippet');
    expect(code).toHaveClass(styles.code, styles.block);
    expect(code.parentElement).toBe(container.querySelector('pre'));
    expect(code.parentElement).toHaveClass(styles.pre);
    expect(code.textContent).toBe('line one\nline two');
  });

  it('maps size and merges a consumer class', () => {
    render(
      <Code size="body-sm" className="custom">
        ABCD-1234
      </Code>,
    );
    expect(screen.getByText('ABCD-1234')).toHaveClass(
      styles.bodySm,
      'custom',
    );
  });

  it('forwards a ref to the inline code', () => {
    const ref = createRef<HTMLElement>();
    render(<Code ref={ref}>key</Code>);
    expect(ref.current).toBe(screen.getByText('key'));
  });
});
