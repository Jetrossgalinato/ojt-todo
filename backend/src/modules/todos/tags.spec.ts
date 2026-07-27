import { parseTags, tagsToApiPayload } from './tags';

describe('parseTags', () => {
  it('converts comma-separated string into a clean array', () => {
    expect(parseTags('urgent, home')).toEqual(['urgent', 'home']);
  });

  it('trims whitespace from each tag', () => {
    expect(parseTags('  urgent  ,  home  ')).toEqual(['urgent', 'home']);
  });

  it('lowercases all tags', () => {
    expect(parseTags('Urgent, HOME, School')).toEqual(['urgent', 'home', 'school']);
  });

  it('removes duplicate tags (case-insensitive)', () => {
    expect(parseTags('Urgent, urgent, URGENT')).toEqual(['urgent']);
  });

  it('filters out empty and blank tags', () => {
    expect(parseTags('urgent, , , home,   ')).toEqual(['urgent', 'home']);
  });

  it('returns empty array for empty string', () => {
    expect(parseTags('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(parseTags('   ')).toEqual([]);
  });

  it('returns empty array for null input', () => {
    expect(parseTags(null as unknown as string)).toEqual([]);
  });

  it('returns empty array for undefined input', () => {
    expect(parseTags(undefined as unknown as string)).toEqual([]);
  });

  it('handles single tag', () => {
    expect(parseTags('urgent')).toEqual(['urgent']);
  });

  it('handles trailing/leading commas', () => {
    expect(parseTags(',urgent,home,')).toEqual(['urgent', 'home']);
  });
});

describe('tagsToApiPayload', () => {
  it('returns a clean string array, never a JSON string', () => {
    const result = tagsToApiPayload('urgent, home');
    expect(typeof result).not.toBe('string');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(['urgent', 'home']);
  });

  it('never returns a JSON string representation', () => {
    const result = tagsToApiPayload('["urgent","home"]');
    expect(typeof result).toBe('object');
    expect(Array.isArray(result)).toBe(true);
    expect(result).not.toBe('["urgent","home"]');
  });

  it('deduplicates tags', () => {
    const result = tagsToApiPayload('urgent, Urgent, URGENT');
    expect(result).toEqual(['urgent']);
  });
});

describe('round-trip: save and load preserves tags as array', () => {
  it('parseTags output is always a string array', () => {
    const payload = tagsToApiPayload('school, urgent, home');
    expect(typeof payload).not.toBe('string');
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toEqual(['school', 'urgent', 'home']);
  });
});
