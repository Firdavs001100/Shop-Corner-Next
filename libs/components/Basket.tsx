import React from 'react';
import { Box, Drawer, IconButton, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { cartVar } from '../../apollo/store';
import { addToCart, removeFromCart, deleteFromCart, clearCart } from '../../apollo/actions/cartActions';
import { formatSize } from '../utils';
import { SadBagSVG } from './icons/SadBagSVG';
import { TruckSVG } from './icons/TruckSVG';

const krw = new Intl.NumberFormat('ko-KR');

interface BasketProps {
	isOpen: boolean;
	onClose: () => void;
}

const FREE_SHIPPING_GOAL = 200000;

export default function Basket({ isOpen, onClose }: BasketProps) {
	const router = useRouter();
	const cartItems = useReactiveVar(cartVar);

	const itemsPrice = cartItems.reduce((a, c) => a + c.quantity * c.price, 0);
	const remaining = Math.max(FREE_SHIPPING_GOAL - itemsPrice, 0);
	const progress = Math.min((itemsPrice / FREE_SHIPPING_GOAL) * 100, 100);

	return (
		<Drawer anchor="right" open={isOpen} onClose={onClose} classes={{ paper: 'basket-drawer-paper' }}>
			<Box className="basket">
				{/* ── HEADER ── */}
				<Box className="basket__header">
					<Box className="basket__header-left">
						<ShoppingCartIcon className="basket__header-icon" />
						<Typography className="basket__title">MY CART</Typography>
						<span className="basket__count">{cartItems.reduce((total, item) => total + item.quantity, 0)} items</span>
					</Box>
					<IconButton className="basket__close-btn" onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</Box>

				{/* ── BODY ── */}
				<Box className="basket__body">
					{cartItems.length === 0 ? (
						<Box className="basket__empty">
							<div className="basket__empty-icon">
								<SadBagSVG />
							</div>
							<Typography className="basket__empty-title">No products in the cart.</Typography>
							<Typography className="basket__empty-subtitle">
								Your cart is currently empty. Let us help you find the perfect item!
							</Typography>
							<Button
								className="basket__btn basket__btn--outline"
								onClick={() => {
									onClose();
									if (router.pathname !== '/product') {
										router.push('/product');
									}
								}}
								disableRipple
							>
								Continue Shopping
							</Button>
						</Box>
					) : (
						<Box className="basket__items">
							{cartItems.map((item) => (
								<Box key={item.size ? `${item._id}_${item.size}` : item._id} className="basket__item">
									<img className="basket__item-img" src={`${item.image}`} alt={item.name} />
									<Box className="basket__item-info">
										<Typography className="basket__item-name">{item.name}</Typography>

										{/* ── SIZE + COLOR BADGES ── */}
										{(item.size || item.color) && (
											<div className="basket__item-badges">
												{item.size && <span className="basket__item-size">{formatSize(item.size)}</span>}
												{item.color && (
													<span className="basket__item-color">
														<span
															className="basket__item-color-dot"
															style={{ backgroundColor: item.color.toLowerCase() }}
														/>
														{item.color}
													</span>
												)}
											</div>
										)}

										<Typography className="basket__item-price">
											{item.quantity} × <strong>₩{krw.format(item.price)}</strong>
										</Typography>
										<Box className="basket__item-qty">
											<IconButton
												className="basket__qty-btn"
												size="small"
												onClick={() => removeFromCart(item._id, item.size, item.color)}
												disabled={item.quantity <= 1}
											>
												<RemoveIcon fontSize="small" />
											</IconButton>
											<Typography className="basket__qty-value">{item.quantity}</Typography>
											<IconButton className="basket__qty-btn" size="small" onClick={() => addToCart(item)}>
												<AddIcon fontSize="small" />
											</IconButton>
										</Box>
									</Box>
									<IconButton
										className="basket__item-delete"
										onClick={() => deleteFromCart(item._id, item.size, item.color)}
									>
										<DeleteOutlineIcon />
									</IconButton>
								</Box>
							))}
						</Box>
					)}
				</Box>

				{/* ── FOOTER ── */}
				{cartItems.length > 0 && (
					<Box className="basket__footer">
						<Box className="basket__subtotal">
							<Typography className="basket__subtotal-label">SUBTOTAL:</Typography>
							<Typography className="basket__subtotal-value">₩{krw.format(itemsPrice)}</Typography>
						</Box>

						<div className="basket__divider" />

						<Box className="basket__shipping">
							<Typography className="basket__shipping-text">
								{remaining > 0 ? (
									<>
										Buy <strong>₩{krw.format(remaining)}</strong> more to get <strong>Free Shipping</strong>
									</>
								) : (
									<strong className="basket__shipping-achieved">🎉 You've unlocked Free Shipping!</strong>
								)}
							</Typography>
							<div className="basket__progress-wrap">
								<div className="basket__progress-track">
									<div className="basket__progress-fill" style={{ width: `${progress}%` }} />
								</div>
								<div className="basket__progress-truck" style={{ left: `${Math.max(progress, 4)}%` }}>
									<TruckSVG />
								</div>
							</div>
						</Box>

						<Button
							className="basket__btn basket__btn--outline"
							fullWidth
							disableRipple
							onClick={() => {
								onClose();
								router.push('/cart');
							}}
						>
							View Cart
						</Button>

						<Button
							className="basket__btn basket__btn--primary"
							fullWidth
							disableRipple
							onClick={() => {
								onClose();
								router.push('/checkout');
							}}
						>
							Checkout
						</Button>

						{/* <Button className="basket__btn basket__btn--danger" fullWidth disableRipple onClick={() => clearCart()}>
							Clear Cart
						</Button> */}
					</Box>
				)}
			</Box>
		</Drawer>
	);
}
