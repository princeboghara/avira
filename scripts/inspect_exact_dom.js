// ==============================================================================
// 🔍 Quick DOM Inspector for Orders List Table
// ==============================================================================
(function() {
    console.log("%c🔍 Orders Table Inspector...", "background:#1e293b;color:#38bdf8;font-size:14px;padding:4px;");

    // 1. Check all links on current page
    const allLinks = Array.from(document.querySelectorAll('a'));
    const orderRelatedLinks = allLinks.filter(a => a.href && (a.href.includes('order') || a.href.includes('view') || a.href.includes('admin')));
    console.log(`Total links on page: ${allLinks.length}, Order/View related links: ${orderRelatedLinks.length}`);

    // 2. Check all tables and rows
    const tables = document.querySelectorAll('table');
    console.log(`Tables found: ${tables.length}`);

    tables.forEach((tbl, tIdx) => {
        const rows = tbl.querySelectorAll('tr');
        console.log(`Table ${tIdx + 1}: Total <tr> rows = ${rows.length}`);
        rows.forEach((r, rIdx) => {
            const tds = r.querySelectorAll('td, th');
            const linksInRow = Array.from(r.querySelectorAll('a')).map(a => a.href);
            const buttonsInRow = Array.from(r.querySelectorAll('button')).map(b => b.outerHTML);
            console.log(`  Row ${rIdx + 1} (cells: ${tds.length}): [SrNo: ${tds[0]?.innerText.trim()}] [Order: ${tds[2]?.innerText.trim()}] [Member: ${tds[4]?.innerText.trim()}]`);
            console.log(`      Links:`, linksInRow);
            if (buttonsInRow.length > 0) console.log(`      Buttons:`, buttonsInRow);
        });
    });
})();
