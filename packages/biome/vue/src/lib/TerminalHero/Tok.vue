<script setup lang="ts">
export interface TokProps {
  /** Token colour — usually one of TERMINAL_COLORS. */
  c: string;
}

defineOptions({ name: 'Tok' });

defineProps<TokProps>();

defineSlots<{ default?: () => unknown }>();
</script>

<!-- Tok — a syntax token for building code lines. -->
<template>
  <span :style="{ color: c }"><slot /></span>
</template>
