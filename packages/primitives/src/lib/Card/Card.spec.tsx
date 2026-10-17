import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Pet passport</Card>);
    expect(screen.getByText('Pet passport')).toBeInTheDocument();
  });

  it('forwards DOM props such as role', () => {
    render(<Card role="region">content</Card>);
    expect(screen.getByRole('region')).toHaveTextContent('content');
  });

  it('renders a div by default and the requested element via as', () => {
    const { rerender } = render(<Card data-testid="card">Body</Card>);
    expect(screen.getByTestId('card').tagName).toBe('DIV');

    rerender(
      <ul>
        <Card as="li" data-testid="card">
          Body
        </Card>
      </ul>,
    );
    expect(screen.getByTestId('card').tagName).toBe('LI');
    expect(screen.getByRole('listitem')).toHaveTextContent('Body');
  });

  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Card as="article" ref={ref}>
        Body
      </Card>,
    );
    expect(ref.current?.tagName).toBe('ARTICLE');
  });

  it('accepts padding, surface and tone and keeps a consumer className', () => {
    render(
      <Card
        padding="lg"
        surface="dashed"
        tone="danger"
        className="consumer"
        data-testid="card"
      >
        Body
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('consumer');
  });
});

describe('Card header', () => {
  it('renders title, description, actions and body content', () => {
    render(
      <Card
        title="Members"
        description="Latest updates"
        actions={<button type="button">Edit</button>}
      >
        Body content
      </Card>,
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Members' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Latest updates')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('puts the title at the requested heading level', () => {
    render(
      <Card title="Members" headingLevel={2}>
        Body
      </Card>,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Members' }),
    ).toBeInTheDocument();
  });

  it('renders no header without a title, description or actions', () => {
    const { container } = render(
      <Card title={null} description="" padding="sm">
        Body
      </Card>,
    );
    expect(container.querySelector('.header')).toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('wraps the children in one body element sharing the header padding', () => {
    render(
      <Card
        data-testid="card"
        title="Members"
        padding={{ block: 4, inline: 6 }}
      >
        <span>Body</span>
      </Card>,
    );
    const card = screen.getByTestId('card');
    const [header, body] = Array.from(card.children);
    expect(card.children).toHaveLength(2);
    expect(header.tagName).toBe('DIV');
    expect(header).toHaveClass('header');
    expect(body).toContainElement(screen.getByText('Body'));
    expect(header).toHaveClass('pb4', 'pi6');
    expect(body).toHaveClass('pb4', 'pi6');
    expect(card).not.toHaveClass('pb4');
  });

  it('keeps a body element without a header when sectioned', () => {
    render(
      <Card data-testid="card" sectioned padding="none">
        <span>Body</span>
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card.children).toHaveLength(1);
    expect(card.firstElementChild?.tagName).toBe('DIV');
    expect(card.firstElementChild).toContainElement(screen.getByText('Body'));
  });

  it('keeps the children directly in the padded root otherwise', () => {
    render(
      <Card data-testid="card" padding="lg">
        <span>Body</span>
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(screen.getByText('Body').parentElement).toBe(card);
    expect(card).toHaveClass('padLg');
  });
});
