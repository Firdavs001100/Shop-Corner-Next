import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { OrderPaymentStatus, OrderStatus } from '../../enums/order.enum';
import { Order } from '../../types/order/order';
import { NEXT_PUBLIC_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_ORDERS } from '../../../apollo/user/query';
import { UPDATE_ORDER } from '../../../apollo/user/mutation';

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconPackage = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M16.5 9.4 7.55 4.24" />
		<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
		<polyline points="3.29 7 12 12 20.71 7" />
		<line x1="12" y1="22" x2="12" y2="12" />
	</svg>
);
const IconTruck = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="1" y="3" width="15" height="13" />
		<polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
		<circle cx="5.5" cy="18.5" r="2.5" />
		<circle cx="18.5" cy="18.5" r="2.5" />
	</svg>
);
const IconCheck = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);
const IconX = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);
const IconClock = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
	>
		<polyline points="6 9 12 15 18 9" />
	</svg>
);
const IconMapPin = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
);
const IconCreditCard = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
		<line x1="1" y1="10" x2="23" y2="10" />
	</svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
	[OrderStatus.PENDING]: { label: 'Pending', color: '#92714a', bg: '#fdf4e7', icon: <IconClock /> },
	[OrderStatus.PAID]: { label: 'Paid', color: '#2a7d4f', bg: '#e8f8ef', icon: <IconCheck /> },
	[OrderStatus.SHIPPED]: { label: 'Shipped', color: '#1d5fa8', bg: '#e8f1fc', icon: <IconTruck /> },
	[OrderStatus.DELIVERED]: { label: 'Delivered', color: '#1e3a5f', bg: '#e8eef5', icon: <IconPackage /> },
	[OrderStatus.CANCELLED]: { label: 'Cancelled', color: '#b03030', bg: '#fce8e8', icon: <IconX /> },
	[OrderStatus.DELETE]: { label: 'Deleted', color: '#888', bg: '#f0f0f0', icon: <IconX /> },
};

const PAYMENT_META: Record<OrderPaymentStatus, { label: string; color: string }> = {
	[OrderPaymentStatus.UNPAID]: { label: 'Unpaid', color: '#b05c20' },
	[OrderPaymentStatus.PAID]: { label: 'Paid', color: '#2a7d4f' },
	[OrderPaymentStatus.REFUNDED]: { label: 'Refunded', color: '#6b3fa0' },
};

const TABS = [
	{ label: 'All', value: null },
	{ label: 'Pending', value: OrderStatus.PENDING },
	{ label: 'Paid', value: OrderStatus.PAID },
	{ label: 'Shipped', value: OrderStatus.SHIPPED },
	{ label: 'Delivered', value: OrderStatus.DELIVERED },
	{ label: 'Cancelled', value: OrderStatus.CANCELLED },
];

interface ExtendedOrderItem {
	_id: string;
	orderId: string;
	productId: string;
	itemQuantity: number;
	itemPrice: number;
	itemSize?: string;
	itemColor?: string;
	createdAt: Date;
	updatedAt: Date;
}

const formatDate = (d: Date) =>
	new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatPrice = (n: number) => `₩${n.toLocaleString()}`;

const buildInput = (page: number, limit: number, activeTab: OrderStatus | null) => ({
	page,
	limit,
	search: activeTab ? { orderStatus: [activeTab] } : {},
});

// ── OrderCard ─────────────────────────────────────────────────────────────────

interface OrderCardProps {
	order: Order;
	onCancel: (id: string) => void;
	onPay: (id: string) => void;
	mobile?: boolean;
}

const OrderCard = ({ order, onCancel, onPay, mobile = false }: OrderCardProps) => {
	const [expanded, setExpanded] = useState(false);
	const statusMeta = STATUS_META[order.orderStatus as OrderStatus] ?? STATUS_META[OrderStatus.PENDING];
	const payMeta =
		PAYMENT_META[order.orderPaymentStatus as OrderPaymentStatus] ?? PAYMENT_META[OrderPaymentStatus.UNPAID];

	const canCancel = order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.PAID;
	const canPay = order.orderStatus === OrderStatus.PENDING && order.orderPaymentStatus === OrderPaymentStatus.UNPAID;

	return (
		<div className={`order-card${mobile ? ' order-card--mobile' : ''}`}>
			{/* Header */}
			<div className="order-card__header" onClick={() => setExpanded((v) => !v)}>
				<div className="order-card__header-left">
					<div className="order-card__id">
						<span className="order-card__id-label">Order</span>
						<span className="order-card__id-value">#{order._id.slice(-8).toUpperCase()}</span>
					</div>
					<div className="order-card__meta">
						<span className="order-card__date">{formatDate(order.createdAt)}</span>
						<span className="order-card__sep">·</span>
						<span className="order-card__items-count">
							{order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? 's' : ''}
						</span>
					</div>
				</div>

				<div className="order-card__header-right">
					<div className="order-card__badges">
						<span className="order-card__status-badge" style={{ color: statusMeta.color, background: statusMeta.bg }}>
							{statusMeta.icon}
							{statusMeta.label}
						</span>
						{!mobile && (
							<span className="order-card__pay-badge" style={{ color: payMeta.color }}>
								{payMeta.label}
							</span>
						)}
					</div>
					<div className="order-card__total">{formatPrice(order.orderTotal)}</div>
					<div className="order-card__chevron">
						<IconChevron open={expanded} />
					</div>
				</div>
			</div>

			{/* Expanded Body */}
			<div className={`order-card__body ${expanded ? 'order-card__body--open' : ''}`}>
				<div className="order-card__body-inner">
					{/* Payment row on mobile */}
					{mobile && (
						<div className="order-card__pay-row">
							<span className="order-card__pay-label">Payment:</span>
							<span className="order-card__pay-badge" style={{ color: payMeta.color }}>
								{payMeta.label}
							</span>
						</div>
					)}

					{/* Items */}
					<div className="order-card__items">
						{(order.orderItems as ExtendedOrderItem[])?.map((item) => {
							const product = order.productData?.find((p) => p._id === item.productId);
							const img = product?.productImages?.[0]
								? `${NEXT_PUBLIC_API_URL}/${product.productImages[0]}`
								: '/img/default.png';
							const price =
								product?.isDiscounted && product?.productSalePrice
									? product.productSalePrice
									: product?.productPrice ?? item.itemPrice;

							return (
								<div className="order-item" key={item._id}>
									<div className="order-item__img-wrap">
										<img src={img} alt={product?.productName} className="order-item__img" />
									</div>
									<div className="order-item__info">
										<div className="order-item__name">{product?.productName ?? 'Product'}</div>
										<div className="order-item__attrs">
											{item.itemSize && <span className="order-item__attr">{item.itemSize}</span>}
											{item.itemColor && <span className="order-item__attr">{item.itemColor}</span>}
											<span className="order-item__attr">×{item.itemQuantity}</span>
										</div>
									</div>
									<div className="order-item__price">{formatPrice(price * item.itemQuantity)}</div>
								</div>
							);
						})}
					</div>

					{/* Footer */}
					<div className="order-card__footer">
						<div className="order-card__address">
							<IconMapPin />
							<span>{order.orderShippingAddress?.fullAddress ?? '—'}</span>
						</div>

						<div className="order-card__summary">
							<div className="order-card__summary-row">
								<span>Subtotal</span>
								<span>{formatPrice(order.orderTotal - order.orderDelivery)}</span>
							</div>
							<div className="order-card__summary-row">
								<span>Delivery</span>
								<span>{order.orderDelivery > 0 ? formatPrice(order.orderDelivery) : 'Free'}</span>
							</div>
							<div className="order-card__summary-row order-card__summary-row--total">
								<span>Total</span>
								<span>{formatPrice(order.orderTotal)}</span>
							</div>
						</div>

						<div className="order-card__actions">
							{canPay && (
								<button
									className="order-card__pay-btn"
									onClick={(e) => {
										e.stopPropagation();
										onPay(order._id);
									}}
								>
									<IconCreditCard />
									Pay Now
								</button>
							)}
							{canCancel && (
								<button
									className="order-card__cancel-btn"
									onClick={(e) => {
										e.stopPropagation();
										onCancel(order._id);
									}}
								>
									Cancel Order
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// ── Main Component ────────────────────────────────────────────────────────────

const MyOrders = () => {
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	const [activeTab, setActiveTab] = useState<OrderStatus | null>(null);
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const LIMIT = 5;

	const { data, loading, refetch } = useQuery(GET_ORDERS, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		variables: { input: buildInput(page, LIMIT, activeTab) },
	});

	// Sync data → state
	useEffect(() => {
		if (!data) return;
		setOrders(data?.getOrders?.list ?? []);
		setTotal(data?.getOrders?.metaCounter?.[0]?.total ?? 0);
	}, [data]);

	// Refetch when tab or page changes
	useEffect(() => {
		refetch({ input: buildInput(page, LIMIT, activeTab) });
	}, [activeTab, page]);

	const [updateOrder] = useMutation(UPDATE_ORDER);

	const handleCancel = async (orderId: string) => {
		try {
			await updateOrder({ variables: { input: { _id: orderId, orderStatus: OrderStatus.CANCELLED } } });
			refetch({ input: buildInput(page, LIMIT, activeTab) });
		} catch (e) {
			console.error(e);
		}
	};

	const handlePay = async (orderId: string) => {
		try {
			await updateOrder({ variables: { input: { _id: orderId, orderPaymentStatus: OrderPaymentStatus.PAID } } });
			refetch({ input: buildInput(page, LIMIT, activeTab) });
		} catch (e) {
			console.error(e);
		}
	};

	const totalPages = Math.ceil(total / LIMIT);

	// ── Shared blocks ─────────────────────────────────────────────────────────

	const tabsBlock = (
		<div className="my-orders__tabs">
			{TABS.map((tab) => (
				<button
					key={tab.label}
					className={`my-orders__tab ${activeTab === tab.value ? 'my-orders__tab--active' : ''}`}
					onClick={() => {
						setActiveTab(tab.value as OrderStatus | null);
						setPage(1);
					}}
				>
					{tab.label}
				</button>
			))}
		</div>
	);

	const contentBlock = loading ? (
		<div className="my-orders__loading">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="my-orders__skeleton" />
			))}
		</div>
	) : orders.length === 0 ? (
		<div className="my-orders__empty">
			<div className="my-orders__empty-icon">
				<IconPackage />
			</div>
			<div className="my-orders__empty-title">No orders yet</div>
			<span className="my-orders__empty-sub">
				{activeTab ? `No ${activeTab.toLowerCase()} orders found.` : "You haven't placed any orders."}
			</span>
		</div>
	) : (
		<div className="my-orders__list">
			{orders.map((order) => (
				<OrderCard key={order._id} order={order} onCancel={handleCancel} onPay={handlePay} mobile={isMobile} />
			))}
		</div>
	);

	const paginationBlock = totalPages > 1 && (
		<div className="my-orders__pagination">
			{[...Array(totalPages)].map((_, i) => (
				<button
					key={i}
					className={`my-orders__page-btn ${page === i + 1 ? 'my-orders__page-btn--active' : ''}`}
					onClick={() => setPage(i + 1)}
				>
					{i + 1}
				</button>
			))}
		</div>
	);

	// ── MOBILE ────────────────────────────────────────────────────────────────

	if (isMobile) {
		return (
			<div className="my-orders my-orders--mobile">
				<div className="my-orders__mob-header">
					<div className="my-orders__mob-header-left">
						<IconPackage />
						<h2 className="my-orders__mob-title">My Orders</h2>
					</div>
					{total > 0 && <span className="my-orders__mob-count">{total}</span>}
				</div>
				{tabsBlock}
				{contentBlock}
				{paginationBlock}
			</div>
		);
	}

	// ── DESKTOP ───────────────────────────────────────────────────────────────

	return (
		<div className="my-orders">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">Account</span>
					<h2 className="mp-page-bar__title">My Orders</h2>
					<div className="mp-page-bar__sub">Track and manage your purchases</div>
				</div>
				{total > 0 && (
					<div className="my-orders__badge">
						<IconPackage />
						{total} order{total !== 1 ? 's' : ''}
					</div>
				)}
			</div>
			{tabsBlock}
			{contentBlock}
			{paginationBlock}
		</div>
	);
};

export default MyOrders;
