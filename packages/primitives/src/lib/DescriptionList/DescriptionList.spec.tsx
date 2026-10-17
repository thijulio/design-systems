import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { DescriptionList } from './DescriptionList';
import styles from './DescriptionList.module.css';

const items = [
  { term: 'Breed', description: 'Maine Coon', testId: 'breed' },
  { term: 'Born', description: '2024-03-01' },
];

describe('DescriptionList', () => {
  it('renders terms and descriptions in a dl', () => {
    const { container } = render(<DescriptionList items={items} />);
    expect(container.querySelector('dl')).not.toBeNull();
    expect(screen.getAllByRole('term').map((dt) => dt.textContent)).toEqual([
      'Breed',
      'Born',
    ]);
    expect(
      screen.getAllByRole('definition').map((dd) => dd.textContent),
    ).toEqual(['Maine Coon', '2024-03-01']);
  });

  it('puts test ids on the item group', () => {
    render(<DescriptionList items={items} />);
    expect(screen.getByTestId('breed')).toHaveTextContent('BreedMaine Coon');
  });

  it('maps the layout and forwards ref', () => {
    const ref = createRef<HTMLDListElement>();
    const { container } = render(
      <DescriptionList ref={ref} items={items} layout="inline" />,
    );
    expect(ref.current).toBe(container.querySelector('dl'));
    expect(ref.current).toHaveClass(styles.inline);
  });
});
