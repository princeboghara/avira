const fs = require('fs');

const raw = fs.readFileSync('D:\\aviracare\\avira\\scripts\\binary_tree.csv', 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

const memberMap = new Map();
for (let i = 1; i < lines.length; i++) {
  const parts = parseCSVLine(lines[i]);
  const memberId = parts[0];
  const parentId = parts[1];
  const position = parts[2];
  const name = parts[3];
  const sponsorId = parts[4] || 'AV0001';
  const activationDate = parts[5] || '-';
  const packageAmount = parseFloat(parts[6]) || 0;

  if (!memberId) continue;
  if (!memberMap.has(memberId)) {
    memberMap.set(memberId, {
      memberId,
      parentId,
      position: position.toUpperCase(),
      name,
      sponsorId: sponsorId.toUpperCase(),
      activationDate,
      packageAmount,
      dbId: memberId === 'AV0001' ? 'usr_av00001_root' : `usr_${memberId.toLowerCase()}`,
    });
  }
}

let nullParentCount = 0;
let validParentCount = 0;
for (const m of memberMap.values()) {
  const parentDbId = (m.parentId && m.parentId !== 'ROOT' && memberMap.has(m.parentId)) 
    ? memberMap.get(m.parentId).dbId 
    : null;
  if (parentDbId === null) {
    if (m.memberId !== 'AV0001') {
      nullParentCount++;
      if (nullParentCount <= 5) {
        console.log(`Missing parent for ${m.memberId}: parentId='${m.parentId}', exists in map: ${memberMap.has(m.parentId)}`);
      }
    }
  } else {
    validParentCount++;
  }
}

console.log(`Total valid parents: ${validParentCount}, null parents (excluding AV0001): ${nullParentCount}`);
