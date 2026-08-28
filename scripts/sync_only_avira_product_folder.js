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

const DIR_AVIRA_PRODUCT = 'D:\\Avira Products\\AVIRA PRODUCT';

// ONLY from "D:\Avira Products\AVIRA PRODUCT" folder
const STRICT_MAPPINGS = [
  { id: 'prod_avira-24-herbs-shampoo', fileName: '24 HERBS SHAMPOO.jpeg' },
  { id: 'prod_avira-5-in-1-fach-wash', fileName: '5 IN1 FACEWASH.jpeg' },
  { id: 'prod_avira-82st-100-ml', fileName: 'avira 82st.png' },
  { id: 'prod_avira-82st-250ml', fileName: 'avira 82st.png' },
  { id: 'prod_avira-carbonx', fileName: 'AVIRA CARBONX.jpeg' },
  { id: 'prod_avira-bhumi-sanjivani', fileName: 'bhumi p mockup.png' },
  { id: 'prod_avira-black-mahendi', fileName: 'BLACK MAHENDI.jpeg' },
  { id: 'prod_avira-bloom-100-ml', fileName: 'bloom +.png' },
  { id: 'prod_avira-bloom-250-ml', fileName: 'bloom +.png' },
  { id: 'prod_avira-herbal-body-wax-powder', fileName: 'BODY WAX POWDER.jpeg' },
  { id: 'prod_avira-brown-mahendi', fileName: 'BROWN MAHENDI.jpeg' },
  { id: 'prod_avira-choco-brain-powder', fileName: 'CHOCO  BRAIN POWDER.jpeg' },
  { id: 'prod_avira-daily-moisturizing-body-wash', fileName: 'DAILY BODY WASH.jpeg' },
  { id: 'prod_avira-de-addiction', fileName: 'DE-ADDICTION.jpeg' },
  { id: 'prod_avira-detox-capsules', fileName: 'Detox Capsule.jpeg' },
  { id: 'prod_avira-diabetic-powder', fileName: 'Diabetic Powder.jpeg' },
  { id: 'prod_avira-fat-loss-capsules', fileName: 'Fatloss Capsule.jpeg' },
  { id: 'prod_avira-faminor-juice', fileName: 'FEMINOR JUICE.jpeg' },
  { id: 'prod_avira-green-tea-tablet', fileName: 'Green Tea Tablet.jpeg' },
  { id: 'prod_avira-jeevan-amrut-drops', fileName: 'JEEVAN AMRUT DROPS.jpeg' },
  { id: 'prod_avira-lavender-soap', fileName: 'Lavender  Soap.jpeg' },
  { id: 'prod_avira-maxx-power-capsule', fileName: 'MAXX POWER CAPSULE.jpeg' },
  { id: 'prod_avira-milky-shampoo', fileName: 'MILKY SHAMPOO.jpeg' },
  { id: 'prod_avira-multi-vitamin-capsule', fileName: 'MULTI VITAMIN CAPSULE.jpeg' },
  { id: 'prod_avira-neem-soap', fileName: 'NEEM SOAP.jpeg' },
  { id: 'prod_avira-neemadent-toothpaste', fileName: 'NEEMADENT PASTE.jpeg' },
  { id: 'prod_avira-niacinamide-face-wash', fileName: 'NIACINAMIDE SHAMPOO.jpeg' },
  { id: 'prod_avira-night-cream', fileName: 'NIGHT CREAM.jpeg' },
  { id: 'prod_avira-onion-hair-oil', fileName: 'ONION HAIR OIL.jpeg' },
  { id: 'prod_avira-japanese-massage-cream', fileName: 'PAIN CREAM.jpeg' },
  { id: 'prod_avira-pineapple-energy-booster', fileName: 'PINEAPPLE ENERGY BOOSTER.jpeg' },
  { id: 'prod_avira-plant-growth-promoter-250ml', fileName: 'plant g.p.png' },
  { id: 'prod_avira-premium-tea-leaves', fileName: 'PREMIUM TEA LEAVES.jpeg' },
  { id: 'prod_avira-34-herb-hair-oil', fileName: 'Regrowth Hair Oil.png' },
  { id: 'prod_avira-rose-soap', fileName: 'ROSE SOAP.jpeg' },
  { id: 'prod_avira-face-cleanser', fileName: 'Salicylic Acid Face Cleanser.jpg' },
  { id: 'prod_avira-sanitary-napkins', fileName: 'Sanitary Pad.jpeg' },
  { id: 'prod_avira-sea-buckthorn-juice', fileName: 'SEA BUCKTHORN JUICE.jpeg' },
  { id: 'prod_avira-sleepy-soap', fileName: 'SLEEPY SOAP.jpeg' },
  { id: 'prod_avira-tea-tree-shampoo', fileName: 'TEA TREE SHAMPOO.jpeg' },
  { id: 'prod_avira-protein-powder', fileName: 'VANILLA PROTIN POWDER.jpeg' },
  { id: 'prod_avira-women-special-powder', fileName: 'WOMEN SPECIAL.jpeg' },
];

async function syncStrictAviraProductFolder() {
  console.log('🚀 Resetting all images and syncing STRICTLY from D:\\Avira Products\\AVIRA PRODUCT...\n');

  // 1. Reset all product images in DB to empty
  await pool.query('UPDATE products SET image_url = \'\'');
  console.log('🧹 Reset all product image URLs in database to empty.');

  const BATCH_SIZE = 6;
  let successCount = 0;

  for (let i = 0; i < STRICT_MAPPINGS.length; i += BATCH_SIZE) {
    const batch = STRICT_MAPPINGS.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (item) => {
        const fullPath = path.join(DIR_AVIRA_PRODUCT, item.fileName);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️ File not found: ${fullPath}`);
          return;
        }

        try {
          const publicId = item.id.replace(/^prod_/, '');
          const uploadRes = await cloudinary.uploader.upload(fullPath, {
            folder: 'AVIRALIFECARE/products',
            public_id: publicId,
            overwrite: true,
            resource_type: 'image',
            transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
          });

          const secureUrl = uploadRes.secure_url;
          await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [secureUrl, item.id]);
          console.log(`✅ [${item.id}] -> ${item.fileName} (${secureUrl})`);
          successCount++;
        } catch (err) {
          console.error(`❌ [${item.id}] Upload failed:`, err.message);
        }
      })
    );
  }

  console.log(`\n========================================`);
  console.log(`🎉 Sync Complete! Updated ${successCount}/${STRICT_MAPPINGS.length} products strictly from "AVIRA PRODUCT" folder.`);
  console.log(`Products without images are left empty for manual upload.`);
  console.log(`========================================\n`);
}

syncStrictAviraProductFolder()
  .catch((err) => console.error('Fatal error:', err))
  .finally(() => pool.end());
