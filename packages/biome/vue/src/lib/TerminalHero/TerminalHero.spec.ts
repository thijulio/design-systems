import { h } from 'vue';
import { mount } from '@vue/test-utils';
import TerminalHero from './TerminalHero.vue';
import Tok from './Tok.vue';
import { TERMINAL_COLORS } from './terminal';

const normalized = (text: string) => text.replace(/\s+/g, ' ').trim();

describe('TerminalHero', () => {
  it('renders the identity column (eyebrow, heading, lede)', () => {
    const wrapper = mount(TerminalHero, {
      props: {
        loop: false,
        eyebrow: 'Engineer',
        title: 'Grow software',
        lede: 'Resilient by design.',
      },
    });
    expect(wrapper.text()).toContain('Engineer');
    expect(wrapper.get('h1').text()).toBe('Grow software');
    expect(wrapper.get('p').text()).toBe('Resilient by design.');
  });

  it('renders both action links with their hrefs', () => {
    const wrapper = mount(TerminalHero, {
      props: {
        loop: false,
        primaryLabel: 'Explore',
        primaryHref: '/projects',
        secondaryLabel: 'Recruiter',
        secondaryHref: '/cv',
      },
    });
    const [primary, secondary] = wrapper.findAll('a');
    expect(primary.text()).toBe('Explore');
    expect(primary.attributes('href')).toBe('/projects');
    expect(secondary.text()).toBe('Recruiter');
    expect(secondary.attributes('href')).toBe('/cv');
  });

  it('renders the terminal title and custom code lines', () => {
    const wrapper = mount(TerminalHero, {
      props: {
        loop: false,
        terminalTitle: '~/site',
        lines: [h('span', 'const a = 1;')],
        command: h('span', 'run()'),
        output: null,
      },
    });
    expect(wrapper.text()).toContain('~/site');
    expect(wrapper.text()).toContain('const a = 1;');
    expect(wrapper.text()).toContain('run()');
    expect(wrapper.findAll('[data-th-anim]')).toHaveLength(1);
  });

  it('renders slots in place of the props', () => {
    const wrapper = mount(TerminalHero, {
      props: { loop: false },
      slots: {
        title: 'Slot <em>title</em>',
        command: '<code>slot()</code>',
        output: '<samp>done</samp>',
      },
    });
    expect(wrapper.get('h1').text()).toBe('Slot title');
    expect(wrapper.get('code').text()).toBe('slot()');
    expect(wrapper.get('samp').text()).toBe('done');
  });

  it('exposes Tok and TERMINAL_COLORS for composing code lines', () => {
    const wrapper = mount(Tok, {
      props: { c: TERMINAL_COLORS.keyword },
      slots: { default: 'const' },
    });
    expect(wrapper.text()).toBe('const');
    expect(wrapper.attributes('style')).toContain(
      'var(--terminal-syntax-keyword)',
    );
  });

  it('exposes the root section', () => {
    const wrapper = mount(TerminalHero, {
      props: { loop: false },
      attrs: { 'data-testid': 'hero' },
    });
    expect(wrapper.vm.$el).toBe(wrapper.get('section').element);
    expect(wrapper.attributes('data-testid')).toBe('hero');
  });

  it('renders neutral placeholder copy by default', () => {
    const wrapper = mount(TerminalHero, { props: { loop: false } });
    expect(wrapper.text()).toContain('Eyebrow · Context');
    expect(normalized(wrapper.get('h1').text())).toBe(
      'Your headline goes here,in two short lines.',
    );
    expect(wrapper.get('p').text()).toBe(
      'A one- or two-sentence introduction to the page goes here.',
    );
    const [primary, secondary] = wrapper.findAll('a');
    expect(primary.text()).toBe('Primary action →');
    expect(secondary.text()).toBe('Secondary action ›');
  });

  // Pins every default string, so any change to the defaults (including
  // personal copy creeping back in) fails here and has to be reviewed.
  it('pins the full default text', () => {
    const wrapper = mount(TerminalHero, { props: { loop: false } });
    expect(normalized(wrapper.element.textContent ?? '')).toBe(
      [
        'Eyebrow · Context',
        'Your headline goes here,in two short lines.',
        'A one- or two-sentence introduction to the page goes here.',
        'Primary action →Secondary action ›',
        '~/biome — node',
        'const app = new App(); function build(idea) { return app .plan(idea) ',
        ".ship().iterate();}$ build('your project')",
        "→ { status: 'ready', result: 'ok' }",
      ].join(''),
    );
  });

  it('ships no personal copy in its defaults', () => {
    const wrapper = mount(TerminalHero, { props: { loop: false } });
    const text = wrapper.element.textContent ?? '';
    for (const banned of [
      /ecosystem/i,
      /thiago/i,
      /são paulo/i,
      /senior roles/i,
      /recruiter/i,
    ]) {
      expect(text).not.toMatch(banned);
    }
  });

  it('replays the animations every cycleMs while looping, and stops on unmount', async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mount(TerminalHero, { props: { cycleMs: 1000 } });
      const line = wrapper.get('[data-th-anim]').element as HTMLElement;
      const writes: string[] = [];
      const style = line.style;
      const spy = vi.spyOn(style, 'animation', 'set');
      spy.mockImplementation((value: string) => writes.push(value));
      vi.advanceTimersByTime(1000);
      expect(writes).toEqual(['none', '']);
      wrapper.unmount();
      vi.advanceTimersByTime(3000);
      expect(writes).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not loop under prefers-reduced-motion', () => {
    vi.useFakeTimers();
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
    })) as typeof window.matchMedia;
    try {
      const wrapper = mount(TerminalHero, { props: { cycleMs: 1000 } });
      expect(vi.getTimerCount()).toBe(0);
      wrapper.unmount();
    } finally {
      window.matchMedia = original;
      vi.useRealTimers();
    }
  });

  it('has a name for Vue DevTools', () => {
    expect(TerminalHero.name).toBe('TerminalHero');
  });
});
