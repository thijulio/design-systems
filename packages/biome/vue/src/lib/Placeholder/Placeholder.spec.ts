import { mount } from '@vue/test-utils';
import Placeholder from './Placeholder.vue';

describe('Placeholder', () => {
  it('renders its default slot in a span', () => {
    const wrapper = mount(Placeholder, { slots: { default: 'Biome' } });
    expect(wrapper.element.tagName).toBe('SPAN');
    expect(wrapper.text()).toBe('Biome');
  });

  it('renders the element named by `as`', () => {
    const wrapper = mount(Placeholder, { props: { as: 'div' } });
    expect(wrapper.element.tagName).toBe('DIV');
  });

  it('passes through attributes to the root element', () => {
    const wrapper = mount(Placeholder, { attrs: { 'data-testid': 'probe' } });
    expect(wrapper.attributes('data-testid')).toBe('probe');
  });
});
