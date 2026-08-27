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
  const parts = parseCSVLine(lines[i]);
  const memberId = parts[0];
  const parentId = parts[1];
  const position = parts[2];
  const name = parts[3];
  const sponsorId = parts[4];
  memberMap.set(memberId, { memberId, parentId, position, name, sponsorId });
}

console.log("memberMap size:", memberMap.size);

const testMember = memberMap.get('AV70407');
console.log("AV70407:", testMember);
console.log("Parent AV23009 exists in memberMap?", memberMap.has(testMember.parentId));
console.log("AV23009 data:", memberMap.get('AV23009'));
