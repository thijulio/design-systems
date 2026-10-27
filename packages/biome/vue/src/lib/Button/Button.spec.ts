import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('renders a button element by default', () => {
    const wrapper = mount(Button, { slots: { default: 'Grow' } });
    const btn = wrapper.get('button');
    expect(btn.text()).toBe('Grow');
    expect(btn.attributes('type')).toBe('button');
  });

  it('renders an anchor when href is provided', () => {
    const wrapper = mount(Button, {
      props: { href: '/projects' },
      slots: { default: 'Explore' },
    });
    expect(wrapper.get('a').attributes('href')).toBe('/projects');
    expect(wrapper.find('a').text()).toBe('Explore');
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('stays a (disabled) button when disabled, even with href', () => {
    const wrapper = mount(Button, {
      props: { href: '/projects', disabled: true },
      slots: { default: 'Explore' },
    });
    expect(wrapper.find('a').exists()).toBe(false);
    expect(wrapper.get('button').element.disabled).toBe(true);
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Grow' },
    });
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('emits click and passes through arbitrary attributes', async () => {
    const wrapper = mount(Button, {
      attrs: { 'aria-label': 'grow-action' },
      slots: { default: 'Grow' },
    });
    const btn = wrapper.get('button');
    expect(btn.attributes('aria-label')).toBe('grow-action');
    await btn.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('drops button-only attributes on the anchor', () => {
    const wrapper = mount(Button, {
      props: { href: '/projects' },
      attrs: { name: 'go', value: '1', form: 'f', 'data-testid': 'link' },
    });
    const link = wrapper.get('a');
    expect(link.attributes('data-testid')).toBe('link');
    for (const attr of ['name', 'value', 'form', 'type']) {
      expect(link.attributes(attr)).toBeUndefined();
    }
  });

  it('exposes the native button as its root element', () => {
    const wrapper = mount(Button, { slots: { default: 'Grow' } });
    expect(wrapper.vm.$el).toBe(wrapper.get('button').element);
  });

  it('exposes the anchor as its root element when href is provided', () => {
    const wrapper = mount(Button, { props: { href: '/projects' } });
    expect(wrapper.vm.$el).toBe(wrapper.get('a').element);
  });

  it('has a name for Vue DevTools', () => {
    expect(Button.name).toBe('Button');
  });
});
