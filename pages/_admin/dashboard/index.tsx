import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	GET_DASHBOARD_OVERVIEW,
	GET_SALES_ANALYTICS,
	GET_RECENT_ACTIVITY,
	GET_ADMIN_ALERTS,
	GET_DASHBOARD_INSIGHTS,
	GET_INVENTORY_STATUS,
} from '../../../apollo/admin/query';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
	new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		maximumFractionDigits: 0,
	}).format(n);

const fmtNum = (n: number) =>
	n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;

const timeAgo = (iso: string) => {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 60000);
	if (m < 1) return 'just now';
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const KpiCard = ({
	title,
	value,
	sub,
	trend,
	trendUp,
	icon,
}: {
	title: string;
	value: string | number;
	sub?: string;
	trend?: string;
	trendUp?: boolean;
	icon: React.ReactNode;
}) => (
	<div className="db-kpi">
		<div className="db-kpi__top">
			<span className="db-kpi__icon">{icon}</span>
			{trend && (
				<span className={`db-kpi__trend db-kpi__trend--${trendUp ? 'up' : 'down'}`}>
					{trendUp ? '↑' : '↓'} {trend}
				</span>
			)}
		</div>
		<div className="db-kpi__value">{value}</div>
		<div className="db-kpi__title">{title}</div>
		{sub && <div className="db-kpi__sub">{sub}</div>}
	</div>
);

const AlertBadge = ({
	count,
	label,
	variant,
}: {
	count: number;
	label: string;
	variant: 'warn' | 'info' | 'danger';
}) => (
	<div className={`db-alert db-alert--${variant}`}>
		<span className="db-alert__count">{count}</span>
		<span className="db-alert__label">{label}</span>
	</div>
);

const MiniBar = ({ value, max, label }: { value: number; max: number; label: string }) => (
	<div className="db-minibar">
		<div className="db-minibar__label">{label}</div>
		<div className="db-minibar__track">
			<div className="db-minibar__fill" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
		</div>
		<div className="db-minibar__value">{fmtNum(value)}</div>
	</div>
);

const RevenueChart = ({ data }: { data: { date: string; revenue: number; orders: number }[] }) => {
	if (!data?.length) return <div className="db-chart__empty">No data available</div>;

	const formatted = data.map((d) => ({
		...d,
		label: d.date.slice(5),
	}));

	return (
		<div className="db-chart__area">
			<ResponsiveContainer width="100%" height={220}>
				<AreaChart data={formatted} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
					<defs>
						<linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
							<stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
					<XAxis
						dataKey="label"
						tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }}
						axisLine={false}
						tickLine={false}
						tickFormatter={(v) => (v >= 1000 ? `₩${(v / 1000).toFixed(0)}k` : `₩${v}`)}
					/>
					<Tooltip
						contentStyle={{
							background: '#0f172a',
							border: 'none',
							borderRadius: 8,
							fontSize: 12,
							color: '#fff',
							fontFamily: 'DM Sans',
						}}
						labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}
						formatter={(value) => [`₩${Number(value).toLocaleString('ko-KR')}`, 'Revenue']}
					/>
					<Area
						type="monotone"
						dataKey="revenue"
						stroke="#0f172a"
						strokeWidth={2}
						fill="url(#revenueGrad)"
						dot={false}
						activeDot={{ r: 4, fill: '#0f172a', strokeWidth: 0 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

// ── Main ───────────────────────────────────────────────────────────────────────

const Dashboard: NextPage = () => {
	const [period, setPeriod] = useState('7d');

	const { data: overviewData } = useQuery(GET_DASHBOARD_OVERVIEW);
	const { data: analyticsData } = useQuery(GET_SALES_ANALYTICS, {
		variables: { input: { period } },
	});
	const { data: activityData } = useQuery(GET_RECENT_ACTIVITY, {
		variables: { input: { limit: 5 } },
	});
	const { data: alertsData } = useQuery(GET_ADMIN_ALERTS);
	const { data: insightsData } = useQuery(GET_DASHBOARD_INSIGHTS);
	const { data: inventoryData } = useQuery(GET_INVENTORY_STATUS);

	const ov = overviewData?.getDashboardOverview;
	const analytics = analyticsData?.getSalesAnalytics?.list ?? [];
	const activity = activityData?.getRecentActivity;
	const alerts = alertsData?.getAdminAlerts;
	const insights = insightsData?.getDashboardInsights;
	const inventory = inventoryData?.getInventoryStatus;

	const totalInventory = (inventory?.inStock ?? 0) + (inventory?.lowStock ?? 0) + (inventory?.outOfStock ?? 0) || 1;

	return (
		<div className="admin-dashboard">
			{/* ── Header ─────────────────────────────────────────────── */}
			<div className="db-header">
				<div className="db-header__left">
					<h1 className="db-header__title">Dashboard</h1>
					<p className="db-header__sub">Real-time business performance</p>
				</div>
				<div className="db-header__right">
					<div className="db-period">
						{['7d', '30d', '12m'].map((p) => (
							<button
								key={p}
								className={`db-period__btn${period === p ? ' db-period__btn--active' : ''}`}
								onClick={() => setPeriod(p)}
							>
								{p === '7d' ? '7 days' : p === '30d' ? '30 days' : '12 months'}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* ── KPIs ───────────────────────────────────────────────── */}
			<div className="db-kpis">
				<KpiCard
					icon={
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<line x1="12" y1="1" x2="12" y2="23" />
							<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
						</svg>
					}
					title="Today's Revenue"
					value={fmt(ov?.todayRevenue ?? 0)}
					sub={`Total: ${fmt(ov?.totalRevenue ?? 0)}`}
					trend="12%"
					trendUp
				/>
				<KpiCard
					icon={
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
							<line x1="3" y1="6" x2="21" y2="6" />
							<path d="M16 10a4 4 0 0 1-8 0" />
						</svg>
					}
					title="Today's Orders"
					value={fmtNum(ov?.todayOrders ?? 0)}
					sub={`Total: ${fmtNum(ov?.totalOrders ?? 0)}`}
					trend="5%"
					trendUp
				/>
				<KpiCard
					icon={
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
					}
					title="Total Members"
					value={fmtNum(ov?.totalMembers ?? 0)}
				/>
				<KpiCard
					icon={
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
							<line x1="8" y1="21" x2="16" y2="21" />
							<line x1="12" y1="17" x2="12" y2="21" />
						</svg>
					}
					title="Total Products"
					value={fmtNum(ov?.totalProducts ?? 0)}
				/>
				<KpiCard
					icon={
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
						</svg>
					}
					title="Total Articles"
					value={fmtNum(ov?.totalArticles ?? 0)}
				/>
			</div>

			{/* ── Main Grid ──────────────────────────────────────────── */}
			<div className="db-grid">
				{/* Chart */}
				<div className="db-card db-card--chart">
					<div className="db-card__head">
						<h3 className="db-card__title">Sales Analytics</h3>
						<span className="db-card__meta">
							{period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 12 months'}
						</span>
					</div>
					<div className="db-chart">
						<RevenueChart data={analytics} />
					</div>
				</div>

				{/* Alerts */}
				<div className="db-card db-card--alerts">
					<div className="db-card__head">
						<h3 className="db-card__title">Alerts</h3>
					</div>
					<div className="db-alerts">
						<AlertBadge count={alerts?.lowStockProducts ?? 0} label="Low stock products" variant="warn" />
						<AlertBadge count={alerts?.pendingOrders ?? 0} label="Pending orders" variant="info" />
						<AlertBadge count={alerts?.deletedArticles ?? 0} label="Deleted articles" variant="danger" />
					</div>

					{/* Inventory */}
					<div className="db-card__head db-card__head--mt">
						<h3 className="db-card__title">Inventory</h3>
					</div>
					<div className="db-inventory">
						<MiniBar value={inventory?.inStock ?? 0} max={totalInventory} label="In Stock" />
						<MiniBar value={inventory?.lowStock ?? 0} max={totalInventory} label="Low Stock" />
						<MiniBar value={inventory?.outOfStock ?? 0} max={totalInventory} label="Out of Stock" />
					</div>
				</div>

				{/* Top Products */}
				<div className="db-card">
					<div className="db-card__head">
						<h3 className="db-card__title">Top Products</h3>
					</div>
					<div className="db-list">
						{insights?.topSellingProducts?.length ? (
							insights.topSellingProducts.map((p: any, i: number) => (
								<div key={p._id} className="db-list__row">
									<span className="db-list__rank">{i + 1}</span>
									<span className="db-list__name">{p.productName}</span>
									<span className="db-list__val">{fmtNum(p.soldCount)} sold</span>
								</div>
							))
						) : (
							<p className="db-empty">No data yet</p>
						)}
					</div>
				</div>

				{/* Top Customers */}
				<div className="db-card">
					<div className="db-card__head">
						<h3 className="db-card__title">Top Customers</h3>
					</div>
					<div className="db-list">
						{insights?.topCustomers?.length ? (
							insights.topCustomers.map((c: any, i: number) => (
								<div key={c._id} className="db-list__row">
									<span className="db-list__rank">{i + 1}</span>
									<span className="db-list__name">{c.memberNick}</span>
									<span className="db-list__val">{fmt(c.totalSpent)}</span>
								</div>
							))
						) : (
							<p className="db-empty">No data yet</p>
						)}
					</div>
				</div>

				{/* Order Status */}
				<div className="db-card">
					<div className="db-card__head">
						<h3 className="db-card__title">Order Status</h3>
					</div>
					<div className="db-statuses">
						{insights?.orderStatusStats?.length ? (
							insights.orderStatusStats.map((s: any) => {
								const total = insights.orderStatusStats.reduce((a: number, x: any) => a + x.count, 0) || 1;
								return (
									<div key={s.status} className="db-status">
										<div className="db-status__top">
											<span className="db-status__label">{s.status}</span>
											<span className="db-status__count">{s.count}</span>
										</div>
										<div className="db-status__bar">
											<div
												className={`db-status__fill db-status__fill--${s.status.toLowerCase()}`}
												style={{ width: `${(s.count / total) * 100}%` }}
											/>
										</div>
									</div>
								);
							})
						) : (
							<p className="db-empty">No data yet</p>
						)}
					</div>
				</div>

				{/* Recent Orders */}
				<div className="db-card">
					<div className="db-card__head">
						<h3 className="db-card__title">Recent Orders</h3>
					</div>
					<div className="db-list">
						{activity?.recentOrders?.length ? (
							activity.recentOrders.map((o: any) => (
								<div key={o._id} className="db-list__row">
									<span className="db-list__name db-list__name--mono">{o._id.slice(-6).toUpperCase()}</span>
									<span className="db-list__meta">{timeAgo(o.createdAt)}</span>
									<span className="db-list__val">{fmt(o.orderTotal)}</span>
								</div>
							))
						) : (
							<p className="db-empty">No recent orders</p>
						)}
					</div>
				</div>

				{/* New Members */}
				<div className="db-card">
					<div className="db-card__head">
						<h3 className="db-card__title">New Members</h3>
					</div>
					<div className="db-list">
						{activity?.recentMembers?.length ? (
							activity.recentMembers.map((m: any) => (
								<div key={m._id} className="db-list__row">
									<div className="db-list__avatar">{m.memberNick?.[0]?.toUpperCase() ?? '?'}</div>
									<span className="db-list__name">{m.memberNick}</span>
									<span className="db-list__meta">{timeAgo(m.createdAt)}</span>
								</div>
							))
						) : (
							<p className="db-empty">No new members</p>
						)}
					</div>
				</div>

				{/* Recent Articles */}
				<div className="db-card">
					<div className="db-card__head">
						<h3 className="db-card__title">Recent Articles</h3>
					</div>
					<div className="db-list">
						{activity?.recentArticles?.length ? (
							activity.recentArticles.map((a: any) => (
								<div key={a._id} className="db-list__row">
									<span className="db-list__name">{a.articleTitle}</span>
									<span className="db-list__meta">{timeAgo(a.createdAt)}</span>
								</div>
							))
						) : (
							<p className="db-empty">No recent articles</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default withAdminLayout(Dashboard);
