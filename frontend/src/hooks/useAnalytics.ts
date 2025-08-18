import { useState, useEffect } from 'react';
import orderService from '../services/orderService';

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  category: string;
}

export interface AnalyticsData {
  salesData: SalesData[];
  topProducts: TopProduct[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growthRate: number;
}

export type AnalyticsPeriod = '7days' | '30days' | '3months';

export const useAnalytics = (period: AnalyticsPeriod = '7days') => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDaysCount = (period: AnalyticsPeriod): number => {
    switch (period) {
      case '7days': return 7;
      case '30days': return 30;
      case '3months': return 90;
      default: return 7;
    }
  };

  const generateDateRange = (days: number): string[] => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const days = getDaysCount(period);
      const dateRange = generateDateRange(days);

      // Fetch orders data

      // Chuẩn hóa startDate về 00:00:00 và endDate về 23:59:59
      const startDateISO = dateRange[0] + 'T00:00:00.000Z';
      const endDateISO = dateRange[dateRange.length - 1] + 'T23:59:59.999Z';
      const ordersResponse = await orderService.getAllOrders({ 
        page: 1, 
        limit: 1000,
        startDate: startDateISO,
        endDate: endDateISO
      });

  // Chỉ lấy đơn hàng giao thành công
  const orders = (ordersResponse?.orders || []).filter((order: any) => order.status === 'delivered');

      // Process sales data by date
      const salesByDate = dateRange.reduce((acc, date) => {
        acc[date] = { revenue: 0, orders: 0 };
        return acc;
      }, {} as Record<string, { revenue: number; orders: number }>);

      // Aggregate product sales
      const productSales = {} as Record<string, { sales: number; revenue: number; name: string; category: string }>;

      orders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt || order.orderDate).toISOString().split('T')[0];
        
        if (salesByDate[orderDate]) {
          salesByDate[orderDate].revenue += order.totalAmount || 0;
          salesByDate[orderDate].orders += 1;
        }

        // Aggregate product sales
        order.items?.forEach((item: any) => {
          const productId = item.productId?._id || item.productId;
          const productName = item.productName || item.name || 'Unknown Product';
          const category = item.productId?.category || 'Unknown';
          
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                sales: 0,
                revenue: 0,
                name: productName,
                category: category
              };
            }
            productSales[productId].sales += item.quantity || 0;
            productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      });

      // Convert to arrays
      const salesData: SalesData[] = dateRange.map(date => ({
        date,
        revenue: salesByDate[date].revenue,
        orders: salesByDate[date].orders
      }));

      const topProducts: TopProduct[] = Object.entries(productSales)
        .map(([id, data]) => ({
          id,
          name: data.name,
          sales: data.sales,
          revenue: data.revenue,
          category: data.category
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

      // Calculate totals
      const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate growth rate (compare with previous period)
      const previousPeriodStart = new Date(dateRange[0]);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
      const previousPeriodEnd = new Date(dateRange[0]);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);

      const previousOrdersResponse = await orderService.getAllOrders({
        page: 1,
        limit: 1000,
        startDate: previousPeriodStart.toISOString().split('T')[0],
        endDate: previousPeriodEnd.toISOString().split('T')[0]
      });

      const previousRevenue = previousOrdersResponse?.orders?.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0), 0
      ) || 0;

      const growthRate = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      setData({
        salesData,
        topProducts,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        growthRate
      });

    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(`Không thể tải dữ liệu thống kê: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics
  };
};
