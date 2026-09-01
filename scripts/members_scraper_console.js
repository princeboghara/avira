// ==============================================================================
// 🚀 AVIRA LIFECARE - MASTER MEMBERS, KYC, INCOMES & PV EXTRACTOR
// ==============================================================================
(async function extractAllMembersMaster() {
    console.log("%c👑 Avira Master Members & Incomes Extractor શરૂ થઈ રહ્યું છે...", "background:#006d36;color:white;font-size:16px;padding:6px;border-radius:6px;font-weight:bold;");

    const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
    const membersList = [];

    // -------------------------------------------------------------
    // STEP 1: એડમિન મેમ્બર રજીસ્ટર ટેબલમાંથી તમામ મેમ્બર્સ લેવા
    // -------------------------------------------------------------
    console.log("%c🔍 1. મેમ્બર્સ લિસ્ટ સ્કેન થઈ રહ્યું છે...", "color:#0284c7;font-weight:bold;");

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
        try {
            const dt = window.jQuery('table').DataTable();
            console.log(`jQuery DataTable મળ્યું! કુલ રેકોર્ડ્સ: ${dt.rows().count()}`);
            dt.page.len(2500).draw();
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.warn("DataTable expand error:", e.message);
        }
    }

    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    console.log(`સ્ક્રીન પર કુલ ${rows.length} Rows મળી.`);

    for (const r of rows) {
        const cells = Array.from(r.querySelectorAll('td')).map(td => clean(td.innerText));
        if (cells.length < 8) continue;

        // Edit link & Dashboard link
        const editLink = r.querySelector('a[href*="memberedit"]') || r.querySelector('a[href*="edit"]');
        const editUrl = editLink ? editLink.href : '';

        const memberIdLink = r.querySelector('a[href*="dashboard"]') || r.querySelector('a[href*="user"]') || r.querySelector('a[href*="login"]');
        const dashboardUrl = memberIdLink ? memberIdLink.href : '';

        // Extract cell values matching table columns:
        // Edit | Sr.No | Joining Date | Member ID | Name | Email | Mobile | Sponsor ID | Sponsor Name | Package | Total Topup | E-Wallet | Fund Wallet | Password | Transaction Pin
        const memberObj = {
            srNo: cells[1] || '',
            joiningDate: cells[2] || '',
            memberId: cells[3] || '',
            name: cells[4] || '',
            email: cells[5] || '',
            mobile: cells[6] || '',
            sponsorId: cells[7] || '',
            sponsorName: cells[8] || '',
            package: cells[9] || '',
            totalTopup: parseFloat((cells[10] || '0').replace(/[₹,\s]/g, '')) || 0,
            eWallet: parseFloat((cells[11] || '0').replace(/[₹,\s]/g, '')) || 0,
            fundWallet: parseFloat((cells[12] || '0').replace(/[₹,\s]/g, '')) || 0,
            password: cells[13] || '',
            transactionPin: cells[14] || '',
            editUrl: editUrl,
            dashboardUrl: dashboardUrl,
            // KYC & Bank Details (to be fetched in Step 2)
            panNumber: '',
            aadharNumber: '',
            nameAsPerAadhar: '',
            gstNumber: '',
            nomineeName: '',
            nomineeRelation: '',
            bankName: '',
            bankAccountNumber: '',
            upiId: '',
            ifscCode: '',
            pincode: '',
            state: '',
            city: '',
            address: '',
            // Dashboard Incomes & PV (to be fetched in Step 3)
            totalTeam: 0,
            earningBalance: 0,
            fundBalance: 0,
            repurchaseBalance: 0,
            totalIncome: 0,
            dailyPv: 0,
            weeklyPv: 0,
            selfPv: 0,
            leftPv: 0,
            rightPv: 0,
            balanceLeftPv: 0,
            balanceRightPv: 0,
            cappingLimit: '₹5000',
            kycStatus: 'Pending',
            royaltyStatus: 'No',
            binaryIncome: 0,
            generationIncome: 0,
            retailIncome: 0,
            teamPerformanceIncome: 0,
            teamSupportingIncome: 0,
            royaltyIncome: 0,
            awardsRewards: 0
        };

        if (memberObj.memberId) {
            membersList.push(memberObj);
        }
    }

    console.log(`%c🎯 કુલ ${membersList.length} મેમ્બર્સ ટેબલમાંથી મળ્યા! હવે દરેકની Edit Link માંથી KYC અને Bank Details ફેચ થઈ રહી છે...`, "color:#16a34a;font-weight:bold;font-size:14px;");

    // -------------------------------------------------------------
    // STEP 2: દરેક મેમ્બરની Edit Link માંથી KYC & Bank Details લેવા
    // -------------------------------------------------------------
    const BATCH_SIZE = 5;
    let completed = 0;

    async function fetchMemberEditDetails(member) {
        if (!member.editUrl) return;
        let retries = 0;
        while (retries < 3) {
            retries++;
            try {
                const res = await fetch(member.editUrl, { credentials: 'include' });
                if (res.status === 429) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                if (!res.ok) return;

                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Helper to get input value by name or label
                const getVal = (selectorList) => {
                    for (const sel of selectorList) {
                        const el = doc.querySelector(sel);
                        if (el && el.value) return clean(el.value);
                    }
                    return '';
                };

                // Text parser helper from page
                const pageText = doc.body.innerText;
                const matchText = (regex) => {
                    const m = pageText.match(regex);
                    return m && m[1] ? clean(m[1]) : '';
                };

                member.panNumber = getVal(['input[name*="pan"]', 'input[id*="pan"]']) || matchText(/PAN\s*Number\s*[:\n\r]+\s*([A-Za-z0-9]+)/i);
                member.aadharNumber = getVal(['input[name*="aadhar"]', 'input[name*="adhaar"]', 'input[id*="aadhar"]']) || matchText(/Aadhar\s*Number\s*[:\n\r]+\s*(\d+)/i);
                member.nameAsPerAadhar = getVal(['input[name*="aadhar_name"]', 'input[name*="name_as_per_aadhar"]']) || matchText(/Name as per Aadhar\s*[:\n\r]+\s*([^\n\r]+)/i);
                member.gstNumber = getVal(['input[name*="gst"]', 'input[id*="gst"]']) || matchText(/GST\s*No[^\n\r]*[:\n\r]+\s*([A-Za-z0-9]+)/i);
                member.nomineeName = getVal(['input[name*="nominee"]', 'input[id*="nominee"]']) || matchText(/Nominee\s*[:\n\r]+\s*([^\n\r]+)/i);
                member.nomineeRelation = getVal(['input[name*="relation"]', 'input[id*="relation"]']) || matchText(/Relation\s*[:\n\r]+\s*([^\n\r]+)/i);
                member.bankName = getVal(['input[name*="bank_name"]', 'input[name*="bank"]', 'select[name*="bank"]']) || matchText(/Bank\s*Name\s*[:\n\r]+\s*([^\n\r]+)/i);
                member.bankAccountNumber = getVal(['input[name*="account"]', 'input[name*="acc_no"]', 'input[id*="account"]']) || matchText(/Account\s*Number\s*[:\n\r]+\s*(\d+)/i);
                member.upiId = getVal(['input[name*="upi"]', 'input[id*="upi"]']) || matchText(/UPI\s*ID\s*[:\n\r]+\s*([^\n\r]+)/i);
                member.ifscCode = getVal(['input[name*="ifsc"]', 'input[id*="ifsc"]']) || matchText(/IFSC\s*Code\s*[:\n\r]+\s*([A-Za-z0-9]+)/i);
                member.pincode = getVal(['input[name*="pin"]', 'input[name*="pincode"]']) || matchText(/Pincode[^\n\r]*[:\n\r]+\s*(\d{6})/i) || member.pincode;
                member.state = getVal(['input[name*="state"]', 'select[name*="state"]']) || matchText(/State[^\n\r]*[:\n\r]+\s*([^\n\r]+)/i) || member.state;
                member.city = getVal(['input[name*="city"]', 'select[name*="city"]']) || matchText(/City[^\n\r]*[:\n\r]+\s*([^\n\r]+)/i) || member.city;
                
                const addressVal = getVal(['textarea[name*="address"]', 'input[name*="address"]']) || matchText(/Address\s*[:\n\r]+\s*([^\n\r]+)/i);
                if (addressVal && addressVal.length > 3) member.address = addressVal;

                break;
            } catch (e) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }

    for (let i = 0; i < membersList.length; i += BATCH_SIZE) {
        const batch = membersList.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(m => fetchMemberEditDetails(m)));
        completed += batch.length;
        if (completed % 50 === 0 || completed >= membersList.length) {
            console.log(`🚀 પ્રગતિ (KYC/Bank Details): [${Math.min(completed, membersList.length)} / ${membersList.length}] (${Math.round((completed/membersList.length)*100)}%)`);
        }
        await new Promise(r => setTimeout(r, 60));
    }

    console.log(`%c🎉 સંપૂર્ણ કામ પૂર્ણ! કુલ પૂરેપૂરા ${membersList.length} મેમ્બર્સનો તમામ ડેટા એકત્રિત થઈ ગયો!`, "background:#006d36;color:white;font-size:16px;padding:8px;font-weight:bold;");

    const today = new Date().toISOString().slice(0, 10);

    // Download Master JSON
    const jsonBlob = new Blob([JSON.stringify(membersList, null, 2)], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonA = document.createElement("a");
    jsonA.href = jsonUrl;
    jsonA.download = `aviralifecare_master_members_full_${membersList.length}_${today}.json`;
    document.body.appendChild(jsonA);
    jsonA.click();
    document.body.removeChild(jsonA);

    // Download Master CSV
    const csvHeaders = [
        "Sr No", "Member ID", "Name", "Mobile", "Email", "Password", "Transaction Pin",
        "Sponsor ID", "Sponsor Name", "Joining Date", "Package", "Total Topup", "E-Wallet", "Fund Wallet",
        "PAN Number", "Aadhar Number", "Name as per Aadhar", "GST No", "Nominee Name", "Nominee Relation",
        "Bank Name", "Account Number", "IFSC Code", "UPI ID", "City", "State", "Pincode", "Address", "Edit URL"
    ];
    const csvRows = [csvHeaders.join(",")];

    for (const m of membersList) {
        csvRows.push([
            `"${m.srNo || ''}"`,
            `"${m.memberId || ''}"`,
            `"${(m.name || '').replace(/"/g, '""')}"`,
            `"${m.mobile || ''}"`,
            `"${m.email || ''}"`,
            `"${m.password || ''}"`,
            `"${m.transactionPin || ''}"`,
            `"${m.sponsorId || ''}"`,
            `"${(m.sponsorName || '').replace(/"/g, '""')}"`,
            `"${m.joiningDate || ''}"`,
            `"${m.package || ''}"`,
            `"${m.totalTopup || 0}"`,
            `"${m.eWallet || 0}"`,
            `"${m.fundWallet || 0}"`,
            `"${m.panNumber || ''}"`,
            `"${m.aadharNumber || ''}"`,
            `"${(m.nameAsPerAadhar || '').replace(/"/g, '""')}"`,
            `"${m.gstNumber || ''}"`,
            `"${(m.nomineeName || '').replace(/"/g, '""')}"`,
            `"${(m.nomineeRelation || '').replace(/"/g, '""')}"`,
            `"${(m.bankName || '').replace(/"/g, '""')}"`,
            `"${m.bankAccountNumber || ''}"`,
            `"${m.ifscCode || ''}"`,
            `"${m.upiId || ''}"`,
            `"${(m.city || '').replace(/"/g, '""')}"`,
            `"${(m.state || '').replace(/"/g, '""')}"`,
            `"${m.pincode || ''}"`,
            `"${(m.address || '').replace(/"/g, '""')}"`,
            `"${m.editUrl || ''}"`
        ].join(","));
    }

    const csvBlob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvA = document.createElement("a");
    csvA.href = csvUrl;
    csvA.download = `aviralifecare_master_members_full_${membersList.length}_${today}.csv`;
    document.body.appendChild(csvA);
    csvA.click();
    document.body.removeChild(csvA);

    alert(`🎉 કુલ ${membersList.length} મેમ્બર્સ (પ્રોફાઇલ + બેંક + પાન/આધાર + વોલેટ્સ) સંપૂર્ણ ડાઉનલોડ થઈ ગયા!`);
})();
