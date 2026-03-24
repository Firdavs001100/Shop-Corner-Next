import { Member } from '../member/member';
import { Order } from '../order/order';
import { BoardArticle } from '../board-article/board-article';

export interface DashboardOverview {
	totalMembers: number;
	totalProducts: number;
	totalOrders: number;
	totalArticles: number;
	totalRevenue: number;
	todayRevenue: number;
	todayOrders: number;
}

export interface SalesAnalyticsItem {
	date: string;
	revenue: number;
	orders: number;
}

export interface SalesAnalytics {
	list: SalesAnalyticsItem[];
}

export interface DashboardActivity {
	recentOrders: Order[];
	recentMembers: Member[];
	recentArticles: BoardArticle[];
}

export interface DashboardAlerts {
	lowStockProducts: number;
	pendingOrders: number;
	deletedArticles: number;
}

export interface TopSellingProduct {
	_id: string;
	productName: string;
	soldCount: number;
}

export interface TopCustomer {
	_id: string;
	memberNick: string;
	totalSpent: number;
}

export interface OrderStatusStat {
	status: string;
	count: number;
}

export interface DashboardInsights {
	topSellingProducts: TopSellingProduct[];
	topCustomers: TopCustomer[];
	orderStatusStats: OrderStatusStat[];
}

export interface InventoryStatus {
	inStock: number;
	lowStock: number;
	outOfStock: number;
}

export interface RevenueBreakdown {
	date: string;
	amount: number;
}

export interface RevenueResponse {
	total: number;
	breakdown: RevenueBreakdown[];
}
