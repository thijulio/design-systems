import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent, within } from 'storybook/test';

type ButtonArgs = {
  variant: string;
  size: string;
  disabled: boolean;
  label: string;
};

const meta: Meta<ButtonArgs> = {
  title: 'Faune/Components/tj-button',
  component: 'tj-button',
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    label: 'Réserver une visite',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: [
        'primary',
        'accent',
        'secondary',
        'soft',
        'ghost',
        'danger',
        'danger-outline',
      ],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: ({ variant, size, disabled, label }) =>
    html`<tj-button variant=${variant} size=${size} ?disabled=${disabled}
      >${label}</tj-button
    >`,
};
export default meta;

type Story = StoryObj<ButtonArgs>;

// The shadow root's native <button> is the focusable, role-bearing control.
const control = (canvasElement: HTMLElement) =>
  canvasElement
    .querySelector('tj-button')
    ?.shadowRoot?.querySelector('button') as HTMLButtonElement;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const onClick = fn();
    canvasElement
      .querySelector('tj-button')
      ?.addEventListener('click', onClick);
    await userEvent.click(control(canvasElement));
    await expect(onClick).toHaveBeenCalledTimes(1);
  },
};
export const Accent: Story = {
  args: { variant: 'accent', label: 'Demander un devis' },
};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Soft: Story = { args: { variant: 'soft' } };
export const Danger: Story = { args: { variant: 'danger', label: 'Annuler' } };
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(control(canvasElement)).toBeDisabled();
  },
};

/** A submit button in the shadow root still submits its light-DOM form. */
export const SubmitsForm: Story = {
  render: () =>
    html`<form>
      <tj-button type="submit">Envoyer</tj-button>
    </form>`,
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form') as HTMLFormElement;
    const onSubmit = fn((e: Event) => e.preventDefault());
    form.addEventListener('submit', onSubmit);
    await userEvent.click(control(canvasElement));
    await expect(onSubmit).toHaveBeenCalledTimes(1);
    await expect(within(canvasElement).queryByText('Envoyer')).toBeTruthy();
  },
};
