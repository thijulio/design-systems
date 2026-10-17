import { createRef, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  ReorderableList,
  type ReorderableListProps,
} from './ReorderableList';

interface Pet {
  id: string;
  name: string;
}

const PETS: Pet[] = [
  { id: 'a', name: 'Rocket' },
  { id: 'b', name: 'Biscuit' },
  { id: 'c', name: 'Pepper' },
];

const moveItem = <T,>(items: readonly T[], from: number, to: number) => {
  const next = [...items];
  const [moving] = next.splice(from, 1);
  next.splice(to, 0, moving);
  return next;
};

function Demo(props: Partial<ReorderableListProps<Pet>>) {
  const [pets, setPets] = useState(PETS);
  return (
    <ReorderableList
      items={pets}
      getKey={(pet) => pet.id}
      renderItem={(pet) => pet.name}
      onMove={(_pet, to, from) => setPets((all) => moveItem(all, from, to))}
      moveUpLabel={(pet) => `Move ${pet.name} up`}
      moveDownLabel={(pet) => `Move ${pet.name} down`}
      announcement={(pet, position, total) =>
        `${pet.name} moved to ${position} of ${total}`
      }
      itemTestId={(pet) => `pet-${pet.id}`}
      moveUpTestId={(pet) => `pet-${pet.id}-up`}
      moveDownTestId={(pet) => `pet-${pet.id}-down`}
      announcementTestId="pets-announcement"
      {...props}
    />
  );
}

const names = () =>
  screen
    .getAllByRole('listitem')
    .map((item) => item.textContent?.trim() ?? '');

describe('ReorderableList', () => {
  it('renders an ol of li with labelled move controls', () => {
    render(<Demo data-testid="pets" />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(list).toBe(screen.getByTestId('pets'));
    expect(list.querySelectorAll(':scope > li')).toHaveLength(3);
    expect(screen.getByTestId('pet-b').tagName).toBe('LI');
    const row = within(screen.getByTestId('pet-b'));
    expect(
      row.getByRole('button', { name: 'Move Biscuit up' }),
    ).toHaveAttribute('type', 'button');
    expect(
      row.getByRole('button', { name: 'Move Biscuit down' }),
    ).toBeInTheDocument();
  });

  it('moves an item and announces its new position', () => {
    render(<Demo />);
    const region = screen.getByTestId('pets-announcement');
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toBeEmptyDOMElement();

    fireEvent.click(screen.getByTestId('pet-b-up'));
    expect(names()).toEqual(['Biscuit', 'Rocket', 'Pepper']);
    expect(region).toHaveTextContent('Biscuit moved to 1 of 3');

    fireEvent.click(screen.getByTestId('pet-a-down'));
    expect(names()).toEqual(['Biscuit', 'Pepper', 'Rocket']);
    expect(screen.getByTestId('pets-announcement')).toBe(region);
    expect(region).toHaveTextContent('Rocket moved to 3 of 3');
  });

  it('keeps the end controls focusable but refuses the press', () => {
    const onMove = jest.fn();
    render(<Demo onMove={onMove} />);
    const firstUp = screen.getByTestId('pet-a-up');
    const lastDown = screen.getByTestId('pet-c-down');

    expect(firstUp).toHaveAttribute('aria-disabled', 'true');
    expect(lastDown).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('pet-a-down')).toHaveAttribute(
      'aria-disabled',
      'false',
    );
    expect(firstUp).toBeEnabled();

    fireEvent.click(firstUp);
    fireEvent.click(lastDown);
    expect(onMove).not.toHaveBeenCalled();
    expect(screen.getByTestId('pets-announcement')).toBeEmptyDOMElement();
  });

  it('reports the item, the target and the source index', () => {
    const onMove = jest.fn();
    render(<Demo onMove={onMove} />);
    fireEvent.click(screen.getByTestId('pet-a-down'));
    expect(onMove).toHaveBeenCalledWith(PETS[0], 1, 0);
  });

  it('keeps focus on the pressed control while its row moves', () => {
    render(<Demo />);
    const down = screen.getByTestId('pet-a-down');
    down.focus();
    fireEvent.click(down);
    expect(names()).toEqual(['Biscuit', 'Rocket', 'Pepper']);
    expect(screen.getByTestId('pet-a-down')).toBe(down);
    expect(down).toHaveFocus();
  });

  it('honours `as`, item class and forwards ref and DOM props', () => {
    const ref = createRef<HTMLElement>();
    render(
      <ReorderableList
        ref={ref}
        items={PETS}
        getKey={(pet) => pet.id}
        renderItem={(pet) => pet.name}
        onMove={() => undefined}
        moveUpLabel={(pet) => `Move ${pet.name} up`}
        moveDownLabel={(pet) => `Move ${pet.name} down`}
        announcement={(pet) => pet.name}
        itemTestId={(pet) => `pet-${pet.id}`}
        as="ul"
        className="extra"
        itemClassName="row"
        aria-label="Pets"
      />,
    );
    const list = screen.getByRole('list', { name: 'Pets' });
    expect(ref.current).toBe(list);
    expect(list.tagName).toBe('UL');
    expect(list).toHaveClass('extra');
    expect(screen.getByTestId('pet-a')).toHaveClass('row');
  });
});
