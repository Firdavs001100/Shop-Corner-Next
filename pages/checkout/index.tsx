import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReactiveVar, useMutation } from '@apollo/client';
import { cartVar, CartItem, userVar } from '../../apollo/store';
import { clearCart } from '../../apollo/actions/cartActions';
import { CREATE_ORDER } from '../../apollo/user/mutation';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { formatSize } from '../../libs/utils';
import { toastErrorHandling, toastSmallSuccess } from '../../libs/toast';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const krw = new Intl.NumberFormat('ko-KR');
const FLAT_SHIPPING = 10000;
const FREE_SHIPPING_GOAL = 200000;

type AddressMode = 'saved' | 'custom';

const CheckoutPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const cart = useReactiveVar(cartVar);
	const user = useReactiveVar(userVar);

	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [mounted, setMounted] = useState(false);
	const [notes, setNotes] = useState('');
	const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
	const [submitting, setSubmitting] = useState(false);
	const [addressMode, setAddressMode] = useState<AddressMode>('saved');
	const [customAddress, setCustomAddress] = useState('');
	const customInputRef = useRef<HTMLInputElement>(null);

	const [createOrder] = useMutation(CREATE_ORDER);

	useEffect(() => {
		setMounted(true);
		setCartItems(cart);
	}, [cart]);

	if (!mounted) return null;

	const savedAddress = user?.memberAddress ?? '';
	const hasSavedAddress = savedAddress.trim().length > 0;

	// If no saved address, default to custom mode
	const effectiveMode = hasSavedAddress ? addressMode : 'custom';
	const finalAddress = effectiveMode === 'saved' ? savedAddress : customAddress;
	const isAddressValid = finalAddress.trim().length > 0;

	const subtotal = cartItems.reduce((a, c) => a + c.quantity * c.price, 0);
	const shipping = subtotal >= FREE_SHIPPING_GOAL ? 0 : FLAT_SHIPPING;
	const total = subtotal + shipping;

	const handlePlaceOrder = async () => {
		if (!isAddressValid || cartItems.length === 0) return;
		setSubmitting(true);
		try {
			const orderItems = cartItems.map((item) => ({
				productId: item._id,
				itemQuantity: item.quantity,
				itemSize: item.size ?? '',
				itemColor: item.color ?? '',
			}));

			await createOrder({ variables: { input: orderItems } });

			clearCart();
			toastSmallSuccess('Order placed successfully!', 1000);
			router.push({ pathname: '/mypage', query: { category: 'myOrders' } });
		} catch (err: any) {
			toastErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	const handleSaveInProfile = () => {
		if (!user?._id) {
			router.push({ pathname: router.pathname, query: { ...router.query, auth: 'login' } });
		} else {
			router.push({ pathname: '/mypage', query: { category: 'myProfile' } });
		}
	};

	const isValid = isAddressValid && cartItems.length > 0;

	// ── Address section ──────────────────────────────────────────────────────

	const AddressSection = () => (
		<div className="co-address-section">
			{/* Option tabs */}
			<div className="co-address-tabs">
				{hasSavedAddress && (
					<button
						className={`co-address-tab ${effectiveMode === 'saved' ? 'co-address-tab--active' : ''}`}
						onClick={() => setAddressMode('saved')}
					>
						<LocationOnOutlinedIcon sx={{ fontSize: 15 }} />
						Saved Address
					</button>
				)}
				<button
					className={`co-address-tab ${effectiveMode === 'custom' ? 'co-address-tab--active' : ''}`}
					onClick={() => {
						setAddressMode('custom');
						setTimeout(() => customInputRef.current?.focus(), 0);
					}}
				>
					<AddLocationAltOutlinedIcon sx={{ fontSize: 15 }} />
					{hasSavedAddress ? 'Use Different Address' : 'Enter Address'}
				</button>
			</div>

			{/* Saved address display */}
			{effectiveMode === 'saved' && hasSavedAddress && (
				<div className="co-address-display">
					<LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#8a94a6' }} />
					<span className="co-address-display__value">{savedAddress}</span>
				</div>
			)}

			{/* Custom address input */}
			{effectiveMode === 'custom' && (
				<div className="co-address-input-wrap">
					{!hasSavedAddress && (
						<div className="co-no-address-hint">
							<WarningAmberOutlinedIcon sx={{ fontSize: 16 }} />
							<span>
								No saved address found. You can enter one below or{' '}
								<button className="co-no-address-hint__link" onClick={handleSaveInProfile}>
									save it in your profile
								</button>
								.
							</span>
						</div>
					)}
					<input
						className="co-address-input"
						type="text"
						placeholder="Enter your full delivery address"
						value={customAddress}
						onChange={(e) => setCustomAddress(e.target.value)}
					/>
				</div>
			)}
		</div>
	);

	// ── MOBILE ──────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div id="checkout-page" className="checkout-page--mobile">
				{/* Order summary */}
				<div className="co-mob-section">
					<h3 className="co-mob-section__title">
						<ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
						Order Summary
					</h3>
					<div className="co-mob-items">
						{cartItems.map((item) => (
							<div key={item.size ? `${item._id}_${item.size}` : item._id} className="co-mob-item">
								<img className="co-mob-item__img" src={item.image} alt={item.name} />
								<div className="co-mob-item__info">
									<span className="co-mob-item__name">{item.name}</span>
									{(item.size || item.color) && (
										<div className="co-mob-item__badges">
											{item.size && <span className="co-mob-item__badge">{formatSize(item.size)}</span>}
											{item.color && (
												<span className="co-mob-item__badge co-mob-item__badge--color">
													<span
														className="co-mob-item__color-dot"
														style={{ backgroundColor: item.color.toLowerCase() }}
													/>
													{item.color}
												</span>
											)}
										</div>
									)}
									<span className="co-mob-item__qty">Qty: {item.quantity}</span>
								</div>
								<span className="co-mob-item__price">₩{krw.format(item.price * item.quantity)}</span>
							</div>
						))}
					</div>
					<div className="co-mob-totals">
						<div className="co-mob-totals__row">
							<span>Subtotal</span>
							<span>₩{krw.format(subtotal)}</span>
						</div>
						<div className="co-mob-totals__row">
							<span>Shipping</span>
							<span>
								{shipping === 0 ? <span className="co-mob-totals__free">Free</span> : `₩${krw.format(shipping)}`}
							</span>
						</div>
						<div className="co-mob-totals__divider" />
						<div className="co-mob-totals__row co-mob-totals__row--total">
							<span>Total</span>
							<span>₩{krw.format(total)}</span>
						</div>
					</div>
				</div>

				{/* Shipping address */}
				<div className="co-mob-section">
					<h3 className="co-mob-section__title">
						<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
						Shipping Address
					</h3>
					<AddressSection />
					<div className="co-mob-form__field">
						<label className="co-mob-form__label">Order Notes (optional)</label>
						<textarea
							className="co-mob-form__textarea"
							placeholder="Special instructions for delivery..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				{/* Payment */}
				<div className="co-mob-section">
					<h3 className="co-mob-section__title">
						<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
						Payment Method
					</h3>
					<div className="co-mob-payment">
						<label className="co-mob-payment__option">
							<input
								type="radio"
								name="payment"
								checked={paymentMethod === 'cash'}
								onChange={() => setPaymentMethod('cash')}
							/>
							<span>Cash on Delivery</span>
						</label>
						<label className="co-mob-payment__option">
							<input
								type="radio"
								name="payment"
								checked={paymentMethod === 'card'}
								onChange={() => setPaymentMethod('card')}
							/>
							<span>Credit / Debit Card</span>
						</label>
					</div>
				</div>

				<button className="co-mob-place-btn" onClick={handlePlaceOrder} disabled={!isValid || submitting}>
					{submitting ? 'Placing Order...' : 'Place Order'}
					{!submitting && <ArrowForwardIcon sx={{ fontSize: 16 }} />}
				</button>
			</div>
		);
	}

	// ── DESKTOP ──────────────────────────────────────────────────────────────

	return (
		<div id="checkout-page">
			<div className="container">
				<div className="co-layout">
					{/* ── LEFT: Form ── */}
					<div className="co-left">
						{/* Shipping address */}
						<div className="co-section">
							<div className="co-section__header">
								<div className="co-section__header-icon">
									<LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
								</div>
								<div>
									<h3 className="co-section__title">Shipping Address</h3>
									<p className="co-section__sub">Use your saved address or enter a different one</p>
								</div>
							</div>
							<AddressSection />
							<div className="co-form">
								<div className="co-form__field co-form__field--full">
									<label className="co-form__label">
										Order Notes <span className="co-form__optional">(optional)</span>
									</label>
									<textarea
										className="co-form__textarea"
										placeholder="Special instructions, delivery preferences, or any notes for the courier..."
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										rows={3}
									/>
								</div>
							</div>
						</div>

						{/* Payment method */}
						<div className="co-section">
							<div className="co-section__header">
								<div className="co-section__header-icon">
									<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
								</div>
								<div>
									<h3 className="co-section__title">Payment Method</h3>
									<p className="co-section__sub">Choose how you'd like to pay</p>
								</div>
							</div>
							<div className="co-payment">
								<label className={`co-payment__option ${paymentMethod === 'cash' ? 'co-payment__option--active' : ''}`}>
									<input
										type="radio"
										name="payment"
										checked={paymentMethod === 'cash'}
										onChange={() => setPaymentMethod('cash')}
									/>
									<div className="co-payment__option-content">
										<span className="co-payment__option-title">Cash on Delivery</span>
										<span className="co-payment__option-desc">Pay when your order arrives</span>
									</div>
								</label>
								<label className={`co-payment__option ${paymentMethod === 'card' ? 'co-payment__option--active' : ''}`}>
									<input
										type="radio"
										name="payment"
										checked={paymentMethod === 'card'}
										onChange={() => setPaymentMethod('card')}
									/>
									<div className="co-payment__option-content">
										<span className="co-payment__option-title">Credit / Debit Card</span>
										<span className="co-payment__option-desc">Visa, Mastercard, and more</span>
									</div>
								</label>
							</div>
						</div>
					</div>

					{/* ── RIGHT: Order summary ── */}
					<div className="co-right">
						<div className="co-summary">
							<div className="co-summary__header">
								<ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
								<h3 className="co-summary__title">Order Summary</h3>
							</div>

							<div className="co-summary__items">
								{cartItems.map((item) => (
									<div key={item.size ? `${item._id}_${item.size}` : item._id} className="co-summary__item">
										<div className="co-summary__item-img-wrap">
											<img className="co-summary__item-img" src={item.image} alt={item.name} />
											<span className="co-summary__item-qty">{item.quantity}</span>
										</div>
										<div className="co-summary__item-info">
											<span className="co-summary__item-name">{item.name}</span>
											{(item.size || item.color) && (
												<div className="co-summary__item-badges">
													{item.size && <span className="co-summary__badge">{formatSize(item.size)}</span>}
													{item.color && (
														<span className="co-summary__badge co-summary__badge--color">
															<span
																className="co-summary__color-dot"
																style={{ backgroundColor: item.color.toLowerCase() }}
															/>
															{item.color}
														</span>
													)}
												</div>
											)}
										</div>
										<span className="co-summary__item-price">₩{krw.format(item.price * item.quantity)}</span>
									</div>
								))}
							</div>

							<div className="co-summary__divider" />

							<div className="co-summary__totals">
								<div className="co-summary__row">
									<span className="co-summary__label">Subtotal</span>
									<span className="co-summary__value">₩{krw.format(subtotal)}</span>
								</div>
								<div className="co-summary__row">
									<span className="co-summary__label">
										<LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />
										Shipping
									</span>
									<span className="co-summary__value">
										{shipping === 0 ? <span className="co-summary__free">Free</span> : `₩${krw.format(shipping)}`}
									</span>
								</div>
							</div>

							<div className="co-summary__divider" />

							<div className="co-summary__total-row">
								<span className="co-summary__total-label">Total</span>
								<span className="co-summary__total-value">₩{krw.format(total)}</span>
							</div>

							<button className="co-summary__place-btn" onClick={handlePlaceOrder} disabled={!isValid || submitting}>
								{submitting ? 'Placing Order...' : 'Place Order'}
							</button>

							{!isAddressValid && <p className="co-summary__warn">Please enter a delivery address to continue.</p>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(CheckoutPage);
