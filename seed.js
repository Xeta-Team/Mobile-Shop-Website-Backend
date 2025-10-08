import mongoose from 'mongoose';
import dotenv from 'dotenv';
// IMPORTANT: Make sure the path to your models is correct
import { Product, Variant } from './models/Add-product-model.js';

dotenv.config();

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
    console.error("\n\n\n--- DATABASE CONNECTION ERROR ---\n");
    console.error("The DB_URL environment variable is not set or could not be found.");
    console.error("Please check your .env file and ensure the variable is named 'DB_URL'.\n\n\n");
    process.exit(1);
}

// --- DATA GENERATION CONFIGURATION ---

// FIX: Using brands that align with the new categories
const BRANDS = {
    phone: ['Apple', 'Samsung', 'Google'],
    mac: ['Apple'],
    ipad: ['Apple'],
    iwatch: ['Apple'],
    headphone: ['Sony', 'Bose', 'Apple'],
    accessory: ['Anker', 'Logitech', 'Belkin'],
};

const COLORS = [
    { name: 'Midnight Black', hex: '#1C1C1C' },
    { name: 'Galaxy Silver', hex: '#E3E4E6' },
    { name: 'Cosmic Blue', hex: '#2E3A4B' },
];

const STORAGE = {
    phone: ['128GB', '256GB', '512GB'],
    mac: ['256GB SSD', '512GB SSD', '1TB SSD'],
    ipad: ['64GB', '128GB', '256GB'],
};

// --- HELPER FUNCTIONS ---

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (base) => base + Math.floor(Math.random() * 20) * 10;
const generateSku = (brand, name, color, storage) => {
    const brandPart = brand.substring(0, 3).toUpperCase();
    const namePart = name.replace(/[^A-Z0-9]/ig, "").substring(0, 4).toUpperCase();
    const colorPart = color.substring(0, 3).toUpperCase();
    const storagePart = storage ? storage.substring(0, 3) : 'STD';
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${brandPart}-${namePart}-${colorPart}-${storagePart}-${randomNum}`;
};

// --- PRODUCT GENERATION LOGIC ---

const generatedProducts = [];

// Generate 25 Phones (iPhones and Mobile Phones)
for (let i = 1; i <= 25; i++) {
    const brand = getRandomElement(BRANDS.phone);
    const model = `${brand} Phone Gen ${i}`;
    const color = getRandomElement(COLORS);
    // FIX: Map brand to the correct category from your new enum
    const category = brand === 'Apple' ? 'iPhone' : 'Mobile Phone';
    generatedProducts.push({
        name: model, brand, category,
        description: `The next generation of mobile technology, the ${model}.`,
        base_image: `https://placehold.co/600x400/${color.hex.substring(1)}/white?text=${encodeURIComponent(model)}`,
        variants: [getRandomElement(STORAGE.phone)].map(storage => ({
            sku: generateSku(brand, model, color.name, storage), colorName: color.name, colorHex: color.hex, storage,
            price: getRandomPrice(700 + i * 10), stock_quantity: Math.floor(Math.random() * 100) + 10,
        }))
    });
}

// Generate 20 Laptops (as Mac)
for (let i = 1; i <= 20; i++) {
    const brand = 'Apple';
    const model = `MacBook Ultra ${i}`;
    const color = getRandomElement(COLORS);
    generatedProducts.push({
        name: model, brand, category: 'Mac', // FIX: Use 'Mac' category
        description: `Power meets portability in the new ${model}.`,
        base_image: `https://placehold.co/600x400/${color.hex.substring(1)}/white?text=${encodeURIComponent(model)}`,
        variants: [getRandomElement(STORAGE.mac)].map(storage => ({
            sku: generateSku(brand, model, color.name, storage), colorName: color.name, colorHex: color.hex, storage,
            price: getRandomPrice(1200 + i * 20), stock_quantity: Math.floor(Math.random() * 50) + 5,
        }))
    });
}

// Generate 15 Tablets (as iPad)
for (let i = 1; i <= 15; i++) {
    const brand = 'Apple';
    const model = `iPad Pro ${i}`;
    const color = getRandomElement(COLORS);
    generatedProducts.push({
        name: model, brand, category: 'iPad', // FIX: Use 'iPad' category
        description: `Redesigned and ready for anything, the ${model}.`,
        base_image: `https://placehold.co/600x400/${color.hex.substring(1)}/white?text=${encodeURIComponent(model)}`,
        variants: [{
            sku: generateSku(brand, model, color.name, getRandomElement(STORAGE.ipad)), colorName: color.name, colorHex: color.hex, storage: getRandomElement(STORAGE.ipad),
            price: getRandomPrice(500 + i * 10), stock_quantity: Math.floor(Math.random() * 80) + 15,
        }]
    });
}

// Generate 15 Watches (as iWatch)
for (let i = 1; i <= 15; i++) {
    const brand = 'Apple';
    const model = `iWatch SE ${i}`;
    const color = getRandomElement(COLORS);
    generatedProducts.push({
        name: model, brand, category: 'iWatch', // FIX: Use 'iWatch' category
        description: `A great deal to love. The new ${model}.`,
        base_image: `https://placehold.co/600x400/${color.hex.substring(1)}/white?text=${encodeURIComponent(model)}`,
        variants: [{
            sku: generateSku(brand, model, color.name, '45mm'), colorName: color.name, colorHex: color.hex, storage: '45mm',
            price: getRandomPrice(300 + i * 5), stock_quantity: Math.floor(Math.random() * 120) + 20,
        }]
    });
}

// Generate 15 Headphones
for (let i = 1; i <= 15; i++) {
    const brand = getRandomElement(BRANDS.headphone);
    const model = `${brand} SoundPro ${i}`;
    const color = getRandomElement(COLORS);
    generatedProducts.push({
        name: model, brand, category: 'Headphone', // FIX: Use 'Headphone' category
        description: `Hear every detail with the ${model}.`,
        base_image: `https://placehold.co/600x400/${color.hex.substring(1)}/white?text=${encodeURIComponent(model)}`,
        variants: [{
            sku: generateSku(brand, model, color.name, 'N/A'), colorName: color.name, colorHex: color.hex, storage: 'N/A',
            price: getRandomPrice(200 + i * 5), stock_quantity: Math.floor(Math.random() * 150) + 30,
        }]
    });
}

// Generate 10 Accessories
for (let i = 1; i <= 10; i++) {
    const brand = getRandomElement(BRANDS.accessory);
    const model = `${brand} PowerBank ${i}`;
    const color = getRandomElement(COLORS);
    generatedProducts.push({
        name: model, brand, category: 'Power & Charging', // FIX: Use a valid accessory category
        description: `Stay charged on the go with the ${model}.`,
        base_image: `https://placehold.co/600x400/${color.hex.substring(1)}/white?text=${encodeURIComponent(model)}`,
        variants: [{
            sku: generateSku(brand, model, color.name, '20000mAh'), colorName: color.name, colorHex: color.hex, storage: '20000mAh',
            price: getRandomPrice(50 + i * 2), stock_quantity: Math.floor(Math.random() * 200) + 50,
        }]
    });
}


// --- DATABASE SEEDING SCRIPT ---
const seedDB = async () => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected!');

    await Product.deleteMany({});
    await Variant.deleteMany({});
    console.log('Cleared existing products and variants.');

    for (const productData of generatedProducts) {
      const { variants, ...parentProductData } = productData;
      const parentProduct = new Product(parentProductData);
      const savedVariants = [];
      for (const variantData of variants) {
        const newVariant = new Variant({ ...variantData, product: parentProduct._id });
        const saved = await newVariant.save();
        savedVariants.push(saved._id);
      }
      parentProduct.variants = savedVariants;
      await parentProduct.save();
    }

    console.log(`Database seeded successfully with ${generatedProducts.length} products!`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

seedDB();