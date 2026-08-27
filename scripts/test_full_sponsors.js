const fs = require('fs');

const raw = fs.readFileSync('D:\\aviracare\\avira\\scripts\\binary_tree.csv', 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  result.push(cur.trim());
  return result;
}

const memberMap = new Map();
let counter = 1;

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
  memberMap.set(memberId, {
    memberId,
    parentId,
    position: position.toUpperCase(),
    name,
    sponsorId: sponsorId.toUpperCase(),
    activationDate,
    packageAmount,
    index: counter++,
    leftChildId: null,
    rightChildId: null,
    dbId: memberId === 'AV0001' ? 'usr_av00001_root' : `usr_${memberId.toLowerCase()}`,
  });
}

// Build children and sponsor names
for (const m of memberMap.values()) {
  // Sponsor Name
  if (m.sponsorId === 'AV0001') {
    m.sponsorName = 'Avira LifeCare';
  } else if (memberMap.has(m.sponsorId)) {
    m.sponsorName = memberMap.get(m.sponsorId).name;
  } else {
    m.sponsorName = 'Avira LifeCare';
  }

  // Children
  if (m.parentId && m.parentId !== 'ROOT' && memberMap.has(m.parentId)) {
    const parent = memberMap.get(m.parentId);
    if (m.position === 'LEFT') parent.leftChildId = m.dbId;
    else if (m.position === 'RIGHT') parent.rightChildId = m.dbId;
  }
}

// Check sample sponsor names
console.log('Total members:', memberMap.size);
console.log('Sample Sponsor Names:');
const sampleIds = ['AV43341', 'AV72516', 'AV62928', 'AV94925', 'AV56270'];
for (const sId of sampleIds) {
  const m = memberMap.get(sId);
  console.log(`Member: ${m.memberId} (${m.name}) -> Sponsor: ${m.sponsorId} (${m.sponsorName})`);
}
