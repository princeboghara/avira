// Script to run on https://aviralifecare.com/user/shop
(function() {
    console.log("%c🛒 Avira Shop Products Scraper શરૂ થઈ રહ્યું છે...", "background:#006d36;color:#fff;font-size:16px;padding:6px;border-radius:6px;");

    const products = [];
    
    // 1. Try finding all product cards on the shop page
    const cards = Array.from(document.querySelectorAll('.card, .product-card, .col-md-3, .col-md-4, .col-lg-3, .col-sm-6, .shop-item, .item, .single-product')).filter(c => {
        const text = c.innerText.toLowerCase();
        return text.includes('pv') || text.includes('₹') || text.includes('rs') || text.includes('price') || text.includes('cart') || text.includes('buy');
    });

    console.log(`Found ${cards.length} potential product cards.`);

    function cleanText(txt) {
        return (txt || '').replace(/\s+/g, ' ').trim();
    }

    if (cards.length > 0) {
        for (const c of cards) {
            const img = c.querySelector('img');
            const imgSrc = img ? img.src : '';
            
            // Name
            const nameEl = c.querySelector('h2, h3, h4, h5, h6, .product-title, .title, strong, b, a[href*="product"]');
            const name = nameEl ? cleanText(nameEl.innerText) : '';
            if (!name || name.length < 2) continue;

            // Full text to find Price and PV
            const allText = c.innerText;

            // Price / MRP
            const priceMatch = allText.match(/₹?\s*([\d,]+(?:\.\d+)?)\s*(?:RS|₹|\/-)?/i);
            const pvMatch = allText.match(/(\d+(?:\.\d+)?)\s*PV/i);
            
            // Net volume / description
            const descEl = c.querySelector('p, .description, .desc, small');
            const desc = descEl ? cleanText(descEl.innerText) : '';

            products.push({
                name: name,
                imageUrl: imgSrc,
                mrp: priceMatch ? priceMatch[1].replace(/,/g, '') : '',
                pv: pvMatch ? pvMatch[1] : '',
                description: desc,
                rawCardText: cleanText(allText)
            });
        }
    }

    // Fallback: If no cards found, check all table rows or list items
    if (products.length === 0) {
        const rows = Array.from(document.querySelectorAll('tr, .list-group-item'));
        for (const r of rows) {
            const text = cleanText(r.innerText);
            if (text.toLowerCase().includes('pv') && (text.includes('₹') || text.includes('rs') || text.includes('0'))) {
                const img = r.querySelector('img');
                products.push({
                    name: text.split('\n')[0] || text,
                    imageUrl: img ? img.src : '',
                    rawCardText: text
                });
            }
        }
    }

    console.log(`🎯 Extracted ${products.length} products!`, products);

    // Download JSON
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avira_shop_products_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`🎉 ${products.length} પ્રોડક્ટ્સનો ડેટા એક્સટ્રેક્ટ થઈ ગયો અને JSON ફાઇલ ડાઉનલોડ થઈ ગઈ!`);
})();
