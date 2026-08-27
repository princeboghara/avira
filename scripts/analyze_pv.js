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
for (let i = 1; i < lines.length; i++) {
  const [memberId, parentId, position, name, sponsorId, activationDate, packageAmount] = parseCSVLine(lines[i]);
  if (!memberId) continue;
  memberMap.set(memberId, {
    memberId, parentId, position: position.toUpperCase(),
    name, sponsorId, activationDate,
    pkg: parseFloat(packageAmount) || 0,
    isActive: activationDate && activationDate !== '-',
    leftChildId: null, rightChildId: null,
  });
}

for (const m of memberMap.values()) {
  if (m.parentId && m.parentId !== 'ROOT' && memberMap.has(m.parentId)) {
    const p = memberMap.get(m.parentId);
    if (m.position === 'LEFT') p.leftChildId = m.memberId;
    else if (m.position === 'RIGHT') p.rightChildId = m.memberId;
  }
}

function sumSubtree(mId, onlyActive = false) {
  if (!mId || !memberMap.has(mId)) return 0;
  const m = memberMap.get(mId);
  const left = sumSubtree(m.leftChildId, onlyActive);
  const right = sumSubtree(m.rightChildId, onlyActive);
  const myVal = onlyActive ? (m.isActive ? m.pkg : 0) : m.pkg;
  return myVal + left + right;
}

const root = memberMap.get('AV0001');
console.log("All packages (Active + Inactive):");
console.log("Left subtree sum:", sumSubtree(root.leftChildId, false));
console.log("Right subtree sum:", sumSubtree(root.rightChildId, false));

console.log("\nOnly Active members (activationDate !== '-'):");
console.log("Left subtree sum:", sumSubtree(root.leftChildId, true));
console.log("Right subtree sum:", sumSubtree(root.rightChildId, true));
