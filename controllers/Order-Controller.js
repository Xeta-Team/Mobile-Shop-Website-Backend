import Order from '../models/Order-Model.js';
import sendEmail from '../utils/sendEmail.js';
import { getOrderUpdateEmail } from '../utils/emailTemplates.js';

export const placeOrder = async (req, res) => {
  try {
    const { orderItems, billingAddress, shippingAddress, paymentMethod, totalPrice, orderNotes } = req.body;

    // Get the user ID from the authMiddleware
    const userId = req.user.id;

    // Ensure there are items in the order
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: 'No order items found.' });
    }

    // Map the frontend cart items to the format required by the database schema
    const orderItemsForDb = orderItems.map(item => {
      // Validate that the essential productId exists for each item
      if (!item.productId) {
        throw new Error('Missing productId for an item in the order.');
      }
      return {
        product: item.productId, // Link to the Product model
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      };
    });

    // Create a new order instance with all the required data
    const newOrder = new Order({
      user: userId, // Link to the User model
      orderItems: orderItemsForDb,
      billingAddress,
      shippingAddress,
      paymentMethod,
      totalPrice,
      orderStatus: 'Pending', // Default status for a new order
      orderNotes,
    });

    // Save the new order to the database
    await newOrder.save();
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
        // The user's ID is attached to the request by the authMiddleware
        const userId = req.user.id;

        // Find all orders where the 'user' field matches the logged-in user's ID
        // Sort by creation date to show the newest orders first
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        if (!orders) {
            // This case is unlikely but good for completeness
            return res.status(404).json({ message: "You have no orders." });
        }

        // Send the found orders back to the frontend
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
        // Populate the user's details to get their email and name for the notification
        const order = await Order.findById(req.params.id).populate('user', 'email firstName');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Update the order details
        order.orderStatus = status;
        if (status === 'Shipped' && trackingNumber) {
            order.trackingNumber = trackingNumber;
        }
        
        await order.save();

        // Get the appropriate email template for the new status
        const emailContent = getOrderUpdateEmail({
            user: order.user,
            order,
            status,
            trackingNumber: order.trackingNumber
        });

        // If a template exists for this status, send the email
        if (emailContent) {
            try {
                await sendEmail({
                    to: order.user.email,
                    subject: emailContent.subject,
                    html: emailContent.html,
                });
            } catch (emailError) {
                // Log the error but don't prevent the API from responding successfully
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