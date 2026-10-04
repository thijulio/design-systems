import React, { useEffect, useRef } from 'react';
import {
  addons,
  types,
  useAddonState,
  useGlobals,
  useStorybookApi,
  useStorybookState,
} from 'storybook/manager-api';
import {
  WithTooltip,
  TooltipLinkList,
  IconButton,
} from 'storybook/internal/components';

import {
  ALL,
  type CatalogEntry,
  counterpartEntry,
  DESIGN_SYSTEMS,
  type DesignSystem,
  designSystemOf,
  isSelection,
  isVisible,
  type Selection,
} from './design-system';

const ADDON_ID = 'thijulio/design-system';
const STORAGE_KEY = `${ADDON_ID}/selection`;
const DEFAULT_SELECTION: Selection = 'Biome';

// The last pick is a per-viewer convenience only (it decides the tree shown on
// unbranded pages like Introduction); the URL's story always wins.
function storedSelection(): Selection {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isSelection(value) ? value : DEFAULT_SELECTION;
  } catch {
    return DEFAULT_SELECTION;
  }
}

function storeSelection(selection: Selection) {
  try {
    localStorage.setItem(STORAGE_KEY, selection);
  } catch {
    // Storage blocked (private window, previews): the picker still works.
  }
}

type Link = { id: string; title: string; active: boolean; onClick: () => void };

function Dropdown({ label, links }: { label: string; links: Link[] }) {
  return (
    <WithTooltip
      placement="top"
      trigger="click"
      closeOnOutsideClick
      tooltip={({ onHide }: { onHide: () => void }) => (
        <TooltipLinkList
          links={links.map((link) => ({
            ...link,
            onClick: () => {
              link.onClick();
              onHide();
            },
          }))}
        />
      )}
    >
      <IconButton title={label}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{label}</span>
      </IconButton>
    </WithTooltip>
  );
}

// Shows one design system's sidebar tree at a time, and switching keeps you on
// the same page when the target design system has it.
function DesignSystemTool() {
  const api = useStorybookApi();
  const { index } = useStorybookState(); // also re-renders on navigation
  const [selection, setSelection] = useAddonState<Selection>(
    ADDON_ID,
    storedSelection(),
  );

  const story = api.getCurrentStoryData();
  const storySystem = designSystemOf(story?.title);

  // The URL wins: landing on (or navigating to) another design system's story
  // switches the tree to it, so a shared link never opens on a hidden story.
  // Keyed on the story id so a pick isn't undone before its navigation lands.
  const lastStoryId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (story?.id === lastStoryId.current) return;
    lastStoryId.current = story?.id;
    if (storySystem && selection !== ALL && storySystem !== selection) {
      setSelection(storySystem);
    }
  }, [story?.id, storySystem, selection, setSelection]);

  useEffect(() => {
    storeSelection(selection);
    void api.experimental_setFilter(ADDON_ID, (entry) =>
      isVisible(entry.title, selection),
    );
  }, [api, selection]);

  const pick = (target: Selection) => {
    setSelection(target);
    if (target === ALL || !storySystem || target === storySystem) return;

    // The unfiltered index, in sidebar order (filteredIndex hides the target).
    const entries: CatalogEntry[] = Object.values(index ?? {})
      .filter((entry) => entry.type === 'story' || entry.type === 'docs')
      .map(({ id, title, name, type }) => ({ id, title, name, type }));
    const destination = counterpartEntry(
      story?.title,
      story?.name,
      target,
      entries,
    );
    if (destination) api.selectStory(destination.id);
  };

  const options: Selection[] = [...DESIGN_SYSTEMS, ALL];
  return (
    <Dropdown
      label={`Design system: ${selection === ALL ? 'All' : selection}`}
      links={options.map((option) => ({
        id: option,
        title: option === ALL ? 'All design systems' : option,
        active: option === selection,
        onClick: () => pick(option),
      }))}
    />
  );
}

type ThemeConfig = {
  globalKey: string;
  designSystem: DesignSystem;
  label: string;
  items: { value: string; title: string }[];
};

// Each control drives one design system's theme axis and only shows on that
// design system's stories. Faune is light-only, so it has none.
const THEMES: ThemeConfig[] = [
  {
    globalKey: 'mode',
    designSystem: 'Biome',
    label: 'Mode',
    items: [
      { value: 'light', title: 'Light' },
      { value: 'dark', title: 'Dark' },
    ],
  },
  {
    globalKey: 'accent',
    designSystem: 'Exodus',
    label: 'Theme',
    items: [
      { value: 'sage', title: 'Sage' },
      { value: 'clay', title: 'Clay' },
      { value: 'harbor', title: 'Harbor' },
    ],
  },
];

function ThemeTool({ config }: { config: ThemeConfig }) {
  const api = useStorybookApi();
  useStorybookState(); // re-render on story navigation
  const [globals, updateGlobals] = useGlobals();

  const story = api.getCurrentStoryData();
  if (designSystemOf(story?.title) !== config.designSystem) return null;

  const current = globals[config.globalKey] as string;
  const active =
    config.items.find((i) => i.value === current) ?? config.items[0];

  return (
    <Dropdown
      label={`${config.label}: ${active.title}`}
      links={config.items.map((i) => ({
        id: i.value,
        title: i.title,
        active: i.value === current,
        onClick: () => updateGlobals({ [config.globalKey]: i.value }),
      }))}
    />
  );
}

addons.register(ADDON_ID, () => {
  addons.add(`${ADDON_ID}/picker`, {
    type: types.TOOL,
    title: 'Design system',
    match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
    render: () => <DesignSystemTool />,
  });
  THEMES.forEach((config) => {
    addons.add(`thijulio/brand-theme/${config.globalKey}`, {
      type: types.TOOL,
      title: `${config.designSystem} ${config.label.toLowerCase()}`,
      match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
      render: () => <ThemeTool config={config} />,
    });
  });
});
