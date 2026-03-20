import React, { useState } from 'react';
import { NextPage } from 'next';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_ORDERS } from '../../../apollo/user/query';
import { UPDATE_ORDER } from '../../../apollo/user/mutation';
import { Order } from '../../types/order/order';
import { OrderStatus, OrderPaymentStatus } from '../../enums/order.enum';
import { T } from '../../types/common';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

const PAGE_SIZE = 5;

const formatDate = (date: Date) =>
	new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const krw = new Intl.NumberFormat('ko-KR');

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
	[OrderStatus.PENDING]: {
		label: 'Pending',
		color: '#b45309',
		bg: '#fffbeb',
		icon: <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />,
	},
	[OrderStatus.PAID]: {
		label: 'Paid',
		color: '#0369a1',
		bg: '#eff6ff',
		icon: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
	},
	[OrderStatus.SHIPPED]: {
		label: 'Shipped',
		color: '#6d28d9',
		bg: '#f5f3ff',
		icon: <LocalShippingOutlinedIcon sx={{ fontSize: 13 }} />,
	},
	[OrderStatus.DELIVERED]: {
		label: 'Delivered',
		color: '#15803d',
		bg: '#f0fdf4',
		icon: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
	},
	[OrderStatus.CANCELLED]: {
		label: 'Cancelled',
		color: '#b91c1c',
		bg: '#fef2f2',
		icon: <CancelOutlinedIcon sx={{ fontSize: 13 }} />,
	},
	[OrderStatus.DELETE]: {
		label: 'Deleted',
		color: '#6b7280',
		bg: '#f9fafb',
		icon: <CancelOutlinedIcon sx={{ fontSize: 13 }} />,
	},
};

const PAYMENT_CONFIG: Record<OrderPaymentStatus, { label: string; color: string; bg: string }> = {
	[OrderPaymentStatus.UNPAID]: { label: 'Unpaid', color: '#b45309', bg: '#fffbeb' },
	[OrderPaymentStatus.PAID]: { label: 'Paid', color: '#15803d', bg: '#f0fdf4' },
	[OrderPaymentStatus.REFUNDED]: { label: 'Refunded', color: '#6d28d9', bg: '#f5f3ff' },
};

// ── Order card ────────────────────────────────────────────────────────────────

const OrderCard = ({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) => {
	const [expanded, setExpanded] = useState(false);

	const statusCfg = STATUS_CONFIG[order.orderStatus];
	const paymentCfg = PAYMENT_CONFIG[order.orderPaymentStatus];
	const canCancel = order.orderStatus === OrderStatus.PENDING;

	return (
		<div className={`mo-card ${expanded ? 'mo-card--expanded' : ''}`}>
			{/* ── Summary row ── */}
			<div className="mo-card__summary" onClick={() => setExpanded((v) => !v)}>
				<div className="mo-card__summary-left">
					<div className="mo-card__id">
						<span className="mo-card__id-label">Order</span>
						<span className="mo-card__id-value">#{order._id.slice(-8).toUpperCase()}</span>
					</div>
					<div className="mo-card__meta">
						<span className="mo-card__date">{formatDate(order.createdAt)}</span>
						{order.orderShippingAddress?.fullAddress && (
							<span className="mo-card__address">
								<LocationOnOutlinedIcon sx={{ fontSize: 12 }} />
								{order.orderShippingAddress.fullAddress}
							</span>
						)}
					</div>
				</div>

				<div className="mo-card__summary-right">
					<span className="mo-card__status-badge" style={{ color: statusCfg.color, background: statusCfg.bg }}>
						{statusCfg.icon}
						{statusCfg.label}
					</span>
					<span className="mo-card__payment-badge" style={{ color: paymentCfg.color, background: paymentCfg.bg }}>
						{paymentCfg.label}
					</span>
					<span className="mo-card__total">₩{krw.format(order.orderTotal)}</span>
					<button className="mo-card__toggle">
						{expanded ? <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
					</button>
				</div>
			</div>

			{/* ── Expanded items ── */}
			{expanded && (
				<div className="mo-card__body">
					<div className="mo-card__items">
						{order.productData?.map((product, idx) => {
							const orderItem = order.orderItems?.[idx];
							const img = product.productImages?.[0] ? `${NEXT_PUBLIC_API_URL}/${product.productImages[0]}` : null;
							return (
								<div key={product._id} className="mo-card__item">
									<div className="mo-card__item-img-wrap">
										{img ? (
											<img src={img} alt={product.productName} className="mo-card__item-img" />
										) : (
											<div className="mo-card__item-img-placeholder" />
										)}
									</div>
									<div className="mo-card__item-info">
										<span className="mo-card__item-name">{product.productName}</span>
										<div className="mo-card__item-meta">
											{orderItem?.itemSize && <span className="mo-card__item-badge">{orderItem.itemSize}</span>}
											{orderItem?.itemColor && (
												<span className="mo-card__item-badge mo-card__item-badge--color">
													<span
														className="mo-card__item-color-dot"
														style={{ backgroundColor: orderItem.itemColor.toLowerCase() }}
													/>
													{orderItem.itemColor}
												</span>
											)}
										</div>
									</div>
									<div className="mo-card__item-right">
										<span className="mo-card__item-qty">×{orderItem?.itemQuantity ?? 1}</span>
										<span className="mo-card__item-price">
											₩{krw.format((orderItem?.itemPrice ?? product.productPrice) * (orderItem?.itemQuantity ?? 1))}
										</span>
									</div>
								</div>
							);
						})}
					</div>

					<div className="mo-card__footer">
						<div className="mo-card__footer-totals">
							<div className="mo-card__footer-row">
								<span>Subtotal</span>
								<span>₩{krw.format(order.orderTotal - (order.orderDelivery ?? 0))}</span>
							</div>
							<div className="mo-card__footer-row">
								<span>Delivery</span>
								<span>{order.orderDelivery === 0 ? 'Free' : `₩${krw.format(order.orderDelivery)}`}</span>
							</div>
							<div className="mo-card__footer-row mo-card__footer-row--total">
								<span>Total</span>
								<span>₩{krw.format(order.orderTotal)}</span>
							</div>
						</div>

						{canCancel && (
							<button
								className="mo-card__cancel-btn"
								onClick={(e) => {
									e.stopPropagation();
									onCancel(order._id);
								}}
							>
								<CancelOutlinedIcon sx={{ fontSize: 15 }} />
								Cancel Order
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

// ── MyOrders ──────────────────────────────────────────────────────────────────

const MyOrders: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState(0);

	const [updateOrder] = useMutation(UPDATE_ORDER);

	const { refetch } = useQuery(GET_ORDERS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: 'DESC',
				search: {},
			},
		},
		skip: !user?._id,
		onCompleted: (data: T) => {
			setOrders(data?.getOrders?.list ?? []);
			setTotal(data?.getOrders?.metaCounter[0]?.total ?? 0);
		},
	});

	const handleCancel = async (orderId: string) => {
		if (!confirm('Are you sure you want to cancel this order?')) return;
		try {
			await updateOrder({
				variables: {
					input: {
						_id: orderId,
						orderStatus: OrderStatus.CANCELLED,
					},
				},
			});
			toastSmallSuccess('Order cancelled.', 800);
			await refetch();
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const totalPages = Math.ceil(total / PAGE_SIZE);

	// ── MOBILE ────────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div className="mo mo--mobile">
				<div className="mo__mob-header">
					<div className="mo__mob-header-left">
						<h2 className="mo__mob-title">My Orders</h2>
						<span className="mo__mob-count">{total}</span>
					</div>
				</div>

				{orders.length === 0 ? (
					<div className="mo__empty">
						<ReceiptLongOutlinedIcon sx={{ fontSize: 44 }} />
						<p>No orders yet.</p>
						<span>Your orders will appear here once you place one.</span>
					</div>
				) : (
					<div className="mo__list">
						{orders.map((order) => (
							<OrderCard key={order._id} order={order} onCancel={handleCancel} />
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="mo__pagination">
						<Pagination page={page} count={totalPages} onChange={(_, v) => setPage(v)} shape="rounded" size="small" />
					</div>
				)}
			</div>
		);
	}

	// ── DESKTOP ───────────────────────────────────────────────────────────────

	return (
		<div className="mo">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">Account</span>
					<h2 className="mp-page-bar__title">My Orders</h2>
					<p className="mp-page-bar__sub">Track and manage your purchases</p>
				</div>
				<div className="mp-page-bar__right">
					<div className="mp-page-bar__badge">
						<ReceiptLongOutlinedIcon sx={{ fontSize: 14 }} />
						{total}
					</div>
				</div>
			</div>

			{orders.length === 0 ? (
				<div className="mo__empty">
					<ReceiptLongOutlinedIcon sx={{ fontSize: 52 }} />
					<p>No orders yet.</p>
					<span>Your orders will appear here once you place one.</span>
				</div>
			) : (
				<div className="mo__list">
					{orders.map((order) => (
						<OrderCard key={order._id} order={order} onCancel={handleCancel} />
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mo__pagination">
					<Pagination page={page} count={totalPages} onChange={(_, v) => setPage(v)} shape="rounded" color="primary" />
				</div>
			)}
		</div>
	);
};

export default MyOrders;
