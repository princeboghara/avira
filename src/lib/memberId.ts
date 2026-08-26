/**
 * Generates a unique MLM Member ID in the format "AV" + 4 random digits (e.g. AV1001 to AV9999)
 */
export function generateMemberId(existingIds: Set<string> | string[] = new Set()): string {
  const set = existingIds instanceof Set ? existingIds : new Set(existingIds);
  let memberId = "";
  let attempts = 0;
  const maxAttempts = 5000;

  do {
    // Generate 4 random digits between 1000 and 9999
    const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
    memberId = `AV${randomFourDigits}`;
    attempts++;
  } while (set.has(memberId) && attempts < maxAttempts);

  return memberId;
}

export function isValidMemberId(memberId: string): boolean {
  return /^AV\d{4}$/.test(memberId.toUpperCase());
}
