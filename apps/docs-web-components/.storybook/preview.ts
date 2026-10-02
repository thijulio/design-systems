import type { Preview } from '@storybook/web-components-vite';
// Faune tokens on the page; the elements read the inherited --ds-* contract.
import '@thijulio/faune-css/faune.css';
import {
  defineCustomElementTjButton,
  defineCustomElementTjInput,
} from '@thijulio/faune-web-components';

// Register the tj-* tags once, as an app without a framework adapter would.
defineCustomElementTjButton();
defineCustomElementTjInput();

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    // Same quality gate as the React catalog.
    a11y: { test: 'error' },
  },
};

export default preview;
