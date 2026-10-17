import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TabPanel, Tabs, tabId } from '@thijulio/exodus-react';

const TABS = [
  { value: 'all', label: 'All', count: 128 },
  { value: 'active', label: 'Active', count: 42 },
  { value: 'archived', label: 'Archived' },
  { value: 'draft', label: 'Draft', disabled: true },
];

const meta: Meta<typeof Tabs> = {
  title: 'Exodus/Components/Tabs',
  component: Tabs,
  argTypes: {
    tabs: {
      description:
        'The tab items (value + label, optional count, disabled, testId) to render.',
    },
    label: {
      description:
        'Accessible name of the tablist (required; no English default).',
    },
    value: { description: 'Selected tab value (controlled).' },
    defaultValue: {
      description: 'Initially selected tab value (uncontrolled).',
    },
    onChange: { description: 'Called with the newly selected tab value.' },
    idBase: {
      description: 'Prefix for tab/panel ids (`${idBase}-tab-${value}`).',
    },
    controlsPanels: {
      description:
        'Set aria-controls on each tab; render a TabPanel per tab with the same idBase.',
    },
    panelId: {
      description:
        'id of one panel all tabs control; render one TabPanel with it, ' +
        'the same idBase and the selected value.',
    },
    variant: {
      description:
        'underline (default) bar, or pill: wrapping bordered chips with the active one filled.',
      control: 'inline-radio',
      options: ['underline', 'pill'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: { tabs: TABS, value: 'all', label: 'Animal lists' },
};
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <Tabs
        tabs={TABS}
        label="Animal lists"
        value={value}
        onChange={setValue}
      />
    );
  },
  // Interaction test: pointer and keyboard controls select enabled tabs.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('tab', { name: /Active/ });
    await expect(active).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(active);
    await expect(active).toHaveAttribute('aria-selected', 'true');
    active.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: /Archived/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

/** Uncontrolled, with panels wired through `idBase` + `TabPanel`. */
export const WithPanels: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <div>
        <Tabs
          tabs={TABS}
          label="Animal lists"
          defaultValue="all"
          onChange={setValue}
          idBase="animals"
          controlsPanels
        />
        {TABS.map((tab) => (
          <TabPanel
            key={tab.value}
            idBase="animals"
            value={tab.value}
            selected={tab.value === value}
          >
            {tab.label} animals
          </TabPanel>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /Active/ }));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Active animals',
    );
  },
};

/** Pill variant: wrapping chips, same roles and keys as the underline bar. */
export const Pill: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <Tabs
        tabs={TABS}
        label="Animal lists"
        value={value}
        onChange={setValue}
        variant="pill"
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('tab', { name: /All/ });
    all.focus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: /Archived/ })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: /Archived/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'pt', label: 'Portuguese' },
];

/**
 * One shared panel (`panelId`): every tab controls the same region, which
 * re-renders for the selected value and is labelled by its tab.
 */
export const SharedPanel: Story = {
  render: () => {
    const [value, setValue] = useState('en');
    const label = LANGUAGES.find((item) => item.value === value)?.label;
    return (
      <div>
        <Tabs
          tabs={LANGUAGES}
          label="Languages"
          value={value}
          onChange={setValue}
          idBase="language"
          panelId="language-panel"
          variant="pill"
        />
        <TabPanel
          idBase="language"
          panelId="language-panel"
          value={value}
          selected
        >
          Editing the {label} text
        </TabPanel>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const french = canvas.getByRole('tab', { name: 'French' });
    await expect(french).toHaveAttribute('aria-controls', 'language-panel');
    await userEvent.click(french);
    const panel = canvas.getByRole('tabpanel', { name: 'French' });
    await expect(panel).toHaveAttribute(
      'aria-labelledby',
      tabId('language', 'fr'),
    );
    await expect(panel).toHaveTextContent('Editing the French text');
  },
};
