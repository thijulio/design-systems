<script setup lang="ts">
import { computed, useSlots } from 'vue';

export interface CardProps {
  /** editorial = tight geometry, flat surface; expressive = soft curve on mata with arcs. */
  variant?: 'editorial' | 'expressive';
  /** Small mono label above the title. The `kicker` slot overrides it. */
  kicker?: string;
  /** Display-font heading. The `title` slot overrides it. */
  title?: string;
}

defineOptions({ name: 'Card' });

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'editorial',
  kicker: undefined,
  title: undefined,
});

defineSlots<{
  default?: () => unknown;
  kicker?: () => unknown;
  title?: () => unknown;
}>();

const slots = useSlots();
const hasKicker = computed(() => Boolean(slots.kicker || props.kicker));
const hasTitle = computed(() => Boolean(slots.title || props.title));
</script>

<!--
  Card — surface container. `editorial` is the workhorse; `expressive` is the
  immersive brand surface with decorative contours.
-->
<template>
  <div :class="[primitive.card, skin.card, skin[variant]]">
    <template v-if="variant === 'expressive'">
      <span :class="[skin.arc, skin.arc1]" aria-hidden="true" />
      <span :class="[skin.arc, skin.arc2]" aria-hidden="true" />
    </template>
    <div :class="skin.inner">
      <div v-if="hasKicker" :class="skin.kicker">
        <slot name="kicker">{{ kicker }}</slot>
      </div>
      <div
        v-if="hasTitle"
        :class="[skin.title, $slots.default && skin.titleGap]"
      >
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.default" :class="skin.body"><slot /></div>
    </div>
  </div>
</template>

<style
  module="primitive"
  src="../../../../../primitives/src/lib/Card/Card.module.css"
></style>
<style
  module="skin"
  src="../../../../react/src/lib/Card/Card.module.css"
></style>
