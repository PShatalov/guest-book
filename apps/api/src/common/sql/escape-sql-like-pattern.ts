/**
 * Escapes `%`, `_`, and `\` so a user-provided string is safe inside SQL LIKE/ILIKE.
 */
export function escapeSqlLikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}
