import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';

type InputArgs = { placeholder: string; invalid: boolean; value: string };

const meta: Meta<InputArgs> = {
  title: 'Faune/Components/tj-input',
  component: 'tj-input',
  args: { placeholder: 'Nom du chat', invalid: false, value: '' },
  render: ({ placeholder, invalid, value }) =>
    html`<tj-input
      aria-label="Nom du chat"
      placeholder=${placeholder}
      .value=${value}
      ?invalid=${invalid}
    ></tj-input>`,
};
export default meta;

type Story = StoryObj<InputArgs>;

const host = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('tj-input') as HTMLElement & { value: string };
const control = (canvasElement: HTMLElement) =>
  host(canvasElement).shadowRoot?.querySelector('input') as HTMLInputElement;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const onInput = fn();
    host(canvasElement).addEventListener('tjInput', onInput);
    await userEvent.type(control(canvasElement), 'Rocket');
    await expect(host(canvasElement).value).toBe('Rocket');
    await expect(onInput).toHaveBeenCalledTimes(6);
    await expect(control(canvasElement)).toHaveAccessibleName('Nom du chat');
  },
};

export const Invalid: Story = {
  args: { invalid: true, value: 'Roc' },
  play: async ({ canvasElement }) => {
    await expect(control(canvasElement)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

/** Form-associated: the value travels with the light-DOM form's FormData. */
export const InForm: Story = {
  render: () =>
    html`<form>
      <tj-input name="cat" aria-label="Nom du chat"></tj-input>
    </form>`,
  play: async ({ canvasElement }) => {
    await userEvent.type(control(canvasElement), 'Silco');
    const form = canvasElement.querySelector('form') as HTMLFormElement;
    await expect(new FormData(form).get('cat')).toBe('Silco');
    form.reset();
    await expect(host(canvasElement).value).toBe('');
  },
};
