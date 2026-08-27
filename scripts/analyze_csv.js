const fs = require('fs');

const raw = fs.readFileSync('D:\\aviracare\\avira\\scripts\\binary_tree.csv', 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
console.log('Total lines in binary_tree.csv:', lines.length);

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

const members = new Map();
const parentMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const p = parseCSVLine(lines[i]);
  const [memberId, parentId, position, name, sponsorId, date, pkg] = p;
  if (!memberId) continue;
  members.set(memberId, { memberId, parentId, position, name, sponsorId, date, pkg });
  
  if (!parentMap.has(parentId)) parentMap.set(parentId, []);
  parentMap.get(parentId).push({ memberId, position, name });
}

console.log('Total unique members:', members.size);
console.log('Root children under ROOT:', parentMap.get('ROOT'));
console.log('Immediate children under AV0001:', parentMap.get('AV0001'));

// Count reachable downlines from AV0001
function countTree(id) {
  const children = parentMap.get(id) || [];
  let count = children.length;
  for (const c of children) {
    count += countTree(c.memberId);
  }
  return count;
}

const reachable = countTree('AV0001');
console.log('Total reachable members starting from AV0001:', reachable);

// Check if any member has a parent not in the tree or orphaned
let orphans = 0;
for (const [mId, m] of members.entries()) {
  if (mId !== 'AV0001' && m.parentId !== 'ROOT' && !members.has(m.parentId)) {
    orphans++;
    console.log(`Orphan: ${mId} has parent ${m.parentId} which is NOT in CSV!`);
  }
}
console.log('Total orphans:', orphans);
