// Quick inspector to see all 10 rows on current page
(function() {
    const table = document.querySelector('table');
    const rows = Array.from(table.querySelectorAll('tbody tr')).length > 0
        ? Array.from(table.querySelectorAll('tbody tr'))
        : Array.from(table.querySelectorAll('tr')).filter(r => r.querySelectorAll('td').length >= 4);
    
    console.log(`Current page has ${rows.length} total rows:`);
    rows.forEach((r, idx) => {
        const cells = Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim());
        const link = r.querySelector('a')?.href || 'NO_LINK';
        console.log(`Row ${idx + 1}: cells count = ${cells.length} | SrNo: ${cells[0]} | OrderNo: ${cells[2]} | Member: ${cells[4]} | Link: ${link}`);
    });
})();
