import { mount } from '@vue/test-utils';
import Card from './Card.vue';

describe('Card', () => {
  it('renders kicker, title and body content', () => {
    const wrapper = mount(Card, {
      props: { kicker: 'Case study', title: 'Living interface' },
      slots: { default: 'A resilient, real-time surface.' },
    });
    expect(wrapper.text()).toContain('Case study');
    expect(wrapper.text()).toContain('Living interface');
    expect(wrapper.text()).toContain('A resilient, real-time surface.');
  });

  it('renders kicker and title slots in place of the props', () => {
    const wrapper = mount(Card, {
      props: { kicker: 'prop kicker', title: 'prop title' },
      slots: { kicker: '<b>Slot kicker</b>', title: '<i>Slot title</i>' },
    });
    expect(wrapper.get('b').text()).toBe('Slot kicker');
    expect(wrapper.get('i').text()).toBe('Slot title');
    expect(wrapper.text()).not.toContain('prop');
  });

  it('renders decorative arcs only for the expressive variant', async () => {
    const wrapper = mount(Card, {
      props: { title: 'X' },
      slots: { default: 'body' },
    });
    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(0);

    await wrapper.setProps({ variant: 'expressive' });
    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it('passes through arbitrary attributes to the root element', () => {
    const wrapper = mount(Card, {
      props: { title: 'X' },
      attrs: { 'data-testid': 'card' },
    });
    expect(wrapper.attributes('data-testid')).toBe('card');
  });

  it('exposes the root element', () => {
    const wrapper = mount(Card, {
      props: { title: 'X' },
      attrs: { 'data-testid': 'card' },
    });
    expect(wrapper.vm.$el).toBe(wrapper.get('[data-testid="card"]').element);
  });

  it('has a name for Vue DevTools', () => {
    expect(Card.name).toBe('Card');
  });
});
