// ==============================================================================
// 🔍 Quick Diagnostic Script to Run in Console
// ==============================================================================
(function() {
    console.log("%c🔍 DIAGNOSTIC RESULTS:", "background:#0284c7;color:white;font-size:14px;padding:4px;");

    // 1. Check screen rows
    const screenRows = Array.from(document.querySelectorAll('table tbody tr'));
    console.log(`1. Total rows currently on screen: ${screenRows.length}`);
    screenRows.forEach((r, idx) => {
        const c = Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim());
        console.log(`   Row ${idx + 1}: SrNo=${c[0]} | Order=${c[2]} | Member=${c[4]} | Name=${c[5]}`);
    });

    // 2. Check if jQuery DataTables exists
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
        try {
            const dt = window.jQuery('table').DataTable();
            console.log(`2. jQuery DataTable found! Total records in DataTable:`, dt.rows().count());
        } catch (e) {
            console.log(`2. DataTable error:`, e.message);
        }
    } else {
        console.log(`2. jQuery DataTable is NOT used (pure server pagination).`);
    }

    // 3. Test fetch with credentials
    fetch(window.location.href, { credentials: 'include' })
        .then(r => r.text())
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const fetchRows = Array.from(doc.querySelectorAll('table tbody tr'));
            console.log(`3. Rows in HTML returned by fetch(): ${fetchRows.length}`);
            fetchRows.forEach((r, idx) => {
                const c = Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim());
                console.log(`   Fetch Row ${idx + 1}: SrNo=${c[0]} | Order=${c[2]} | Member=${c[4]}`);
            });
        });
})();
