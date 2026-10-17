import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Pager, Section, type PagerProps } from '@thijulio/primitives';

const WEEKS = ['3–9 Mar', '10–16 Mar', '17–23 Mar', '24–30 Mar'];

// The caller owns the position; the pager only reports presses.
function Demo(args: Partial<PagerProps> & { showCurrent?: boolean }) {
  const { showCurrent = true, ...rest } = args;
  const [week, setWeek] = useState(0);
  return (
    <Pager
      label="Weeks"
      previousLabel="Prev"
      nextLabel="Next"
      {...rest}
      current={showCurrent ? WEEKS[week] : undefined}
      onPrevious={() => setWeek((n) => n - 1)}
      onNext={() => setWeek((n) => n + 1)}
      previousDisabled={week === 0}
      nextDisabled={week === WEEKS.length - 1}
      previousTestId="pager-prev"
      nextTestId="pager-next"
    />
  );
}

const meta: Meta<typeof Pager> = {
  title: 'Components/Pager',
  component: Pager,
  argTypes: {
    label: { description: 'Accessible name of the group. Required.' },
    previousLabel: { description: 'Visible previous text. Required.' },
    nextLabel: { description: 'Visible next text. Required.' },
    current: {
      description:
        'Current position between the controls, announced politely. ' +
        'Without it a decorative divider separates them.',
    },
  },
  render: (args) => <Demo {...args} />,
};
export default meta;

type Story = StoryObj<typeof Pager>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Weeks' })).toBeVisible();
    const previous = canvas.getByTestId('pager-prev');
    await expect(previous).toBeDisabled();
    await userEvent.click(canvas.getByTestId('pager-next'));
    await expect(canvas.getByText('10–16 Mar')).toHaveAttribute(
      'aria-live',
      'polite',
    );
    await expect(previous).toBeEnabled();
  },
};

// In a section header: the heading keeps only text, the pager sits in
// `actions`.
export const InSectionHeader: Story = {
  render: () => (
    <Section
      surface="raised"
      title="Week timeline (3–9 Mar)"
      actions={<Demo showCurrent={false} />}
    >
      <p>Seven days of events.</p>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { level: 2 });
    await expect(heading).toHaveTextContent('Week timeline (3–9 Mar)');
    await expect(within(heading).queryByRole('button')).toBeNull();
  },
};
