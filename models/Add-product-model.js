import mongoose from 'mongoose';
const { Schema } = mongoose;

const ALL_CATEGORIES = [
    'iPhone', 'iPad', 'Mac', 'other Phone', 'iWatch', 'Mobile Phone',
    'Power & Charging', 'Headphone', 'Accessories (Protection & Add-ons)', 'Connectivity / Storage', 'Airpods', 'Other Phone'
];

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required.'],
        trim: true,
        index: 'text'
    },
    brand: {
        type: String,
        required: [true, 'Brand is required.'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required.'],
        enum: {
            values: ALL_CATEGORIES,
            message: '{VALUE} is not a supported category.'
        }
    },
    base_image: {
        type: String, 
        required: [true, 'Base image URL is required.']
    },
    variants: [{
        type: Schema.Types.ObjectId,
        ref: 'Variant'
    }]
}, {
    timestamps: true
});

productSchema.index({ name: 1, brand: 1 }, { unique: true });


const productVariantSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sku: {
        type: String,
        required: [true, 'SKU is required.'],
        unique: true,
        trim: true
    },
    image_url: { type: String },
    colorName: { type: String, trim: true },
    colorHex: { type: String, trim: true },
    storage: { type: String, trim: true },
    condition: { type: String, required: true, default: 'New' },
    packaging: { type: String, trim: true },
    price: {
        type: Number,
        required: [true, 'Price is required.'],
        min: [0, 'Price cannot be negative.']
    },
    stock_quantity: {
        type: Number,
        required: [true, 'Stock quantity is required.'],
        min: [0, 'Stock cannot be negative.'],
        default: 0
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
const Variant = mongoose.model('Variant', productVariantSchema);


export { Product, Variant };