/**
 * Generates a unique MLM Member ID in the format "AV" + 5 random digits (e.g. AV10001 to AV99999)
 */
export function generateMemberId(existingIds: Set<string> | string[] = new Set()): string {
  const set = existingIds instanceof Set ? existingIds : new Set(existingIds);
  let memberId = "";
  let attempts = 0;
  const maxAttempts = 5000;

  do {
    // Generate 5 random digits between 10000 and 99999
    const randomFiveDigits = Math.floor(10000 + Math.random() * 90000);
    memberId = `AV${randomFiveDigits}`;
    attempts++;
  } while (set.has(memberId) && attempts < maxAttempts);

  return memberId;
}

export function isValidMemberId(memberId: string): boolean {
  return /^AV\d{5}$/.test(memberId.toUpperCase());
}
