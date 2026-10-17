import { forwardRef, type AnchorHTMLAttributes } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, NavItem, NavList } from '@thijulio/primitives';

const PAGES = ['Overview', 'Projects', 'Reports', 'Settings'];

// Stands in for a router link (e.g. React Router's NavLink), which sets
// `aria-current` itself. `href="#…"` keeps the canvas in place on click.
const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }
>(function RouterLink({ active, ...props }, ref) {
  return <a ref={ref} aria-current={active ? 'page' : undefined} {...props} />;
});

const meta: Meta<typeof NavList> = {
  title: 'Components/NavList',
  component: NavList,
  args: {
    'aria-label': 'Main',
    orientation: 'horizontal',
    gap: 4,
    variant: 'text',
    tone: 'default',
  },
  argTypes: {
    'aria-label': {
      control: 'text',
      description:
        'Names the landmark. Required: there is no default copy, and a page with two navs needs both named.',
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description:
        'A wrapping row or a column; also takes one value per breakpoint.',
    },
    gap: {
      description: 'Space between items, optionally per breakpoint.',
    },
    variant: {
      control: 'inline-radio',
      options: ['text', 'block'],
      description:
        'text: bare links, the current one underlined. block: padded rows, the current one raised.',
    },
    tone: {
      control: 'inline-radio',
      options: ['default', 'inverse'],
      description: 'inverse for a nav on the inverse surface.',
    },
    actions: {
      control: false,
      description: 'Content after the list, inside the landmark.',
    },
    listClassName: { control: false, description: 'Class for the `ul`.' },
  },
  render: (args) => (
    <NavList {...args}>
      {PAGES.map((page, index) => (
        <NavItem
          key={page}
          href={`#${page.toLowerCase()}`}
          current={index === 0}
        >
          {page}
        </NavItem>
      ))}
    </NavList>
  ),
};
export default meta;

type Story = StoryObj<typeof NavList>;

// A named landmark around a list; the current page carries aria-current,
// and Tab walks the links in order.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Main' });
    await expect(within(nav).getAllByRole('listitem')).toHaveLength(4);
    const overview = canvas.getByRole('link', { name: 'Overview' });
    await expect(overview).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.getByRole('link', { name: 'Projects' }),
    ).not.toHaveAttribute('aria-current');
    await userEvent.tab();
    await expect(overview).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Projects' })).toHaveFocus();
  },
};

export const Vertical: Story = {
  args: { orientation: 'vertical', variant: 'block', gap: 1 },
};

// A row on small screens, a column from lg.
export const Responsive: Story = {
  args: {
    orientation: { base: 'horizontal', lg: 'vertical' },
    gap: { base: 2, lg: 3 },
    variant: 'block',
  },
};

export const Inverse: Story = {
  args: { orientation: 'vertical', variant: 'block', tone: 'inverse', gap: 1 },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 'var(--ds-space-6)',
          background: 'var(--ds-surface-inverse)',
          color: 'var(--ds-text-inverse)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

// Trailing controls stay inside the landmark, after the list.
export const WithActions: Story = {
  args: {
    actions: (
      <Button variant="secondary" size="sm">
        Sign out
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', {
      name: 'Main',
    });
    await expect(
      within(nav).getByRole('button', { name: 'Sign out' }),
    ).toBeInTheDocument();
  },
};

// asChild styles a router link; the router's own aria-current drives the
// current style, so no active class is needed.
export const AsChild: Story = {
  render: (args) => (
    <NavList {...args}>
      {PAGES.map((page, index) => (
        <NavItem key={page} asChild>
          <RouterLink href={`#${page.toLowerCase()}`} active={index === 1}>
            {page}
          </RouterLink>
        </NavItem>
      ))}
    </NavList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const projects = canvas.getByRole('link', { name: 'Projects' });
    await expect(projects).toHaveAttribute('aria-current', 'page');
    await expect(projects.parentElement?.tagName).toBe('LI');
  },
};
