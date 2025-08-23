import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Category from '../models/Category';
import Comment from '../models/Comment';
import mongoose from 'mongoose';

export class DashboardController {
  // Get dashboard stats
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      // Get current date ranges
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Basic counts
      const [
        totalProducts,
        totalCategories,
        totalUsers,
        totalOrders,
        todayOrders,
        outOfStockProducts,
        newUsersToday,
        newCommentsToday,
        todayRatings
      ] = await Promise.all([
        Product.countDocuments(),
        Category.countDocuments(),
        User.countDocuments({ role: { $ne: 'admin' } }),
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startOfDay } }),
        Product.countDocuments({ stock: { $lte: 5 } }),
        User.countDocuments({ 
          role: { $ne: 'admin' },
          createdAt: { $gte: startOfDay }
        }),
        Comment.countDocuments({ createdAt: { $gte: startOfDay } }),
        (await import('../models/Rating')).default.countDocuments({ createdAt: { $gte: startOfDay } })
      ]);

      // Revenue calculations
      const [monthRevenue, lastMonthRevenue] = await Promise.all([
        Order.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: { $gte: startOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ]),
        Order.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ])
      ]);

      const currentMonthRevenue = monthRevenue[0]?.total || 0;
      const previousMonthRevenue = lastMonthRevenue[0]?.total || 0;
      const revenueGrowthNum = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100)
        : 0;
      const revenueGrowth = revenueGrowthNum.toFixed(1);

      // Quick stats
      const quickStats = [
        {
          label: 'Đơn hàng hôm nay',
          value: todayOrders,
          icon: '🛒',
          color: 'text-green-600'
        },
        {
          label: 'Sản phẩm hết hàng',
          value: outOfStockProducts,
          icon: '⚠️',
          color: 'text-red-600'
        },
        {
          label: 'Khách hàng mới',
          value: newUsersToday,
          icon: '✨',
          color: 'text-blue-600'
        },
        {
          label: 'Đánh giá mới',
          value: todayRatings,
          icon: '⭐',
          color: 'text-yellow-600'
        }
      ];

      // Main stats
      const stats = [
        {
          label: 'Tổng sản phẩm',
          value: totalProducts,
          icon: '📦',
          color: 'text-green-600',
          change: '+12%', // You can calculate this based on historical data
          changeColor: 'text-green-600'
        },
        {
          label: 'Tổng danh mục',
          value: totalCategories,
          icon: '🗂️',
          color: 'text-blue-600',
          change: '+2%',
          changeColor: 'text-blue-600'
        },
        {
          label: 'Tổng người dùng',
          value: totalUsers,
          icon: '👤',
          color: 'text-purple-600',
          change: '+8%',
          changeColor: 'text-purple-600'
        },
        {
          label: 'Doanh thu tháng',
          value: `${(currentMonthRevenue / 1000000).toFixed(1)}M`,
          icon: '💰',
          color: 'text-yellow-600',
          change: `${revenueGrowthNum > 0 ? '+' : ''}${revenueGrowth}%`,
          changeColor: revenueGrowthNum > 0 ? 'text-green-600' : 'text-red-600'
        }
      ];

      res.json({
        success: true,
        data: {
          stats,
          quickStats
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê dashboard'
      });
    }
  }

  // Get recent orders
  static async getRecentOrders(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Order.countDocuments(query);

      const formattedOrders = orders.map(order => ({
        id: order._id,
        user: (order.userId as any)?.name || 'Unknown User',
        total: order.totalAmount,
        status: order.status,
        date: (order as any).createdAt.toLocaleDateString('vi-VN'),
        time: (order as any).createdAt.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));

      res.json({
        success: true,
        data: {
          orders: formattedOrders,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get recent orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách đơn hàng gần đây'
      });
    }
  }

  // Get top products
  static async getTopProducts(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const period = req.query.period as string || '30'; // days

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Get top products by sales volume and revenue
      const topProducts = await Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: '$items.productId',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            name: '$product.name',
            sold: '$totalSold',
            revenue: '$totalRevenue',
            trend: '📈' // You can calculate trend based on historical data
          }
        },
        {
          $sort: { revenue: -1 }
        },
        {
          $limit: limit
        }
      ]);

      res.json({
        success: true,
        data: topProducts
      });
    } catch (error) {
      console.error('Get top products error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách sản phẩm bán chạy'
      });
    }
  }

  // Get revenue chart data
  static async getRevenueChart(req: AuthRequest, res: Response) {
    try {
      const period = req.query.period as string || '7'; // days
      const days = parseInt(period);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const revenueData = await Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      // Fill missing dates with 0 revenue
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayData = revenueData.find(d => d._id === dateString);
        chartData.push({
          date: dateString,
          dateFormatted: date.toLocaleDateString('vi-VN'),
          revenue: dayData?.revenue || 0,
          orders: dayData?.orders || 0
        });
      }

      // Calculate totals
      const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0);
      const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

      res.json({
        success: true,
        data: {
          chartData,
          summary: {
            totalRevenue,
            totalOrders,
            avgRevenue: Math.round(avgRevenue),
            period: days
          }
        }
      });
    } catch (error) {
      console.error('Get revenue chart error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy dữ liệu biểu đồ doanh thu'
      });
    }
  }
}
