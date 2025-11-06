import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Schema for individual products within an order
const orderItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Links to the Product model
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

// Main schema for an order
const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links to the User model
      required: true, // This is a required field
    },
    orderItems: [orderItemSchema],
    billingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String },
      companyName: { type: String },
      country: { type: String, required: true },
      streetAddress: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      postcode: { type: String },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    shippingAddress: {
        firstName: { type: String },
        lastName: { type: String },
        companyName: { type: String },
        country: { type: String },
        streetAddress: { type: String },
        apartment: { type: String },
        city: { type: String },
        postcode: { type: String },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true,
      default: 'Pending',
    },
    orderNotes: {
        type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;