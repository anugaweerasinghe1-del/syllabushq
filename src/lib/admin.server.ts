// Server-only: validates the admin password used to delete reviews.
export function checkAdminPassword(input: unknown): boolean {
  const expected = process.env.REVIEW_DELETE_PASSWORD;
  if (!expected || typeof input !== "string") return false;
  if (input.length !== expected.length) return false;
  let same = 0;
  for (let i = 0; i < expected.length; i++) {
    same |= expected.charCodeAt(i) ^ input.charCodeAt(i);
  }
  return same === 0;
}
