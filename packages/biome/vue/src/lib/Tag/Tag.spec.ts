import { mount } from '@vue/test-utils';
import Tag from './Tag.vue';

describe('Tag', () => {
  it('renders its label', () => {
    const wrapper = mount(Tag, { slots: { default: 'TypeScript' } });
    expect(wrapper.text()).toBe('TypeScript');
  });

  it('renders a status dot only when status is set', async () => {
    const wrapper = mount(Tag, { slots: { default: 'Open' } });
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false);

    await wrapper.setProps({ status: true });
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true);
  });

  it('passes through arbitrary attributes', () => {
    const wrapper = mount(Tag, {
      attrs: { 'data-testid': 'tag' },
      slots: { default: 'Senior' },
    });
    expect(wrapper.attributes('data-testid')).toBe('tag');
  });

  it('exposes the root element', () => {
    const wrapper = mount(Tag, {
      attrs: { 'data-testid': 'tag' },
      slots: { default: 'Senior' },
    });
    expect(wrapper.vm.$el).toBe(wrapper.get('[data-testid="tag"]').element);
  });

  it('has a name for Vue DevTools', () => {
    expect(Tag.name).toBe('Tag');
  });
});
