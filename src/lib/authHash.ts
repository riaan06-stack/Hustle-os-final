/**
 * NOT cryptographically secure. Exists only so a raw password is never
 * written verbatim to localStorage in the mock-auth phase. Replace with
 * real server-side hashing when a backend is introduced.
 */
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `mock_${Math.abs(hash)}_${password.length}`;
}
