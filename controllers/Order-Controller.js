import Order from '../models/Order-model.js';
import sendEmail from '../utils/sendEmail.js';
import { getOrderUpdateEmail } from '../utils/emailTemplates.js';

export const placeOrder = async (req, res) => {
  try {
    const { orderItems, billingAddress, shippingAddress, paymentMethod, totalPrice, orderNotes } = req.body;

    const userId = req.user.id;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: 'No order items found.' });
    }

    const orderItemsForDb = orderItems.map(item => {
      if (!item.productId) {
        throw new Error('Missing productId for an item in the order.');
      }
      return {
        product: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      };
    });

    const newOrder = new Order({
      user: userId,
      orderItems: orderItemsForDb,
      billingAddress,
      shippingAddress,
      paymentMethod,
      totalPrice,
      orderStatus: 'Pending',
      orderNotes,
    });

    // Save the new order to the database
    await newOrder.save();
    
    // --- NEW: SEND ORDER CONFIRMATION EMAIL ---
    try {
        const emailContent = getOrderUpdateEmail({
            user: { firstName: newOrder.billingAddress.firstName }, // Pass the customer's first name
            order: newOrder,
            status: 'Confirmation' // Use the new template key
        });

        if (emailContent) {
            await sendEmail({
                to: newOrder.billingAddress.email,
                subject: emailContent.subject,
                html: emailContent.html,
            });
        }
    } catch (emailError) {
        // Log the email error but don't fail the order placement process
        console.error(`Failed to send confirmation email for order ${newOrder._id}:`, emailError);
    }
    // --- END OF NEW CODE ---

    res.status(201).json({ message: "Order placed successfully" });

  } catch (error) {
    console.error('Error placing order:', error.message);
    res.status(500).json({ error: 'Failed to place order', details: error.message });
  }
};

/**
 * @description Fetches all orders for the logged-in user.
 * @route GET /api/orders/myorders
 * @access Private (Requires user to be logged in)
 */
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        if (!orders) {
            return res.status(404).json({ message: "You have no orders." });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

/**
 * @description Get all orders (Admin only)
 */
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'firstName lastName email');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch all orders." });
    }
};

/**
 * @description Update order status and send email notifications (Admin only)
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'email firstName');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        order.orderStatus = status;
        if (status === 'Shipped' && trackingNumber) {
            order.trackingNumber = trackingNumber;
        }
        
        await order.save();

        const emailContent = getOrderUpdateEmail({
            user: order.user,
            order,
            status,
            trackingNumber: order.trackingNumber
        });

        if (emailContent) {
            try {
                await sendEmail({
                    to: order.user.email,
                    subject: emailContent.subject,
                    html: emailContent.html,
                });
            } catch (emailError) {
                console.error(`Failed to send ${status} email for order ${order._id}:`, emailError);
            }
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status.' });
    }
};

/**
 * @description Manual update for tracking number (Admin only)
 * This can be kept as a fallback if needed
 */
export const updateTrackingNumber = async (req, res) => {
    try {
        const { trackingNumber } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { trackingNumber }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update tracking number.' });
    }
};