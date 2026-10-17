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
  activeDesignSystem,
  ALL,
  type CatalogEntry,
  counterpartEntry,
  DESIGN_SYSTEM_GLOBAL,
  DESIGN_SYSTEMS,
  type DesignSystem,
  designSystemOf,
  isDesignSystem,
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

// A design system named in the URL's `globals` (e.g. a shared story's deep
// link `&globals=designSystem:Faune`), which wins over the remembered pick.
function designSystemInUrl(): DesignSystem | undefined {
  try {
    const globals = new URLSearchParams(window.location.search).get('globals');
    const match = new RegExp(`(?:^|;)${DESIGN_SYSTEM_GLOBAL}:([^;]+)`).exec(
      globals ?? '',
    );
    const value = match?.[1];
    return isDesignSystem(value) ? value : undefined;
  } catch {
    return undefined;
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

// Shows the shared Components tree plus one design system's tree at a time,
// and sets the `designSystem` global so shared stories restyle live. Switching
// keeps you on the same page: a shared story stays put, a branded one moves to
// the target's counterpart when it has one.
function DesignSystemTool() {
  const api = useStorybookApi();
  const { index } = useStorybookState(); // also re-renders on navigation
  const [globals, updateGlobals] = useGlobals();
  const [selection, setSelection] = useAddonState<Selection>(
    ADDON_ID,
    storedSelection(),
  );

  const story = api.getCurrentStoryData();
  const storySystem = designSystemOf(story?.title);
  const globalSystem = globals[DESIGN_SYSTEM_GLOBAL] as unknown;

  // The URL wins: landing on (or navigating to) another design system's story
  // switches the tree to it, so a shared link never opens on a hidden story;
  // on a shared story, a `designSystem` in the URL's globals does the same.
  // Then the global follows the pick. Keyed on the story id so a pick isn't
  // undone before its navigation lands; waits for the preview's globals.
  const lastStoryId = useRef<string | undefined>(undefined);
  const readUrl = useRef(true);
  useEffect(() => {
    if (globalSystem === undefined) return; // preview not ready yet
    if (story?.id !== lastStoryId.current) {
      lastStoryId.current = story?.id;
      if (storySystem && selection !== ALL && storySystem !== selection) {
        setSelection(storySystem);
        return; // the next run moves the global
      }
    }
    if (readUrl.current) {
      readUrl.current = false;
      const fromUrl = designSystemInUrl();
      if (
        !storySystem &&
        fromUrl &&
        selection !== ALL &&
        fromUrl !== selection
      ) {
        setSelection(fromUrl);
        return;
      }
    }
    if (selection !== ALL && globalSystem !== selection) {
      updateGlobals({ [DESIGN_SYSTEM_GLOBAL]: selection });
    }
  }, [
    story?.id,
    storySystem,
    selection,
    setSelection,
    globalSystem,
    updateGlobals,
  ]);

  useEffect(() => {
    storeSelection(selection);
    void api.experimental_setFilter(ADDON_ID, (entry) =>
      isVisible(entry.title, selection),
    );
  }, [api, selection]);

  const pick = (target: Selection) => {
    setSelection(target);
    if (target === ALL) return; // shared stories keep the last design system
    updateGlobals({ [DESIGN_SYSTEM_GLOBAL]: target });
    // Shared and unbranded pages stay put; only branded ones move.
    if (!storySystem || target === storySystem) return;

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
// design system's stories (shared ones included while it is the active
// design system). Faune is light-only, so it has none.
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
  const active = activeDesignSystem(
    story?.title,
    globals[DESIGN_SYSTEM_GLOBAL],
  );
  if (active !== config.designSystem) return null;

  const current = globals[config.globalKey] as string;
  const item = config.items.find((i) => i.value === current) ?? config.items[0];

  return (
    <Dropdown
      label={`${config.label}: ${item.title}`}
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
