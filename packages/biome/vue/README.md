# biome-vue

Vue 3 components for the Biome Modernism design system, at parity with
`@thijulio/biome-react` ([ADR-0002](../../../docs/architecture/adr/0002-biome-native-vue.md)).

```ts
import '@thijulio/biome-vue/styles.css'; // biome-css (fonts, tokens, reset) + component styles
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Card, ModeToggle, Tag, type Mode } from '@thijulio/biome-vue';

const mode = ref<Mode>('explorer');
</script>

<template>
  <ModeToggle v-model="mode" />
  <Card kicker="Case study" title="Living interface">
    A resilient, real-time surface.
  </Card>
  <Tag status>Open</Tag>
  <Button href="/projects">Explore</Button>
</template>
```

| Component      | Differences from `biome-react`                                                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`       | `click` is emitted (never while disabled).                                                                                                                                              |
| `Card`         | `kicker` / `title` are strings; the same-named slots take rich content.                                                                                                                 |
| `ModeToggle`   | `v-model` (`modelValue` + `update:modelValue`) instead of `value` + `onChange`; still controlled.                                                                                       |
| `TerminalHero` | Text props have same-named slots (`eyebrow`, `title`, `lede`, `primary`, `secondary`, `terminal-title`, `command`, `output`); `lines`, `command` and `output` also take VNodes (`h()`). |

`TERMINAL_COLORS` holds the `var(--terminal-syntax-*)` tokens rather than
`biome-react`'s legacy hex literals.

## Running unit tests

Run `nx test biome-vue` to execute the unit tests via [Vitest](https://vitest.dev/).
