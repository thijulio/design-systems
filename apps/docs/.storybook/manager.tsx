import React from 'react';
import {
  addons,
  types,
  useGlobals,
  useStorybookApi,
  useStorybookState,
} from 'storybook/manager-api';
import {
  WithTooltip,
  TooltipLinkList,
  IconButton,
} from 'storybook/internal/components';

type Item = { value: string; title: string };
type Config = {
  globalKey: string;
  brand: string;
  label: string;
  items: Item[];
};

// Each control drives one brand's theme axis and only shows on that brand's stories.
const CONFIGS: Config[] = [
  {
    globalKey: 'mode',
    brand: 'Biome',
    label: 'Biome mode',
    items: [
      { value: 'light', title: 'Biome · Light' },
      { value: 'dark', title: 'Biome · Dark' },
    ],
  },
  {
    globalKey: 'accent',
    brand: 'Exodus',
    label: 'Exodus theme',
    items: [
      { value: 'sage', title: 'Exodus · Sage' },
      { value: 'clay', title: 'Exodus · Clay' },
      { value: 'harbor', title: 'Exodus · Harbor' },
    ],
  },
];

function BrandTool({ config }: { config: Config }) {
  const api = useStorybookApi();
  useStorybookState(); // re-render on story navigation
  const [globals, updateGlobals] = useGlobals();

  const story = api.getCurrentStoryData();
  const brand = (story?.title ?? '').split('/')[0];
  if (brand !== config.brand) return null; // hide on the other brand's stories

  const current = globals[config.globalKey] as string;
  const active =
    config.items.find((i) => i.value === current) ?? config.items[0];

  return (
    <WithTooltip
      placement="top"
      trigger="click"
      closeOnOutsideClick
      tooltip={({ onHide }: { onHide: () => void }) => (
        <TooltipLinkList
          links={config.items.map((i) => ({
            id: i.value,
            title: i.title,
            active: i.value === current,
            onClick: () => {
              updateGlobals({ [config.globalKey]: i.value });
              onHide();
            },
          }))}
        />
      )}
    >
      <IconButton title={config.label}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{active.title}</span>
      </IconButton>
    </WithTooltip>
  );
}

addons.register('thijulio/brand-theme-tools', () => {
  CONFIGS.forEach((config) => {
    addons.add(`thijulio/brand-theme/${config.globalKey}`, {
      type: types.TOOL,
      title: config.label,
      match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
      render: () => <BrandTool config={config} />,
    });
  });
});
