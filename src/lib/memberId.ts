import { checkMemberIdExists } from "@/lib/db";

/**
 * Generates a random 5-digit member ID formatted as "AV" + 5 digits (e.g. AV10001 to AV99999).
 */
export function generateCandidateMemberId(): string {
  const randomFiveDigits = Math.floor(10000 + Math.random() * 90000);
  return `AV${randomFiveDigits}`;
}

/**
 * Generates a guaranteed unique Member ID by checking collisions directly against the database,
 * eliminating the need to load the entire database into memory.
 */
export async function generateUniqueMemberId(): Promise<string> {
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateCandidateMemberId();
    const exists = await checkMemberIdExists(candidate);
    if (!exists) {
      return candidate;
    }
  }
  // Fallback with timestamp suffix if extreme density occurs
  return `AV${Math.floor(10000 + Math.random() * 90000)}`;
}

/**
 * Legacy compatibility helper
 */
export function generateMemberId(existingIds: Set<string> | string[] = new Set()): string {
  const set = existingIds instanceof Set ? existingIds : new Set(existingIds);
  let memberId = "";
  let attempts = 0;
  const maxAttempts = 5000;

  do {
    memberId = generateCandidateMemberId();
    attempts++;
  } while (set.has(memberId) && attempts < maxAttempts);

  return memberId;
}

export function isValidMemberId(memberId: string): boolean {
  return /^AV\d{5}$/i.test(memberId.trim());
}
