require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Source directories
const DIR_MAIN = 'D:\\Avira Products\\AVIRA PRODUCT';
const DIR_PNG = 'D:\\Avira Products\\PNG';
const DIR_OFFER = 'D:\\Avira Products\\offer';

// Exact mapping dictionary for all 44 products
const PRODUCT_MAPPINGS = [
  // Combos
  { id: 'prod_avira-12-products-combo-4999', file: path.join(DIR_OFFER, 'offer 4999.jpeg') },
  { id: 'prod_avira-multi-vitamin-combo-4500', file: path.join(DIR_OFFER, '4500 COMBO.jpeg') },

  // Hair Care
  { id: 'prod_avira-24-herbs-shampoo', file: path.join(DIR_PNG, '24 HERBS SHAMPOO.png'), fallback: path.join(DIR_MAIN, '24 HERBS SHAMPOO.jpeg') },
  { id: 'prod_avira-34-herb-hair-oil', file: path.join(DIR_PNG, 'Regrowth Hair Oil.png'), fallback: path.join(DIR_MAIN, 'Regrowth Hair Oil.png') },
  { id: 'prod_avira-onion-hair-oil', file: path.join(DIR_PNG, 'ONION HAIR OIL.png'), fallback: path.join(DIR_MAIN, 'ONION HAIR OIL.jpeg') },
  { id: 'prod_avira-milky-shampoo', file: path.join(DIR_PNG, 'MILKY SHAMPOO.png'), fallback: path.join(DIR_MAIN, 'MILKY SHAMPOO.jpeg') },
  { id: 'prod_avira-tea-tree-shampoo', file: path.join(DIR_PNG, 'TEA TREE SHAMPOO.png'), fallback: path.join(DIR_MAIN, 'TEA TREE SHAMPOO.jpeg') },
  { id: 'prod_avira-black-mahendi', file: path.join(DIR_PNG, 'BLACK MAHENDI.png'), fallback: path.join(DIR_MAIN, 'BLACK MAHENDI.jpeg') },
  { id: 'prod_avira-brown-mahendi', file: path.join(DIR_PNG, 'BROWN MAHENDI.png'), fallback: path.join(DIR_MAIN, 'BROWN MAHENDI.jpeg') },

  // Skincare & Personal Care
  { id: 'prod_avira-5-in-1-fach-wash', file: path.join(DIR_PNG, '5 IN1 FACEWASH.png'), fallback: path.join(DIR_MAIN, '5 IN1 FACEWASH.jpeg') },
  { id: 'prod_avira-niacinamide-face-wash', file: path.join(DIR_PNG, 'NIACINAMIDE SHAMPOO.png'), fallback: path.join(DIR_MAIN, 'NIACINAMIDE SHAMPOO.jpeg') },
  { id: 'prod_avira-face-cleanser', file: path.join(DIR_PNG, 'Salicylic Acid Face Cleanser.png'), fallback: path.join(DIR_MAIN, 'Salicylic Acid Face Cleanser.jpg') },
  { id: 'prod_avira-night-cream', file: path.join(DIR_PNG, 'NIGHT CREAM.png'), fallback: path.join(DIR_MAIN, 'NIGHT CREAM.jpeg') },
  { id: 'prod_avira-daily-moisturizing-body-wash', file: path.join(DIR_PNG, 'DAILY BODY WASH.png'), fallback: path.join(DIR_MAIN, 'DAILY BODY WASH.jpeg') },
  { id: 'prod_avira-neem-soap', file: path.join(DIR_PNG, 'NEEM SOAP.png'), fallback: path.join(DIR_MAIN, 'NEEM SOAP.jpeg') },
  { id: 'prod_avira-rose-soap', file: path.join(DIR_PNG, 'ROSE SOAP.png'), fallback: path.join(DIR_MAIN, 'ROSE SOAP.jpeg') },
  { id: 'prod_avira-lavender-soap', file: path.join(DIR_PNG, 'Lavender  Soap.png'), fallback: path.join(DIR_MAIN, 'Lavender  Soap.jpeg') },
  { id: 'prod_avira-sleepy-soap', file: path.join(DIR_PNG, 'SLEEPY SOAP.png'), fallback: path.join(DIR_MAIN, 'SLEEPY SOAP.jpeg') },
  { id: 'prod_avira-japanese-massage-cream', file: path.join(DIR_PNG, 'PAIN CREAM.png'), fallback: path.join(DIR_MAIN, 'PAIN CREAM.jpeg') },
  { id: 'prod_avira-herbal-body-wax-powder', file: path.join(DIR_PNG, 'BODY WAX POWDER.png'), fallback: path.join(DIR_MAIN, 'BODY WAX POWDER.jpeg') },

  // Oral & Women Care
  { id: 'prod_avira-neemadent-toothpaste', file: path.join(DIR_PNG, 'NEEMADENT PASTE.png'), fallback: path.join(DIR_MAIN, 'NEEMADENT PASTE.jpeg') },
  { id: 'prod_avira-sanitary-napkins', file: path.join(DIR_PNG, 'Sanitary Pad.png'), fallback: path.join(DIR_MAIN, 'Sanitary Pad.jpeg') },

  // Health & Wellness / Cellular Nutrition
  { id: 'prod_avira-choco-brain-powder', file: path.join(DIR_PNG, 'CHOCO  BRAIN POWDER.png'), fallback: path.join(DIR_MAIN, 'CHOCO  BRAIN POWDER.jpeg') },
  { id: 'prod_avira-de-addiction', file: path.join(DIR_PNG, 'DE-ADDICTION.png'), fallback: path.join(DIR_MAIN, 'DE-ADDICTION.jpeg') },
  { id: 'prod_avira-detox-capsules', file: path.join(DIR_PNG, 'Detox Capsule.png'), fallback: path.join(DIR_MAIN, 'Detox Capsule.jpeg') },
  { id: 'prod_avira-diabetic-powder', file: path.join(DIR_PNG, 'Diabetic Powder.png'), fallback: path.join(DIR_MAIN, 'Diabetic Powder.jpeg') },
  { id: 'prod_avira-faminor-juice', file: path.join(DIR_MAIN, 'FEMINOR JUICE.jpeg'), fallback: path.join(DIR_PNG, 'FEMINOR JUICE.png') },
  { id: 'prod_avira-fat-loss-capsules', file: path.join(DIR_PNG, 'Fatloss Capsule.png'), fallback: path.join(DIR_MAIN, 'Fatloss Capsule.jpeg') },
  { id: 'prod_avira-green-tea-tablet', file: path.join(DIR_PNG, 'Green Tea Tablet.png'), fallback: path.join(DIR_MAIN, 'Green Tea Tablet.jpeg') },
  { id: 'prod_avira-jeevan-amrut-drops', file: path.join(DIR_PNG, 'JEEVAN AMRUT DROPS.png'), fallback: path.join(DIR_MAIN, 'JEEVAN AMRUT DROPS.jpeg') },
  { id: 'prod_avira-maxx-power-capsule', file: path.join(DIR_PNG, 'MAXX POWER CAPSULE.png'), fallback: path.join(DIR_MAIN, 'MAXX POWER CAPSULE.jpeg') },
  { id: 'prod_avira-multi-vitamin-capsule', file: path.join(DIR_PNG, 'MULTI VITAMIN CAPSULE.png'), fallback: path.join(DIR_MAIN, 'MULTI VITAMIN CAPSULE.jpeg') },
  { id: 'prod_avira-pineapple-energy-booster', file: path.join(DIR_PNG, 'PINEAPPLE ENERGY BOOSTER.png'), fallback: path.join(DIR_MAIN, 'PINEAPPLE ENERGY BOOSTER.jpeg') },
  { id: 'prod_avira-protein-powder', file: path.join(DIR_PNG, 'VANILLA PROTIN POWDER.png'), fallback: path.join(DIR_MAIN, 'VANILLA PROTIN POWDER.jpeg') },
  { id: 'prod_avira-sea-buckthorn-juice', file: path.join(DIR_MAIN, 'SEA BUCKTHORN JUICE.jpeg'), fallback: path.join(DIR_PNG, 'SEA BUCKTHORN JUICE.png') },
  { id: 'prod_avira-women-special-powder', file: path.join(DIR_PNG, 'WOMEN SPECIAL.png'), fallback: path.join(DIR_MAIN, 'WOMEN SPECIAL.jpeg') },
  { id: 'prod_avira-premium-tea-leaves', file: path.join(DIR_PNG, 'PREMIUM TEA LEAVES.png'), fallback: path.join(DIR_MAIN, 'PREMIUM TEA LEAVES.jpeg') },

  // Agriculture & Plant Care
  { id: 'prod_avira-82st-100-ml', file: path.join(DIR_MAIN, 'avira 82st.png') },
  { id: 'prod_avira-82st-250ml', file: path.join(DIR_MAIN, 'avira 82st.png') },
  { id: 'prod_avira-carbonx', file: path.join(DIR_PNG, 'AVIRA CARBONX.png'), fallback: path.join(DIR_MAIN, 'AVIRA CARBONX.jpeg') },
  { id: 'prod_avira-bhumi-sanjivani', file: path.join(DIR_MAIN, 'bhumi p mockup.png') },
  { id: 'prod_avira-bloom-100-ml', file: path.join(DIR_MAIN, 'bloom +.png') },
  { id: 'prod_avira-bloom-250-ml', file: path.join(DIR_MAIN, 'bloom +.png') },
  { id: 'prod_avira-plant-growth-promoter-250ml', file: path.join(DIR_MAIN, 'plant g.p.png') },
];

async function uploadSingle(item) {
  let sourcePath = item.file;
  if (!fs.existsSync(sourcePath) && item.fallback && fs.existsSync(item.fallback)) {
    sourcePath = item.fallback;
  }

  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️ File not found for ${item.id}: ${sourcePath}`);
    return false;
  }

  try {
    const publicId = item.id.replace(/^prod_/, '');
    const uploadRes = await cloudinary.uploader.upload(sourcePath, {
      folder: 'AVIRALIFECARE/products',
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
    });

    const secureUrl = uploadRes.secure_url;
    await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [secureUrl, item.id]);
    console.log(`✅ [${item.id}] -> ${secureUrl}`);
    return true;
  } catch (err) {
    console.error(`❌ [${item.id}] Error:`, err.message);
    return false;
  }
}

async function syncToCloudinary() {
  console.log('🚀 Starting Fast Parallel Cloudinary Upload for 44 Products...\n');

  const BATCH_SIZE = 6;
  let successCount = 0;

  for (let i = 0; i < PRODUCT_MAPPINGS.length; i += BATCH_SIZE) {
    const batch = PRODUCT_MAPPINGS.slice(i, i + BATCH_SIZE);
    console.log(`Uploading Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} items)...`);
    const results = await Promise.all(batch.map((item) => uploadSingle(item)));
    successCount += results.filter(Boolean).length;
  }

  console.log(`\n========================================`);
  console.log(`🎉 Cloudinary Upload Complete! Successfully updated ${successCount}/${PRODUCT_MAPPINGS.length} products.`);
  console.log(`========================================\n`);
}

syncToCloudinary()
  .catch((err) => console.error('Fatal sync error:', err))
  .finally(() => pool.end());
