import { mount } from '@vue/test-utils';
import ModeToggle from './ModeToggle.vue';

const tab = (wrapper: ReturnType<typeof mount>, name: string) => {
  const found = wrapper.findAll('[role="tab"]').find((t) => t.text() === name);
  if (!found) throw new Error(`no tab named ${name}`);
  return found;
};

describe('ModeToggle', () => {
  it('renders a tablist with both postures', () => {
    const wrapper = mount(ModeToggle);
    expect(wrapper.attributes('role')).toBe('tablist');
    expect(wrapper.attributes('aria-label')).toBe('Site posture');
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2);
  });

  it('marks the tab matching `modelValue` as selected', () => {
    const wrapper = mount(ModeToggle, { props: { modelValue: 'recruiter' } });
    expect(tab(wrapper, 'Recruiter').attributes('aria-selected')).toBe('true');
    expect(tab(wrapper, 'Explorer').attributes('aria-selected')).toBe('false');
    expect(tab(wrapper, 'Recruiter').attributes('tabindex')).toBe('0');
    expect(tab(wrapper, 'Explorer').attributes('tabindex')).toBe('-1');
  });

  it('emits update:modelValue with the clicked mode', async () => {
    const wrapper = mount(ModeToggle, { props: { modelValue: 'explorer' } });
    await tab(wrapper, 'Recruiter').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['recruiter']]);
  });

  it('is controlled: selection only moves when the parent updates it', async () => {
    const wrapper = mount(ModeToggle, { props: { modelValue: 'explorer' } });
    await tab(wrapper, 'Recruiter').trigger('click');
    expect(tab(wrapper, 'Explorer').attributes('aria-selected')).toBe('true');

    await wrapper.setProps({ modelValue: 'recruiter' });
    expect(tab(wrapper, 'Recruiter').attributes('aria-selected')).toBe('true');
  });

  it('moves focus and selection with arrow keys', async () => {
    const wrapper = mount(ModeToggle, {
      props: { modelValue: 'explorer' },
      attachTo: document.body,
    });

    const explorer = tab(wrapper, 'Explorer');
    const recruiter = tab(wrapper, 'Recruiter');
    (explorer.element as HTMLElement).focus();
    await explorer.trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('update:modelValue')).toEqual([['recruiter']]);
    expect(document.activeElement).toBe(recruiter.element);
    wrapper.unmount();
  });

  it('wraps around and supports Home / End', async () => {
    const wrapper = mount(ModeToggle, {
      props: { modelValue: 'explorer' },
      attachTo: document.body,
    });
    const explorer = tab(wrapper, 'Explorer');
    await explorer.trigger('keydown', { key: 'ArrowLeft' });
    await explorer.trigger('keydown', { key: 'End' });
    await explorer.trigger('keydown', { key: 'Home' });
    await explorer.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')).toEqual([
      ['recruiter'],
      ['recruiter'],
      ['explorer'],
    ]);
    wrapper.unmount();
  });

  it('exposes the tablist as its root element', () => {
    const wrapper = mount(ModeToggle);
    expect(wrapper.vm.$el).toBe(wrapper.get('[role="tablist"]').element);
  });

  it('has a name for Vue DevTools', () => {
    expect(ModeToggle.name).toBe('ModeToggle');
  });
});
