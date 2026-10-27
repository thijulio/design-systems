<script setup lang="ts">
export interface TagProps {
  /** outline (default), solid emphasis, or muted mono. */
  variant?: 'outline' | 'solid' | 'muted';
  /** Show a pulsing status dot before the label. */
  status?: boolean;
}

defineOptions({ name: 'Tag' });

withDefaults(defineProps<TagProps>(), { variant: 'outline', status: false });

defineSlots<{ default?: () => unknown }>();
</script>

<!-- Tag — pill label for skills, categories and status. -->
<template>
  <span :class="[primitive.tag, primitive[variant], skin.tag, skin[variant]]">
    <span v-if="status" :class="primitive.dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style
  module="primitive"
  src="../../../../../primitives/src/lib/Tag/Tag.module.css"
></style>
<style module="skin" src="../../../../react/src/lib/Tag/Tag.module.css"></style>
