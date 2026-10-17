import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabPanel, tabId, tabPanelId } from './Tabs';

const tabs = [
  { value: 'all', label: 'All', count: 12, testId: 'tab-all' },
  { value: 'active', label: 'Active', testId: 'tab-active' },
  { value: 'archived', label: 'Archived', disabled: true },
];

describe('Tabs', () => {
  it('names the tablist from the required label', () => {
    render(<Tabs tabs={tabs} label="Animal filters" value="all" />);
    expect(
      screen.getByRole('tablist', { name: 'Animal filters' }),
    ).toBeInTheDocument();
  });

  it('marks the selected tab and renders count chips', () => {
    render(<Tabs tabs={tabs} label="Filters" value="all" />);
    expect(screen.getByRole('tab', { name: /All/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('calls onChange for enabled tabs but not disabled ones', () => {
    const onChange = jest.fn();
    render(
      <Tabs tabs={tabs} label="Filters" value="all" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Active' }));
    expect(onChange).toHaveBeenCalledWith('active');

    fireEvent.click(screen.getByRole('tab', { name: 'Archived' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('stays on the controlled value until the parent changes it', () => {
    render(<Tabs tabs={tabs} label="Filters" value="all" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Active' }));
    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('uses arrow keys to move between enabled tabs', () => {
    const onChange = jest.fn();
    render(
      <Tabs tabs={tabs} label="Filters" value="active" onChange={onChange} />,
    );

    const active = screen.getByRole('tab', { name: 'Active' });
    const all = screen.getByRole('tab', { name: /All/ });
    active.focus();
    fireEvent.keyDown(active, { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith('all');
    expect(all).toHaveFocus();
  });

  it('works uncontrolled from defaultValue, keeping the roving tabindex in step', () => {
    const onChange = jest.fn();
    render(
      <Tabs
        tabs={tabs}
        label="Filters"
        defaultValue="active"
        onChange={onChange}
      />,
    );
    const all = screen.getByRole('tab', { name: /All/ });
    const active = screen.getByRole('tab', { name: 'Active' });
    expect(active).toHaveAttribute('aria-selected', 'true');
    expect(active).toHaveAttribute('tabindex', '0');

    fireEvent.click(all);
    expect(onChange).toHaveBeenCalledWith('all');
    expect(all).toHaveAttribute('aria-selected', 'true');
    expect(all).toHaveAttribute('tabindex', '0');
    expect(active).toHaveAttribute('tabindex', '-1');

    all.focus();
    fireEvent.keyDown(all, { key: 'End' });
    expect(active).toHaveAttribute('aria-selected', 'true');
    expect(active).toHaveFocus();
  });

  it('passes each item testId through as data-testid', () => {
    render(<Tabs tabs={tabs} label="Filters" value="all" />);
    expect(screen.getByTestId('tab-active')).toHaveAttribute('role', 'tab');
  });

  it('wires tab and panel ids from idBase', () => {
    render(
      <>
        <Tabs
          tabs={tabs}
          label="Filters"
          value="all"
          idBase="animals"
          controlsPanels
        />
        <TabPanel idBase="animals" value="all" selected>
          Every animal
        </TabPanel>
        <TabPanel idBase="animals" value="active" selected={false}>
          Active animals
        </TabPanel>
      </>,
    );
    const tab = screen.getByRole('tab', { name: /All/ });
    expect(tab).toHaveAttribute('id', 'animals-tab-all');
    expect(tab).toHaveAttribute('aria-controls', 'animals-panel-all');

    const panel = screen.getByRole('tabpanel', { name: /All/ });
    expect(panel).toHaveAttribute('id', 'animals-panel-all');
    expect(panel).toHaveTextContent('Every animal');
    expect(screen.queryByText('Active animals')).not.toBeVisible();
  });

  it('points every tab at one shared panel with panelId', () => {
    render(
      <>
        <Tabs
          tabs={tabs}
          label="Filters"
          value="active"
          idBase="animals"
          panelId="animals-shared"
        />
        <TabPanel
          idBase="animals"
          panelId="animals-shared"
          value="active"
          selected
        >
          Shown animals
        </TabPanel>
      </>,
    );
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).toHaveAttribute('aria-controls', 'animals-shared');
    }
    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'id',
      'animals-tab-active',
    );

    const panel = screen.getByRole('tabpanel', { name: 'Active' });
    expect(panel).toHaveAttribute('id', 'animals-shared');
    expect(panel).toHaveTextContent('Shown animals');
  });

  it('renders the pill variant with the same tab semantics', () => {
    const onChange = jest.fn();
    render(
      <Tabs
        tabs={tabs}
        label="Filters"
        value="all"
        variant="pill"
        onChange={onChange}
      />,
    );
    const tablist = screen.getByRole('tablist', { name: 'Filters' });
    expect(tablist.className).toMatch(/pill/);

    const all = screen.getByRole('tab', { name: /All/ });
    all.focus();
    fireEvent.keyDown(all, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('keeps ids valid IDREFs when a value has spaces or symbols', () => {
    expect(tabId('animals', 'for sale')).toBe('animals-tab-for_20sale');
    expect(tabPanelId('animals', 'a.b')).toBe('animals-panel-a_2Eb');
    expect(tabId('animals', 'all_cats-1')).toBe('animals-tab-all_cats-1');
  });

  it('omits aria-controls unless panels are declared, and forwards a ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tabs ref={ref} tabs={tabs} label="Filters" value="all" />);
    expect(screen.getByRole('tab', { name: /All/ })).not.toHaveAttribute(
      'aria-controls',
    );
    expect(ref.current?.className).not.toMatch(/pill/);
    expect(ref.current).toBe(screen.getByRole('tablist'));
  });
});
