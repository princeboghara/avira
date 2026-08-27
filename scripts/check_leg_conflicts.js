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

const parentMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const [memberId, parentId, position, name, sponsorId] = parseCSVLine(lines[i]);
  if (!parentMap.has(parentId)) parentMap.set(parentId, []);
  parentMap.get(parentId).push({ memberId, position: position.toUpperCase(), name });
}

let conflicts = 0;
for (const [parentId, children] of parentMap.entries()) {
  const lefts = children.filter(c => c.position === 'LEFT');
  const rights = children.filter(c => c.position === 'RIGHT');
  if (lefts.length > 1 || rights.length > 1) {
    conflicts++;
    console.log(`Parent ${parentId} has multiple children on same leg! Left: ${lefts.length}, Right: ${rights.length}`);
    if (conflicts <= 10) {
      console.log('Children:', children);
    }
  }
}
console.log('Total parent leg conflicts:', conflicts);
