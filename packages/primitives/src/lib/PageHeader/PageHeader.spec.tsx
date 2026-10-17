import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders an h1 title, subtitle, children and actions', () => {
    render(
      <PageHeader
        title="My pets"
        subtitle="Everything you follow"
        actions={<button type="button">Add item</button>}
      >
        <span>Extra</span>
      </PageHeader>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'My pets' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Everything you follow')).toBeInTheDocument();
    expect(screen.getByText('Extra')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add item' }),
    ).toBeInTheDocument();
  });

  it('supports a level-2 heading', () => {
    render(<PageHeader title="Settings" headingLevel={2} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Settings' }),
    ).toBeInTheDocument();
  });

  it('is not a banner landmark', () => {
    render(<PageHeader title="Settings" />);
    expect(screen.queryByRole('banner')).toBeNull();
  });

  it('forwards ref and DOM props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<PageHeader ref={ref} title="Settings" data-testid="header" />);
    expect(ref.current).toBe(screen.getByTestId('header'));
  });
});
