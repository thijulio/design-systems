<script setup lang="ts">
import { computed, useAttrs, useCssModule } from 'vue';

export interface ButtonProps {
  /** Visual weight. primary = filled mata; secondary = outline; ghost = text-only warm. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Control size. */
  size?: 'sm' | 'md' | 'lg';
  /** Render as an anchor instead of a button. Ignored when disabled. */
  href?: string;
  disabled?: boolean;
  /** Native button type (ignored on the anchor). */
  type?: 'button' | 'submit' | 'reset';
}

defineOptions({ name: 'Button', inheritAttrs: false });

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  href: undefined,
  disabled: false,
  type: 'button',
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

defineSlots<{ default?: () => unknown }>();

const attrs = useAttrs();
const primitive = useCssModule('primitive');
const skin = useCssModule('skin');

const asLink = computed(() => Boolean(props.href) && !props.disabled);

/** Attributes that only mean something on a `<button>`; dropped on anchors. */
const BUTTON_ONLY = new Set([
  'form',
  'formaction',
  'formenctype',
  'formmethod',
  'formnovalidate',
  'formtarget',
  'name',
  'value',
]);

const rootAttrs = computed(() =>
  asLink.value
    ? Object.fromEntries(
        Object.entries(attrs).filter(
          ([key]) => !BUTTON_ONLY.has(key.replace(/-/g, '').toLowerCase()),
        ),
      )
    : attrs,
);

const classes = computed(() => [
  primitive.btn,
  primitive[props.size],
  primitive[props.variant],
  skin.button,
  skin[props.variant],
  skin[props.size],
]);

function onClick(event: MouseEvent) {
  if (props.disabled) return;
  emit('click', event);
}
</script>

<!--
  Button — Biome Modernism's primary action control.
  Tight geometry (radius-ui), Space Grotesk, calm hover/press feedback.
  Styled by @thijulio/primitives' Button CSS plus biome-react's skin, the same
  files biome-react ships (ADR-0002).
-->
<template>
  <a
    v-if="asLink"
    v-bind="rootAttrs"
    :href="href"
    :class="classes"
    @click="onClick"
  >
    <slot />
  </a>
  <button
    v-else
    v-bind="rootAttrs"
    :type="type"
    :disabled="disabled"
    :class="classes"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style
  module="primitive"
  src="../../../../../primitives/src/lib/Button/Button.module.css"
></style>
<style
  module="skin"
  src="../../../../react/src/lib/Button/Button.module.css"
></style>
