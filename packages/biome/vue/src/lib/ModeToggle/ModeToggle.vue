<script setup lang="ts">
export type Mode = 'explorer' | 'recruiter';

export interface ModeToggleProps {
  /** Currently selected posture (`v-model`). Controlled: the selection only
   * moves when the parent updates it. */
  modelValue?: Mode;
}

defineOptions({ name: 'ModeToggle' });

const props = withDefaults(defineProps<ModeToggleProps>(), {
  modelValue: 'explorer',
});

const emit = defineEmits<{ 'update:modelValue': [value: Mode] }>();

const MODES: ReadonlyArray<{ id: Mode; label: string }> = [
  { id: 'explorer', label: 'Explorer' },
  { id: 'recruiter', label: 'Recruiter' },
];

function moveToMode(event: KeyboardEvent, currentIndex: number) {
  const nextIndex =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? (currentIndex + 1) % MODES.length
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? (currentIndex - 1 + MODES.length) % MODES.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? MODES.length - 1
            : undefined;

  if (nextIndex === undefined) return;

  event.preventDefault();
  emit('update:modelValue', MODES[nextIndex].id);
  (event.currentTarget as HTMLElement)
    .closest('[role="tablist"]')
    ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    [nextIndex]?.focus();
}
</script>

<!--
  ModeToggle — switches the site between Explorer (expressive) and Recruiter
  (focused) postures. Controlled via `v-model`.
-->
<template>
  <div :class="$style.toggle" role="tablist" aria-label="Site posture">
    <button
      v-for="(mode, index) in MODES"
      :key="mode.id"
      type="button"
      role="tab"
      :aria-selected="props.modelValue === mode.id"
      :tabindex="props.modelValue === mode.id ? 0 : -1"
      :class="$style.tab"
      @click="emit('update:modelValue', mode.id)"
      @keydown="moveToMode($event, index)"
    >
      {{ mode.label }}
    </button>
  </div>
</template>

<style
  module
  src="../../../../react/src/lib/ModeToggle/ModeToggle.module.css"
></style>
