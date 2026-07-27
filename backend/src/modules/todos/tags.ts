export function parseTags(input: string): string[] {
  if (!input || typeof input !== 'string') return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of input.split(',')) {
    const tag = raw.trim().toLowerCase();
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
    }
  }

  return result;
}

export function tagsToApiPayload(input: string): string[] {
  return parseTags(input);
}

export interface TaskTag {
  id: string;
  name: string;
}

export function tagsDisplayString(tags: TaskTag[] | string | null | undefined): string {
  if (!tags) return '';
  if (typeof tags === 'string') return tags;
  return tags.map((t) => t.name).join(', ');
}

export function tagsToFormInput(tags: TaskTag[]): string {
  return tags.map((t) => t.name).join(', ');
}
