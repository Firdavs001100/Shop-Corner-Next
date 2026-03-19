import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { OrderStatus, OrderPaymentStatus } from '../../../libs/enums/order.enum';
import { NEXT_PUBLIC_API_URL } from '../../../libs/config';
import { toastSmallSuccess, toastErrorHandling } from '../../../libs/toast';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_ORDERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_ORDER_BY_ADMIN } from '../../../apollo/admin/mutation';

const krw = new Intl.NumberFormat('ko-KR');
const fp = (n: number) => `₩${krw.format(n)}`;
const fd = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const ORDER_STATUS_META: Record<OrderStatus, { label: string; bg: string; color: string; dot: string }> = {
	[OrderStatus.PENDING]: { label: 'Pending', bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
	[OrderStatus.PAID]: { label: 'Paid', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
	[OrderStatus.SHIPPED]: { label: 'Shipped', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
	[OrderStatus.DELIVERED]: { label: 'Delivered', bg: '#ede9fe', color: '#6d28d9', dot: '#8b5cf6' },
	[OrderStatus.CANCELLED]: { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
	[OrderStatus.DELETE]: { label: 'Deleted', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
};

const PAYMENT_META: Record<OrderPaymentStatus, { label: string; bg: string; color: string; dot: string }> = {
	[OrderPaymentStatus.UNPAID]: { label: 'Unpaid', bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
	[OrderPaymentStatus.PAID]: { label: 'Paid', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
	[OrderPaymentStatus.REFUNDED]: { label: 'Refunded', bg: '#ede9fe', color: '#6d28d9', dot: '#8b5cf6' },
};

const Chip = ({ status, meta }: { status: string; meta: Record<string, any> }) => {
	const m = meta[status] ?? { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
	return (
		<span className="ao-chip" style={{ background: m.bg, color: m.color }}>
			<span className="ao-chip__dot" style={{ background: m.dot }} />
			{m.label}
		</span>
	);
};

const OrderDetailModal = ({
	order,
	onClose,
	onUpdateStatus,
	onUpdatePayment,
}: {
	order: any;
	onClose: () => void;
	onUpdateStatus: (id: string, s: OrderStatus) => void;
	onUpdatePayment: (id: string, s: OrderPaymentStatus) => void;
}) => (
	<div className="admin-modal-overlay" onClick={onClose}>
		<div className="ao-detail-modal" onClick={(e) => e.stopPropagation()}>
			<div className="ao-detail-modal__header">
				<div>
					<p className="ao-detail-modal__eyebrow">Order Details</p>
					<h3 className="ao-detail-modal__id">#{order._id.slice(-10).toUpperCase()}</h3>
					<p className="ao-detail-modal__date">{fd(order.createdAt)}</p>
				</div>
				<button className="ao-detail-modal__close" onClick={onClose}>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
			<div className="ao-detail-modal__body">
				<div className="ao-detail-modal__controls">
					<div className="ao-detail-modal__control-group">
						<label className="ao-detail-modal__control-label">Order Status</label>
						<div className="ao-select-wrap">
							<Chip status={order.orderStatus} meta={ORDER_STATUS_META} />
							<select
								className="ao-select-overlay"
								value={order.orderStatus}
								onChange={(e) => onUpdateStatus(order._id, e.target.value as OrderStatus)}
							>
								{Object.values(OrderStatus)
									.filter((s) => s !== OrderStatus.DELETE)
									.map((s) => (
										<option key={s} value={s}>
											{ORDER_STATUS_META[s].label}
										</option>
									))}
							</select>
						</div>
					</div>
					<div className="ao-detail-modal__control-group">
						<label className="ao-detail-modal__control-label">Payment Status</label>
						<div className="ao-select-wrap">
							<Chip status={order.orderPaymentStatus} meta={PAYMENT_META} />
							<select
								className="ao-select-overlay"
								value={order.orderPaymentStatus}
								onChange={(e) => onUpdatePayment(order._id, e.target.value as OrderPaymentStatus)}
							>
								{Object.values(OrderPaymentStatus).map((s) => (
									<option key={s} value={s}>
										{PAYMENT_META[s].label}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
				<div className="ao-detail-modal__section">
					<p className="ao-detail-modal__section-title">Shipping Address</p>
					<p className="ao-detail-modal__address">{order.orderShippingAddress?.fullAddress ?? '—'}</p>
				</div>
				<div className="ao-detail-modal__section">
					<p className="ao-detail-modal__section-title">Items ({order.orderItems?.length ?? 0})</p>
					<div className="ao-detail-modal__items">
						{order.orderItems?.map((item: any) => {
							const product = order.productData?.find((p: any) => p._id === item.productId);
							return (
								<div key={item._id} className="ao-detail-item">
									<div className="ao-detail-item__img-wrap">
										{product?.productImages?.[0] ? (
											<img src={`${NEXT_PUBLIC_API_URL}/${product.productImages[0]}`} alt={product.productName} />
										) : (
											<div className="ao-detail-item__img-placeholder">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.5"
												>
													<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
												</svg>
											</div>
										)}
									</div>
									<div className="ao-detail-item__info">
										<p className="ao-detail-item__name">{product?.productName ?? 'Product'}</p>
										<div className="ao-detail-item__attrs">
											{item.itemSize && <span className="ao-detail-item__attr">{item.itemSize}</span>}
											{item.itemColor && <span className="ao-detail-item__attr">{item.itemColor}</span>}
											<span className="ao-detail-item__attr">×{item.itemQuantity}</span>
										</div>
									</div>
									<span className="ao-detail-item__price">{fp(item.itemPrice * item.itemQuantity)}</span>
								</div>
							);
						})}
					</div>
				</div>
				<div className="ao-detail-modal__summary">
					<div className="ao-detail-modal__summary-row">
						<span>Subtotal</span>
						<span>{fp(order.orderTotal - order.orderDelivery)}</span>
					</div>
					<div className="ao-detail-modal__summary-row">
						<span>Delivery</span>
						<span>{order.orderDelivery > 0 ? fp(order.orderDelivery) : 'Free'}</span>
					</div>
					<div className="ao-detail-modal__summary-row ao-detail-modal__summary-row--total">
						<span>Total</span>
						<span>{fp(order.orderTotal)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
);

const AdminOrders: NextPage = () => {
	const [page, setPage] = useState(1);
	const [orders, setOrders] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
	const [paymentFilter, setPaymentFilter] = useState<OrderPaymentStatus | ''>('');
	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
	const LIMIT = 10;

	const { data, loading, refetch } = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page,
				limit: LIMIT,
				search: {
					...(statusFilter && { orderStatus: [statusFilter] }),
					...(paymentFilter && { orderPaymentStatus: [paymentFilter] }),
				},
			},
		},
	});

	useEffect(() => {
		if (data) {
			setOrders(data?.getAllOrdersByAdmin?.list ?? []);
			setTotal(data?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0);
		}
	}, [data]);
	useEffect(() => {
		setPage(1);
	}, [statusFilter, paymentFilter]);

	const [updateOrder] = useMutation(UPDATE_ORDER_BY_ADMIN);

	const handleUpdateStatus = async (id: string, orderStatus: OrderStatus) => {
		try {
			await updateOrder({ variables: { input: { _id: id, orderStatus } } });
			toastSmallSuccess('Updated', 800);
			setOrders((p) => p.map((o) => (o._id === id ? { ...o, orderStatus } : o)));
			if (selectedOrder?._id === id) setSelectedOrder((p: any) => ({ ...p, orderStatus }));
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const handleUpdatePayment = async (id: string, orderPaymentStatus: OrderPaymentStatus) => {
		try {
			await updateOrder({ variables: { input: { _id: id, orderPaymentStatus } } });
			toastSmallSuccess('Updated', 800);
			setOrders((p) => p.map((o) => (o._id === id ? { ...o, orderPaymentStatus } : o)));
			if (selectedOrder?._id === id) setSelectedOrder((p: any) => ({ ...p, orderPaymentStatus }));
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const totalPages = Math.ceil(total / LIMIT);

	return (
		<div className="admin-section">
			<div className="ap-page-header">
				<div>
					<h1 className="ap-page-header__title">Orders</h1>
					<p className="ap-page-header__sub">
						View and manage customer orders
						{total > 0 && <span className="ap-page-header__accent"> · {total} orders</span>}
					</p>
				</div>
			</div>

			<div className="ap-toolbar">
				<div className="ap-toolbar__filters" style={{ marginLeft: 0 }}>
					<select
						className="ap-filter-select"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
					>
						<option value="">All Statuses</option>
						{Object.values(OrderStatus)
							.filter((s) => s !== OrderStatus.DELETE)
							.map((s) => (
								<option key={s} value={s}>
									{ORDER_STATUS_META[s].label}
								</option>
							))}
					</select>
					<select
						className="ap-filter-select"
						value={paymentFilter}
						onChange={(e) => setPaymentFilter(e.target.value as OrderPaymentStatus | '')}
					>
						<option value="">All Payments</option>
						{Object.values(OrderPaymentStatus).map((s) => (
							<option key={s} value={s}>
								{PAYMENT_META[s].label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="ap-table-card">
				{loading ? (
					<div className="ap-skeleton">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="ap-skeleton__row" style={{ animationDelay: `${i * 0.06}s` }} />
						))}
					</div>
				) : (
					<div className="ap-table-scroll">
						<table className="ap-table">
							<thead>
								<tr>
									<th>Order ID</th>
									<th>Items</th>
									<th>Total</th>
									<th>Delivery</th>
									<th>Address</th>
									<th>Order Status</th>
									<th>Payment</th>
									<th>Date</th>
									<th style={{ textAlign: 'right' }}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{orders.length === 0 ? (
									<tr>
										<td colSpan={9}>
											<div className="ap-empty">
												<div className="ap-empty__icon">
													<svg
														width="32"
														height="32"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
														<line x1="3" y1="6" x2="21" y2="6" />
														<path d="M16 10a4 4 0 0 1-8 0" />
													</svg>
												</div>
												<p className="ap-empty__title">No orders found</p>
												<p className="ap-empty__sub">Orders will appear here once customers start purchasing</p>
											</div>
										</td>
									</tr>
								) : (
									orders.map((o) => (
										<tr key={o._id} className="ap-table__row">
											<td>
												<span className="ao-id-cell">#{o._id.slice(-8).toUpperCase()}</span>
											</td>
											<td>
												<div className="ao-items-preview">
													{o.productData?.slice(0, 3).map((p: any, i: number) => (
														<div key={i} className="ao-items-preview__img-wrap">
															{p.productImages?.[0] ? (
																<img src={`${NEXT_PUBLIC_API_URL}/${p.productImages[0]}`} alt={p.productName} />
															) : (
																<div className="ao-items-preview__placeholder" />
															)}
														</div>
													))}
													{(o.orderItems?.length ?? 0) > 3 && (
														<span className="ao-items-preview__more">+{o.orderItems.length - 3}</span>
													)}
													<span className="ao-items-preview__count">
														{o.orderItems?.length ?? 0} item{(o.orderItems?.length ?? 0) !== 1 ? 's' : ''}
													</span>
												</div>
											</td>
											<td>
												<span className="ao-total-cell">{fp(o.orderTotal)}</span>
											</td>
											<td>
												<span className="ap-num-cell">
													{o.orderDelivery > 0 ? (
														fp(o.orderDelivery)
													) : (
														<span style={{ color: '#15803d', fontWeight: 700 }}>Free</span>
													)}
												</span>
											</td>
											<td>
												<span className="ao-address-cell">{o.orderShippingAddress?.fullAddress ?? '—'}</span>
											</td>
											<td>
												<div className="ao-select-wrap">
													<Chip status={o.orderStatus} meta={ORDER_STATUS_META} />
													<select
														className="ao-select-overlay"
														value={o.orderStatus}
														onChange={(e) => handleUpdateStatus(o._id, e.target.value as OrderStatus)}
													>
														{Object.values(OrderStatus)
															.filter((s) => s !== OrderStatus.DELETE)
															.map((s) => (
																<option key={s} value={s}>
																	{ORDER_STATUS_META[s].label}
																</option>
															))}
													</select>
												</div>
											</td>
											<td>
												<div className="ao-select-wrap">
													<Chip status={o.orderPaymentStatus} meta={PAYMENT_META} />
													<select
														className="ao-select-overlay"
														value={o.orderPaymentStatus}
														onChange={(e) => handleUpdatePayment(o._id, e.target.value as OrderPaymentStatus)}
													>
														{Object.values(OrderPaymentStatus).map((s) => (
															<option key={s} value={s}>
																{PAYMENT_META[s].label}
															</option>
														))}
													</select>
												</div>
											</td>
											<td>
												<span className="ap-date-cell">{fd(o.createdAt)}</span>
											</td>
											<td>
												<div className="ap-row-actions">
													<button className="ap-row-btn ap-row-btn--edit" onClick={() => setSelectedOrder(o)}>
														<svg
															width="13"
															height="13"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
															<circle cx="12" cy="12" r="3" />
														</svg>
														View
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{totalPages > 1 && (
				<div className="ap-pagination">
					<button className="ap-pagination__nav" disabled={page === 1} onClick={() => setPage(page - 1)}>
						← Prev
					</button>
					<div className="ap-pagination__pages">
						{[...Array(totalPages)].map((_, i) => (
							<button
								key={i}
								className={`ap-pagination__page ${page === i + 1 ? 'ap-pagination__page--active' : ''}`}
								onClick={() => setPage(i + 1)}
							>
								{i + 1}
							</button>
						))}
					</div>
					<button className="ap-pagination__nav" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
						Next →
					</button>
				</div>
			)}

			{selectedOrder && (
				<OrderDetailModal
					order={selectedOrder}
					onClose={() => setSelectedOrder(null)}
					onUpdateStatus={handleUpdateStatus}
					onUpdatePayment={handleUpdatePayment}
				/>
			)}
		</div>
	);
};

export default withAdminLayout(AdminOrders);
