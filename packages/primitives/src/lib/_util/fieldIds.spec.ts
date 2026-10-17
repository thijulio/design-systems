import { fieldDescribedBy, fieldErrorId, fieldHintId } from './fieldIds';

describe('field ids', () => {
  it('derives the hint and error ids from the control id', () => {
    expect(fieldHintId('dob')).toBe('dob-hint');
    expect(fieldErrorId('dob')).toBe('dob-error');
  });

  it('describes the control by the error while one shows, else the hint', () => {
    expect(fieldDescribedBy('dob', { error: 'Required', hint: 'DD/MM' })).toBe(
      'dob-error',
    );
    expect(fieldDescribedBy('dob', { hint: 'DD/MM' })).toBe('dob-hint');
    expect(fieldDescribedBy('dob', { error: '', hint: '' })).toBeUndefined();
    expect(fieldDescribedBy('dob')).toBeUndefined();
  });
});
