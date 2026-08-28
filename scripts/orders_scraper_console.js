// ==============================================================================
// 🚀 AVIRA LIFECARE - INSTANT 779 ORDERS EXTRACTOR (POWERED BY DATATABLE)
// ==============================================================================
(async function extractFromDataTable() {
    console.log("%c🎉 jQuery DataTable માં પૂરેપૂરા 779 ઓર્ડર્સ મળી ગયા!", "background:#006d36;color:white;font-size:16px;padding:6px;border-radius:6px;");

    const dt = window.jQuery('table').DataTable();
    const totalCount = dt.rows().count();
    console.log(`Total records in DataTable: ${totalCount}`);

    // Set page length to 1000 to render all 779 rows into DOM
    dt.page.len(1000).draw();
    await new Promise(r => setTimeout(r, 600));

    const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    console.log(`Total rows rendered on screen: ${rows.length}`);

    const ordersList = [];

    for (const r of rows) {
        const cells = Array.from(r.querySelectorAll('td')).map(td => clean(td.innerText));
        const viewLink = r.querySelector('a[href*="order-view"]') || r.querySelector('a');
        const viewUrl = viewLink ? viewLink.href : '';

        if (cells.length >= 8) {
            ordersList.push({
                srNo: cells[0] || '',
                orderedDate: cells[1] || '',
                orderNumber: cells[2] || '',
                billBy: cells[3] || '',
                memberId: cells[4] || '',
                memberName: cells[5] || '',
                memberEmail: cells[6] || '',
                totalPv: parseFloat((cells[7] || '0').replace(/,/g, '')) || 0,
                totalNetAmount: parseFloat((cells[8] || '0').replace(/[₹,\s]/g, '')) || 0,
                status: cells[9] || 'delivered',
                viewUrl: viewUrl,
                quantity: 1,
                shippingFullName: cells[5] || '',
                shippingEmail: cells[6] || '',
                shippingPhone: '',
                shippingAddress: '',
                shippingState: '',
                shippingPostCode: '',
                items: []
            });
        }
    }

    console.log(`%c🎯 ટેબલમાંથી પૂરેપૂરા ${ordersList.length} / 779 ઓર્ડર્સ આવી ગયા! હવે દરેકના Eye Icon માંથી Shipping & Items Details ફેચ થઈ રહી છે...`, "color:#16a34a;font-weight:bold;font-size:15px;");

    // Fetch Details in safe batches
    const BATCH_SIZE = 5;
    let completed = 0;

    async function fetchOrderViewDetails(orderObj) {
        if (!orderObj.viewUrl) return;
        let retries = 0;
        while (retries < 3) {
            retries++;
            try {
                const res = await fetch(orderObj.viewUrl, { credentials: 'include' });
                if (res.status === 429) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                if (!res.ok) return;

                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const pageText = doc.body.innerText;

                const qtyMatch = pageText.match(/Quantity\s*:\s*(\d+)/i);
                if (qtyMatch) orderObj.quantity = parseInt(qtyMatch[1], 10);

                const nameMatch = pageText.match(/Full Name\s*:\s*([^\n\r]+)/i);
                if (nameMatch && clean(nameMatch[1])) orderObj.shippingFullName = clean(nameMatch[1]);

                const emailMatch = pageText.match(/Email\s*:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
                if (emailMatch) orderObj.shippingEmail = clean(emailMatch[1]);

                const phoneMatch = pageText.match(/Phone No\s*:\s*([\d\s\-\+]+)/i);
                if (phoneMatch) orderObj.shippingPhone = clean(phoneMatch[1]);

                const addressMatch = pageText.match(/Address\s*:\s*([^\n\r]+)/i);
                if (addressMatch) orderObj.shippingAddress = clean(addressMatch[1]);

                const stateMatch = pageText.match(/State\s*:\s*([^\n\r]+)/i);
                if (stateMatch) orderObj.shippingState = clean(stateMatch[1]);

                const postCodeMatch = pageText.match(/Post Code\s*:\s*(\d{6})/i);
                if (postCodeMatch) orderObj.shippingPostCode = clean(postCodeMatch[1]);

                const items = [];
                const tables = Array.from(doc.querySelectorAll('table'));
                for (const table of tables) {
                    const rows = Array.from(table.querySelectorAll('tbody tr, tr'));
                    for (const row of rows) {
                        const cells = Array.from(row.querySelectorAll('td, th')).map(td => clean(td.innerText));
                        if (cells.length >= 6 && /^\d+$/.test(cells[0])) {
                            items.push({
                                sn: cells[0],
                                itemName: cells[1],
                                itemRate: cells[2],
                                quantity: cells[3],
                                amount: cells[4],
                                gstAmount: cells[5],
                                netAmount: cells[6] || cells[5]
                            });
                        }
                    }
                }
                orderObj.items = items;
                break;
            } catch (e) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }

    for (let i = 0; i < ordersList.length; i += BATCH_SIZE) {
        const batch = ordersList.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(ord => fetchOrderViewDetails(ord)));
        completed += batch.length;
        if (completed % 25 === 0 || completed >= ordersList.length) {
            console.log(`🚀 પ્રગતિ: [${Math.min(completed, ordersList.length)} / ${ordersList.length}] ઓર્ડર્સ સંપૂર્ણ ફેચ થયા (${Math.round((completed/ordersList.length)*100)}%)`);
        }
        await new Promise(r => setTimeout(r, 60));
    }

    console.log(`%c🎉 સંપૂર્ણ કામ પૂર્ણ! કુલ પૂરેપૂરા ${ordersList.length} ઓર્ડર્સ એકત્રિત થયા!`, "background:#006d36;color:white;font-size:16px;padding:8px;font-weight:bold;");

    const today = new Date().toISOString().slice(0, 10);

    // Download JSON
    const jsonBlob = new Blob([JSON.stringify(ordersList, null, 2)], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonA = document.createElement("a");
    jsonA.href = jsonUrl;
    jsonA.download = `aviralifecare_master_orders_${ordersList.length}_${today}.json`;
    document.body.appendChild(jsonA);
    jsonA.click();
    document.body.removeChild(jsonA);

    // Download Complete CSV
    const csvHeaders = [
        "Sr No.", "Ordered Date", "Order Number", "BillBy", "MemberID", "Name", "Email",
        "Total PV", "Total Net Amount", "Status", "Quantity", "Shipping Full Name", "Shipping Phone No",
        "Shipping Email", "Shipping Address", "Shipping State", "Shipping Post Code", "Items Summary", "Items Details JSON", "Order View URL"
    ];
    const csvRows = [csvHeaders.join(",")];

    for (const ord of ordersList) {
        const itemsSummary = (ord.items || []).map(it => `${it.itemName} (Qty: ${it.quantity}, Rate: ₹${it.itemRate}, Net: ₹${it.netAmount})`).join(" | ");
        csvRows.push([
            `"${ord.srNo || ''}"`,
            `"${ord.orderedDate || ''}"`,
            `"${ord.orderNumber || ''}"`,
            `"${ord.billBy || ''}"`,
            `"${ord.memberId || ''}"`,
            `"${(ord.memberName || '').replace(/"/g, '""')}"`,
            `"${ord.memberEmail || ''}"`,
            `"${ord.totalPv || 0}"`,
            `"${ord.totalNetAmount || 0}"`,
            `"${ord.status || ''}"`,
            `"${ord.quantity || 1}"`,
            `"${(ord.shippingFullName || '').replace(/"/g, '""')}"`,
            `"${ord.shippingPhone || ''}"`,
            `"${ord.shippingEmail || ''}"`,
            `"${(ord.shippingAddress || '').replace(/"/g, '""')}"`,
            `"${(ord.shippingState || '').replace(/"/g, '""')}"`,
            `"${ord.shippingPostCode || ''}"`,
            `"${itemsSummary.replace(/"/g, '""')}"`,
            `"${JSON.stringify(ord.items || []).replace(/"/g, '""')}"`,
            `"${ord.viewUrl || ''}"`
        ].join(","));
    }

    const csvBlob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvA = document.createElement("a");
    csvA.href = csvUrl;
    csvA.download = `aviralifecare_master_orders_${ordersList.length}_${today}.csv`;
    document.body.appendChild(csvA);
    csvA.click();
    document.body.removeChild(csvA);

    alert(`🎉 કુલ ${ordersList.length} ઓર્ડર્સ (ટેબલ ડેટા + Shipping + Items) સફળતાપૂર્વક ડાઉનલોડ થઈ ગયા!`);
})();
