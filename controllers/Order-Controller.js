import Order from '../models/Order-Model.js';
import Product from '../models/Add-product-model.js'; // Make sure to import your Product model

export const placeOrder = async (req, res) => {
  try {
    const { orderItems, billingAddress, shippingAddress, paymentMethod, totalPrice, orderNotes } = req.body;
    
    // 1. Get the user ID from the authenticated request
    const userId = req.user.id; // Or however you get the user's ID

    // 2. Map through orderItems to get product details
    const orderItemsWithDetails = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          throw new Error(`Product not found with ID: ${item._id}`);
        }
        
        return {
          product: product._id, // Add the product's ObjectId
          name: product.productName, // Add the product's name
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        };
      })
    );

    // 3. Create a new order with the complete data
    const newOrder = new Order({
      user: userId,
      orderItems: orderItemsWithDetails,
      billingAddress,
      shippingAddress,
      paymentMethod,
      totalPrice,
      orderStatus: 'Pending',
      orderNotes,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({"message" : "Order place successfully"});
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Order validation failed', details: error.message });
  }
};

export const getSpecificUserOrder = async(req, res) => {
  try{
    const userId = req.user._id
    const orders = await Order.find({user: userId})

    res.json({
      orders: orders
    })
  }catch(error){
    res.status(500).json({
      'message': error
    })
  }
 
}