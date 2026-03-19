import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { cartVar, CartItem } from '../../apollo/store';
import { addToCart, removeFromCart, deleteFromCart } from '../../apollo/actions/cartActions';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { formatSize } from '../../libs/utils';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const krw = new Intl.NumberFormat('ko-KR');
const FREE_SHIPPING_GOAL = 200000;
const FLAT_SHIPPING = 10000;

const CartPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const cart = useReactiveVar(cartVar);

	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [mounted, setMounted] = useState(false);
	const [coupon, setCoupon] = useState('');

	useEffect(() => {
		setMounted(true);
		setCartItems(cart);
	}, [cart]);

	if (!mounted) return null;

	const subtotal = cartItems.reduce((a, c) => a + c.quantity * c.price, 0);
	const remaining = Math.max(FREE_SHIPPING_GOAL - subtotal, 0);
	const progress = Math.min((subtotal / FREE_SHIPPING_GOAL) * 100, 100);
	const shipping = remaining === 0 ? 0 : FLAT_SHIPPING;
	const total = subtotal + shipping;

	// ── MOBILE ──────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div id="cart-page" className="cart-page--mobile">
				{/* Free shipping bar */}
				<div className="cart-mob-shipping-bar">
					<p className="cart-mob-shipping-bar__text">
						{remaining > 0 ? (
							<>
								Buy <strong>₩{krw.format(remaining)}</strong> more for <strong>Free Shipping</strong>
							</>
						) : (
							<strong className="cart-mob-shipping-bar__achieved">🎉 Free Shipping unlocked!</strong>
						)}
					</p>
					<div className="cart-mob-shipping-bar__progress-wrap">
						<div className="cart-mob-shipping-bar__track">
							<div className="cart-mob-shipping-bar__fill" style={{ width: `${progress}%` }} />
						</div>
						<div className="cart-mob-shipping-bar__truck" style={{ left: `${Math.max(progress, 4)}%` }}>
							<LocalShippingIcon className="cart-truck-icon" />
						</div>
					</div>
				</div>

				{cartItems.length === 0 ? (
					<div className="cart-mob-empty">
						<ShoppingBagOutlinedIcon sx={{ fontSize: 56 }} />
						<h3 className="cart-mob-empty__title">Your cart is empty</h3>
						<p className="cart-mob-empty__sub">Looks like you haven't added anything yet.</p>
						<button className="cart-mob-empty__btn" onClick={() => router.push('/shop')}>
							Continue Shopping
						</button>
					</div>
				) : (
					<>
						<div className="cart-mob-items">
							{cartItems.map((item) => (
								<div key={item.size ? `${item._id}_${item.size}` : item._id} className="cart-mob-item">
									<img className="cart-mob-item__img" src={item.image} alt={item.name} />
									<div className="cart-mob-item__info">
										<span className="cart-mob-item__name">{item.name}</span>
										{(item.size || item.color) && (
											<div className="cart-mob-item__badges">
												{item.size && <span className="cart-mob-item__badge">{formatSize(item.size)}</span>}
												{item.color && (
													<span className="cart-mob-item__badge cart-mob-item__badge--color">
														<span
															className="cart-mob-item__color-dot"
															style={{ backgroundColor: item.color.toLowerCase() }}
														/>
														{item.color}
													</span>
												)}
											</div>
										)}
										<span className="cart-mob-item__price">₩{krw.format(item.price * item.quantity)}</span>
										<div className="cart-mob-item__qty">
											<button
												className="cart-mob-item__qty-btn"
												onClick={() => removeFromCart(item._id, item.size, item.color)}
												disabled={item.quantity <= 1}
											>
												<RemoveIcon sx={{ fontSize: 14 }} />
											</button>
											<span className="cart-mob-item__qty-val">{item.quantity}</span>
											<button className="cart-mob-item__qty-btn" onClick={() => addToCart(item)}>
												<AddIcon sx={{ fontSize: 14 }} />
											</button>
										</div>
									</div>
									<button
										className="cart-mob-item__delete"
										onClick={() => deleteFromCart(item._id, item.size, item.color)}
									>
										<DeleteOutlineIcon sx={{ fontSize: 18 }} />
									</button>
								</div>
							))}
						</div>

						{/* Coupon */}
						<div className="cart-mob-coupon">
							<input
								className="cart-mob-coupon__input"
								type="text"
								placeholder="Coupon code"
								value={coupon}
								onChange={(e) => setCoupon(e.target.value)}
							/>
							<button className="cart-mob-coupon__btn">Apply</button>
						</div>

						{/* Summary */}
						<div className="cart-mob-summary">
							<h3 className="cart-mob-summary__title">Cart Totals</h3>
							<div className="cart-mob-summary__row">
								<span>Subtotal</span>
								<span>₩{krw.format(subtotal)}</span>
							</div>
							<div className="cart-mob-summary__row">
								<span>Shipping</span>
								<span>
									{shipping === 0 ? <span className="cart-mob-summary__free">Free</span> : `₩${krw.format(shipping)}`}
								</span>
							</div>
							<div className="cart-mob-summary__divider" />
							<div className="cart-mob-summary__row cart-mob-summary__row--total">
								<span>Total</span>
								<span>₩{krw.format(total)}</span>
							</div>
							<button className="cart-mob-summary__checkout-btn" onClick={() => router.push('/checkout')}>
								Proceed to Checkout <ArrowForwardIcon sx={{ fontSize: 16 }} />
							</button>
						</div>
					</>
				)}
			</div>
		);
	}

	// ── DESKTOP ──────────────────────────────────────────────────────────────

	return (
		<div id="cart-page">
			<div className="container">
				{/* Free shipping progress bar */}
				<div className="cart-shipping-bar">
					<p className="cart-shipping-bar__text">
						{remaining > 0 ? (
							<>
								Buy <strong>₩{krw.format(remaining)}</strong> more to get <strong>Free Shipping</strong>
							</>
						) : (
							<strong className="cart-shipping-bar__achieved">🎉 You've unlocked Free Shipping!</strong>
						)}
					</p>
					<div className="cart-shipping-bar__progress-wrap">
						<div className="cart-shipping-bar__track">
							<div className="cart-shipping-bar__fill" style={{ width: `${progress}%` }} />
						</div>
						<div className="cart-shipping-bar__truck" style={{ left: `${Math.max(progress, 2)}%` }}>
							<LocalShippingIcon className="cart-truck-icon" />
						</div>
					</div>
				</div>

				{cartItems.length === 0 ? (
					<div className="cart-empty">
						<ShoppingBagOutlinedIcon sx={{ fontSize: 64 }} />
						<h3 className="cart-empty__title">Your cart is empty</h3>
						<p className="cart-empty__sub">Looks like you haven't added anything to your cart yet.</p>
						<button className="cart-empty__btn" onClick={() => router.push('/shop')}>
							Continue Shopping
						</button>
					</div>
				) : (
					<div className="cart-layout">
						{/* ── LEFT: items table ── */}
						<div className="cart-left">
							<div className="cart-table">
								<div className="cart-table__head">
									<span className="cart-table__head-cell cart-table__head-cell--product">Product</span>
									<span className="cart-table__head-cell">Price</span>
									<span className="cart-table__head-cell">Quantity</span>
									<span className="cart-table__head-cell">Subtotal</span>
									<span className="cart-table__head-cell" />
								</div>

								{cartItems.map((item) => (
									<div key={item.size ? `${item._id}_${item.size}` : item._id} className="cart-table__row">
										{/* Product */}
										<div className="cart-table__cell cart-table__cell--product">
											<img className="cart-table__img" src={item.image} alt={item.name} />
											<div className="cart-table__product-info">
												<span className="cart-table__product-name">{item.name}</span>
												{(item.size || item.color) && (
													<div className="cart-table__badges">
														{item.size && <span className="cart-table__badge">{formatSize(item.size)}</span>}
														{item.color && (
															<span className="cart-table__badge cart-table__badge--color">
																<span
																	className="cart-table__color-dot"
																	style={{ backgroundColor: item.color.toLowerCase() }}
																/>
																{item.color}
															</span>
														)}
													</div>
												)}
											</div>
										</div>

										{/* Price */}
										<div className="cart-table__cell">
											<span className="cart-table__price">₩{krw.format(item.price)}</span>
										</div>

										{/* Qty */}
										<div className="cart-table__cell">
											<div className="cart-table__qty">
												<button
													className="cart-table__qty-btn"
													onClick={() => removeFromCart(item._id, item.size, item.color)}
													disabled={item.quantity <= 1}
												>
													<RemoveIcon sx={{ fontSize: 14 }} />
												</button>
												<span className="cart-table__qty-val">{item.quantity}</span>
												<button className="cart-table__qty-btn" onClick={() => addToCart(item)}>
													<AddIcon sx={{ fontSize: 14 }} />
												</button>
											</div>
										</div>

										{/* Subtotal */}
										<div className="cart-table__cell">
											<span className="cart-table__subtotal">₩{krw.format(item.price * item.quantity)}</span>
										</div>

										{/* Delete */}
										<div className="cart-table__cell cart-table__cell--action">
											<button
												className="cart-table__delete"
												onClick={() => deleteFromCart(item._id, item.size, item.color)}
											>
												<DeleteOutlineIcon sx={{ fontSize: 20 }} />
											</button>
										</div>
									</div>
								))}
							</div>

							{/* Coupon row */}
							<div className="cart-actions">
								<div className="cart-coupon">
									<input
										className="cart-coupon__input"
										type="text"
										placeholder="Coupon code"
										value={coupon}
										onChange={(e) => setCoupon(e.target.value)}
									/>
									<button className="cart-coupon__btn">Apply Coupon</button>
								</div>
							</div>
						</div>

						{/* ── RIGHT: totals panel ── */}
						<div className="cart-right">
							<div className="cart-totals">
								<h3 className="cart-totals__title">Cart Totals</h3>

								<div className="cart-totals__row">
									<span className="cart-totals__label">Subtotal</span>
									<span className="cart-totals__value">₩{krw.format(subtotal)}</span>
								</div>

								<div className="cart-totals__divider" />

								<div className="cart-totals__section-title">
									<LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />
									Shipping
								</div>

								<div className="cart-totals__shipping-options">
									<label className="cart-totals__shipping-option">
										<input type="radio" name="shipping" defaultChecked />
										<span>Flat rate: ₩{krw.format(FLAT_SHIPPING)}</span>
									</label>
									<label className="cart-totals__shipping-option">
										<input type="radio" name="shipping" />
										<span>Free shipping {remaining > 0 ? `(₩${krw.format(remaining)} away)` : '✓'}</span>
									</label>
									<p className="cart-totals__shipping-note">Shipping options will be updated during checkout.</p>
								</div>

								<div className="cart-totals__divider" />

								<div className="cart-totals__row cart-totals__row--total">
									<span className="cart-totals__label">Total</span>
									<span className="cart-totals__total-value">₩{krw.format(total)}</span>
								</div>

								<button className="cart-totals__checkout-btn" onClick={() => router.push('/checkout')}>
									Proceed To Checkout
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(CartPage);
