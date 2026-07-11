import { render, screen } from '@testing-library/react';
import { TerminalHero, Tok, TERMINAL_COLORS } from './TerminalHero';

describe('TerminalHero', () => {
  it('renders the identity column (eyebrow, heading, lede)', () => {
    render(
      <TerminalHero
        loop={false}
        eyebrow="Engineer"
        title="Grow software"
        lede="Resilient by design."
      />,
    );
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Grow software' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Resilient by design.')).toBeInTheDocument();
  });

  it('renders both action links with their hrefs', () => {
    render(
      <TerminalHero
        loop={false}
        primaryLabel="Explore"
        primaryHref="/projects"
        secondaryLabel="Recruiter"
        secondaryHref="/cv"
      />,
    );
    expect(screen.getByRole('link', { name: 'Explore' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(screen.getByRole('link', { name: 'Recruiter' })).toHaveAttribute(
      'href',
      '/cv',
    );
  });

  it('renders the terminal title and custom code lines', () => {
    render(
      <TerminalHero
        loop={false}
        terminalTitle="~/site"
        lines={[<span key="a">const a = 1;</span>]}
        command={<span>run()</span>}
        output={null}
      />,
    );
    expect(screen.getByText('~/site')).toBeInTheDocument();
    expect(screen.getByText('const a = 1;')).toBeInTheDocument();
  });

  it('exposes Tok and TERMINAL_COLORS for composing code lines', () => {
    render(<Tok c={TERMINAL_COLORS.keyword}>const</Tok>);
    expect(screen.getByText('const')).toBeInTheDocument();
    expect(TERMINAL_COLORS.keyword).toBe('#8FB089');
  });
});
