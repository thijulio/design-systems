<script setup lang="ts">
export interface PlaceholderProps {
  /** Rendered element. */
  as?: 'span' | 'div';
}

withDefaults(defineProps<PlaceholderProps>(), { as: 'span' });

defineSlots<{ default?: () => unknown }>();
</script>

<!--
  Placeholder — scaffolding probe for the Vue toolchain (SFC compile, CSS
  Modules, vue-tsc declarations, tests). Removed when the Biome components
  are ported (#23).
-->
<template>
  <component :is="as" :class="$style.placeholder"><slot /></component>
</template>

<style module>
.placeholder {
  font-family: var(--font-ui);
  color: var(--text-body);
}
</style>
