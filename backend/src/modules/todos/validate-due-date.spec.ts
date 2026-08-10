import { validateDueDate } from './validate-due-date';

describe('validateDueDate', () => {
  it('returns null when dueDate is empty', () => {
    expect(validateDueDate('2026-07-28', '15:00', '', '')).toBeNull();
  });

  it('returns error when dueDate is before startDate', () => {
    expect(
      validateDueDate('2026-07-28', '09:00', '2026-07-25', '16:00'),
    ).toBe("Due date can't be before the start date.");
  });

  it('returns null when dueDate is after startDate', () => {
    expect(validateDueDate('2026-07-28', '09:00', '2026-07-29', '09:00')).toBeNull();
  });

  it('returns null when dueDate equals startDate (no time conflict)', () => {
    expect(validateDueDate('2026-07-28', '15:00', '2026-07-28', '')).toBeNull();
  });

  it('returns error when same day and dueTime is before startTime', () => {
    expect(
      validateDueDate('2026-07-28', '15:00', '2026-07-28', '13:00'),
    ).toBe("Due time can't be before the start time on the same day.");
  });

  it('returns null when same day and dueTime is after startTime', () => {
    expect(validateDueDate('2026-07-28', '15:00', '2026-07-28', '16:00')).toBeNull();
  });

  it('returns null when same day and dueTime equals startTime', () => {
    expect(validateDueDate('2026-07-28', '15:00', '2026-07-28', '15:00')).toBeNull();
  });
});
