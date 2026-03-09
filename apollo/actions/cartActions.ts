import { cartVar, CartItem } from '../store';

/* ── UNIQUE KEY: same product, different size OR color = different entries ── */
const cartKey = (id: string, size?: string, color?: string) => [id, size, color].filter(Boolean).join('_');

/* ── UPDATE LOCAL STORAGE AND REACTIVE VAR ── */
const persistCart = (cart: CartItem[]) => {
	cartVar(cart);
	if (typeof window !== 'undefined') {
		localStorage.setItem('cart', JSON.stringify(cart));
	}
};

/* ── ADD ITEM ── */
export const addToCart = (item: CartItem) => {
	const cart = cartVar();
	const key = cartKey(item._id, item.size, item.color);
	const exist = cart.find((x) => cartKey(x._id, x.size, x.color) === key);

	if (exist) {
		persistCart(cart.map((x) => (cartKey(x._id, x.size, x.color) === key ? { ...x, quantity: x.quantity + 1 } : x)));
	} else {
		persistCart([...cart, { ...item, quantity: 1 }]);
	}
};

/* ── DECREASE ONE ITEM ── */
export const decreaseCart = (id: string, size?: string, color?: string) => {
	const cart = cartVar();
	const key = cartKey(id, size, color);
	const exist = cart.find((x) => cartKey(x._id, x.size, x.color) === key);

	if (!exist) return;

	if (exist.quantity === 1) {
		persistCart(cart.filter((x) => cartKey(x._id, x.size, x.color) !== key));
	} else {
		persistCart(cart.map((x) => (cartKey(x._id, x.size, x.color) === key ? { ...x, quantity: x.quantity - 1 } : x)));
	}
};

/* ── REMOVE SPECIFIC ITEM (1 QUANTITY) ── */
export const removeFromCart = (id: string, size?: string, color?: string) => {
	decreaseCart(id, size, color);
};

/* ── INCREASE ITEM ── */
export const increaseCart = (id: string, size?: string, color?: string) => {
	const cart = cartVar();
	const key = cartKey(id, size, color);
	persistCart(cart.map((x) => (cartKey(x._id, x.size, x.color) === key ? { ...x, quantity: x.quantity + 1 } : x)));
};

/* ── DELETE ITEM COMPLETELY ── */
export const deleteFromCart = (id: string, size?: string, color?: string) => {
	const key = cartKey(id, size, color);
	persistCart(cartVar().filter((x) => cartKey(x._id, x.size, x.color) !== key));
};

/* ── CLEAR ENTIRE CART ── */
export const clearCart = () => {
	persistCart([]);
};
