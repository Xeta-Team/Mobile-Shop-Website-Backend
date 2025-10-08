// Helper function to render the list of items in an HTML table
const renderOrderItems = (items) => {
    return items.map(item => `
        <tr style="border-bottom: 1px solid #eaeaea;">
            <td style="padding: 15px 0; display: flex; align-items: center;">
                <img src="${item.image}" alt="${item.name}" width="60" style="border-radius: 8px; margin-right: 15px;">
                <span style="font-weight: 600;">${item.name}</span>
            </td>
            <td style="padding: 15px 0; text-align: right;">LKR ${item.price.toLocaleString()} x ${item.quantity}</td>
        </tr>
    `).join('');
};

// Main function to get the correct email content based on the order status
export const getOrderUpdateEmail = ({ user, order, status, trackingNumber }) => {
    const templates = {
        // --- SHIPPED EMAIL TEMPLATE ---
        'Shipped': {
            subject: `🚀 Your Order is on its Way!`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
                    <h1 style="color: #4f46e5;">Get Ready, ${user.firstName}!</h1>
                    <p>Great news! Your order #${order._id.toString().substring(0, 8)} has been shipped and is heading your way.</p>
                    <p style="font-size: 18px; font-weight: bold;">Your Tracking Number is:</p>
                    <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; text-align: center; font-size: 20px; letter-spacing: 2px; margin: 20px 0;">
                        ${trackingNumber}
                    </div>
                    <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Order Summary</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">${renderOrderItems(order.orderItems)}</table>
                    <p style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px;">Total: LKR ${order.totalPrice.toLocaleString()}</p>
                    <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">Thank you for your purchase from Your Shop Name!</p>
                </div>`
        },
        // --- DELIVERED EMAIL TEMPLATE ---
        'Delivered': {
            subject: `✅ Your Order Has Been Delivered!`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
                    <h1 style="color: #10b981;">It's Arrived, ${user.firstName}!</h1>
                    <p>We're happy to let you know that your order #${order._id.toString().substring(0, 8)} has been successfully delivered.</p>
                    <p>We hope you love your new items! We'd be thrilled if you could leave a review on our website.</p>
                    <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Order Summary</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">${renderOrderItems(order.orderItems)}</table>
                    <p style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px;">Total: LKR ${order.totalPrice.toLocaleString()}</p>
                    <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">We look forward to seeing you again soon!</p>
                </div>`
        },
        // --- CANCELLED EMAIL TEMPLATE ---
        'Cancelled': {
            subject: `Regarding Your Recent Order #${order._id.toString().substring(0, 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
                    <h1 style="color: #ef4444;">Order Cancellation Notice</h1>
                    <p>Hi ${user.firstName},</p>
                    <p>This email is to confirm that your order #${order._id.toString().substring(0, 8)} has been cancelled.</p>
                    <p>If you did not request this cancellation or have any questions, please contact our support team immediately.</p>
                    <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Cancelled Items</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">${renderOrderItems(order.orderItems)}</table>
                    <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">We apologize for any inconvenience this may have caused.</p>
                </div>`
        }
    };
    return templates[status]; // Return the content for the specified status
};