import Order from '../models/Order-model.js';
import User from '../models/User-Regestration-model.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [
      totalOrders,
      totalCustomers,
      totalRevenueResult,
      recentOrders,
      dailySales
    ] = await Promise.all([
      Order.countDocuments(),
      
      User.countDocuments({ role: 'user' }),
      
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),

      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName'),

      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: sevenDaysAgo },
            orderStatus: { $ne: 'Cancelled' }
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sales: { $sum: "$totalPrice" }
          }
        },
        { $sort: { _id: 1 } } 
      ])
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const formattedSalesData = dailySales.map(item => {
      const d = new Date(item._id);
      return {
        name: days[d.getDay()], 
        sales: item.sales
      };
    });

    res.status(200).json({
      stats: {
        totalRevenue: totalRevenueResult[0]?.total || 0,
        totalOrders: totalOrders,
        totalCustomers: totalCustomers
      },
      orders: recentOrders, 
      salesData: formattedSalesData
    });

  } catch (error) {
    console.error("Dashboard Data Error:", error);
    res.status(500).json({ message: 'Server Error fetching dashboard data' });
  }
};