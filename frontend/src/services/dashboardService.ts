import { apiClient } from './api';

export interface DashboardStats {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  change?: string;
  changeColor?: string;
}

export interface QuickStats {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export interface RecentOrder {
  id: string;
  user: string;
  total: number;
  status: string;
  date: string;
  time: string;
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
  trend: string;
}

export interface RevenueChartData {
  date: string;
  dateFormatted: string;
  revenue: number;
  orders: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalOrders: number;
  avgRevenue: number;
  period: number;
}

class DashboardService {
  // Get dashboard stats
  async getDashboardStats(): Promise<{
    stats: DashboardStats[];
    quickStats: QuickStats[];
  }> {
    const response = await apiClient<{
      stats: DashboardStats[];
      quickStats: QuickStats[];
    }>('/dashboard/stats', {
      method: 'GET',
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to get dashboard stats');
  }

  // Get recent orders
  async getRecentOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    orders: RecentOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);

    const response = await apiClient<{
      orders: RecentOrder[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/dashboard/orders?${queryParams.toString()}`, {
      method: 'GET',
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to get recent orders');
  }

  // Get top products
  async getTopProducts(params?: {
    limit?: number;
    period?: string;
  }): Promise<TopProduct[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.period) queryParams.append('period', params.period);

    const response = await apiClient<TopProduct[]>(`/dashboard/products?${queryParams.toString()}`, {
      method: 'GET',
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to get top products');
  }

  // Get revenue chart data
  async getRevenueChart(period: string = '7'): Promise<{
    chartData: RevenueChartData[];
    summary: RevenueSummary;
  }> {
    const response = await apiClient<{
      chartData: RevenueChartData[];
      summary: RevenueSummary;
    }>(`/dashboard/revenue?period=${period}`, {
      method: 'GET',
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to get revenue chart data');
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
