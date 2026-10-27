<script setup lang="ts">
import {
  ref,
  watchEffect,
  type FunctionalComponent,
  type VNodeChild,
} from 'vue';
import {
  defaultCommand,
  defaultLines,
  defaultOutput,
  defaultTitle,
} from './terminal';

export interface TerminalHeroProps {
  eyebrow?: string;
  /** Heading text. The `title` slot overrides it; both absent, a placeholder. */
  title?: string;
  lede?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  terminalTitle?: string;
  /** Code lines rendered in the terminal, each self-typed in sequence. */
  lines?: VNodeChild[];
  /** The prompt line. The `command` slot overrides it. */
  command?: VNodeChild;
  /** Result line; `null` hides it. The `output` slot overrides it. */
  output?: VNodeChild;
  /** Replay the type-in animation every `cycleMs`. */
  loop?: boolean;
  cycleMs?: number;
  showContours?: boolean;
}

defineOptions({ name: 'TerminalHero' });

const props = withDefaults(defineProps<TerminalHeroProps>(), {
  eyebrow: 'Eyebrow · Context',
  title: undefined,
  lede: 'A one- or two-sentence introduction to the page goes here.',
  primaryLabel: 'Primary action →',
  primaryHref: '#',
  secondaryLabel: 'Secondary action ›',
  secondaryHref: '#',
  terminalTitle: '~/biome — node',
  lines: () => defaultLines(),
  command: () => defaultCommand(),
  output: () => defaultOutput(),
  loop: true,
  cycleMs: 9500,
  showContours: true,
});

defineSlots<{
  eyebrow?: () => unknown;
  title?: () => unknown;
  lede?: () => unknown;
  primary?: () => unknown;
  secondary?: () => unknown;
  'terminal-title'?: () => unknown;
  command?: () => unknown;
  output?: () => unknown;
}>();

/** Renders a VNodeChild prop (text, VNodes or an array of both). */
const Render: FunctionalComponent<{ node: VNodeChild }> = (p) =>
  p.node as ReturnType<FunctionalComponent>;

const termBody = ref<HTMLDivElement>();

watchEffect(
  (onCleanup) => {
    if (!props.loop) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduce?.matches) return;
    const container = termBody.value;
    if (!container) return;
    const id = window.setInterval(() => {
      const els = container.querySelectorAll<HTMLElement>('[data-th-anim]');
      els.forEach((el) => {
        el.style.animation = 'none';
      });
      void container.offsetWidth; // reflow → restart animations
      els.forEach((el) => {
        el.style.animation = '';
      });
    }, props.cycleMs);
    onCleanup(() => window.clearInterval(id));
  },
  { flush: 'post' },
);

const base = 0.25;
const step = 0.7;
</script>

<!--
  TerminalHero — the signature Biome Modernism hero: an editorial identity
  column beside a self-typing terminal, over breathing topographic contours.
-->
<template>
  <section :class="$style.hero">
    <div v-if="showContours" :class="$style.contours">
      <svg viewBox="0 0 1000 1000" width="100%" height="100%">
        <g :class="$style.rings">
          <circle
            cx="560"
            cy="500"
            r="96"
            fill="none"
            stroke="var(--terminal-contour-sage)"
            stroke-width="1.3"
            opacity=".55"
          />
          <circle
            cx="560"
            cy="500"
            r="176"
            fill="none"
            stroke="var(--terminal-contour-soft)"
            stroke-width="1.1"
            opacity=".42"
          />
          <circle
            cx="560"
            cy="500"
            r="258"
            fill="none"
            stroke="var(--terminal-contour-soft)"
            stroke-width="1"
            opacity=".32"
          />
        </g>
        <g :class="$style.ringsSlow">
          <circle
            cx="560"
            cy="500"
            r="352"
            fill="none"
            stroke="var(--terminal-contour-terracotta)"
            stroke-width="1"
            opacity=".26"
          />
          <circle
            cx="560"
            cy="500"
            r="452"
            fill="none"
            stroke="var(--terminal-contour-sage)"
            stroke-width=".8"
            opacity=".16"
          />
          <circle
            cx="560"
            cy="500"
            r="560"
            fill="none"
            stroke="var(--terminal-contour-muted)"
            stroke-width=".7"
            opacity=".12"
          />
        </g>
        <circle cx="560" cy="500" r="4" fill="var(--terminal-eyebrow)" />
      </svg>
    </div>

    <div :class="$style.inner">
      <div>
        <div :class="$style.eyebrow">
          <slot name="eyebrow">{{ eyebrow }}</slot>
        </div>
        <h1 :class="$style.title">
          <slot name="title">
            <template v-if="title !== undefined">{{ title }}</template>
            <Render v-else :node="defaultTitle()" />
          </slot>
        </h1>
        <p :class="$style.lede">
          <slot name="lede">{{ lede }}</slot>
        </p>
        <div :class="$style.actions">
          <a :href="primaryHref" :class="[$style.action, $style.actionPrimary]">
            <slot name="primary">{{ primaryLabel }}</slot>
          </a>
          <a
            :href="secondaryHref"
            :class="[$style.action, $style.actionSecondary]"
          >
            <slot name="secondary">{{ secondaryLabel }}</slot>
          </a>
        </div>
      </div>

      <div :class="$style.card">
        <div :class="$style.terminal">
          <div :class="$style.titlebar">
            <span :class="[$style.dot, $style.dotRed]" />
            <span :class="[$style.dot, $style.dotAmber]" />
            <span :class="[$style.dot, $style.dotGreen]" />
            <span :class="$style.termTitle">
              <slot name="terminal-title">{{ terminalTitle }}</slot>
            </span>
          </div>
          <div ref="termBody" :class="$style.termBody">
            <div
              v-for="(line, i) in lines"
              :key="i"
              :class="$style.line"
              data-th-anim="true"
              :style="{ animationDelay: `${base + i * step}s` }"
            >
              <Render :node="line" />
            </div>
            <div :class="$style.commandLine">
              <slot name="command"><Render :node="command" /></slot>
              <span :class="$style.caret" />
            </div>
            <div
              v-if="$slots.output || output != null"
              :class="$style.out"
              data-th-anim="true"
              :style="{
                animationDelay: `${base + lines.length * step + 0.4}s`,
              }"
            >
              <slot name="output"><Render :node="output" /></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style
  module
  src="../../../../react/src/lib/TerminalHero/TerminalHero.module.css"
></style>
